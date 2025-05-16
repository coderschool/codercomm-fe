// src/mockApi/server.js
import { delay, http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { users, posts, comments, friendships, reactions } from "./data";
import { SignJWT } from "jose";
import { MOCK_JWT_SECRET } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";
import { extractJWT, generateApiResponse } from "./utils";
import { withAuth } from "./middleware";

/**
 * Configures and starts the MSW API server.
 * It defines API endpoints (like /api/auth/login, /api/posts, etc.)
 * and determines what data to return when the frontend requests it.
 * Feel free to uncomment console.log statements to see the inner workings of the server.
 */

// Initialize data storage with localStorage as persistent database
let db = {
  users: [...users],
  posts: [...posts],
  comments: [...comments],
  friendships: [...friendships],
  reactions: [...reactions],
};

// Save current data to localStorage
const saveToStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem("codercomm-server-data", JSON.stringify(db));
    } catch (error) {
      console.error("❌ Error saving data to storage:", error);
    }
  }
};

// Helper to find user object by ID
const findUser = (userId) => db.users.find((u) => u._id === userId);

// Helper function to populate sender/receiver objects in a friendship/request
const populateFriendshipUsers = (friendship) => {
  if (!friendship) return null;
  const sender = findUser(friendship.from);
  const receiver = findUser(friendship.to);
  // Return a new object with sender/receiver fields, keeping original props
  return {
    ...friendship,
    sender: sender
      ? { _id: sender._id, name: sender.name, avatarUrl: sender.avatarUrl }
      : null,
    receiver: receiver
      ? {
          _id: receiver._id,
          name: receiver.name,
          avatarUrl: receiver.avatarUrl,
        }
      : null,
  };
};

// Define all API handlers
const handlers = [
  // --- Global delay to HTTP response ---
  http.all("*", async () => {
    await delay(250); // 250ms
  }),
  // --- Authentication Routes ---
  http.post("/api/auth/login", async ({ request }) => {
    try {
      const { email, password } = await request.json();
      // console.log(`🔑 Login Attempt: ${email} with password: ${password}`);
      const user = db.users.find((u) => u.email === email);

      if (!user) {
        return generateApiResponse({
          success: false,
          errors: ["User not found"],
          message: "User not found",
          status: 404,
        });
      }

      if (user.password !== password) {
        return generateApiResponse({
          success: false,
          errors: ["Invalid credentials"],
          message: "Invalid credentials",
          status: 401,
        });
      }

      // console.log(`🔑 Login Success: ${email}`);

      // Get full user data with counts
      const userPosts = db.posts.filter((post) => post.author === user._id);
      const userFriends = db.friendships.filter(
        (fs) =>
          (fs.from === user._id || fs.to === user._id) &&
          fs.status === "accepted"
      );

      const { password: userPassword, ...userData } = user; // Remove password from user data
      const fullUser = {
        ...userData,
        postCount: userPosts.length,
        friendCount: userFriends.length,
      };

      const accessToken = await new SignJWT({ _id: user._id })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(new Date())
        .setExpirationTime("1d")
        .sign(MOCK_JWT_SECRET);

      return generateApiResponse({
        success: true,
        data: {
          user: fullUser,
          accessToken,
        },
        message: "Login successfully",
        status: 200,
      });
    } catch (error) {
      console.error("❌ Error logging in:", error);
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to login",
        status: error.status || 500,
      });
    }
  }),

  // --- Post Routes ---
  http.get(
    "/api/posts",
    withAuth(async ({ request }) => {
      try {
        const accessToken = request.headers.get("Authorization").split(" ")[1];
        const payload = await extractJWT(accessToken);
        const currentUserId = payload._id;
        const friends = db.friendships
          .filter(
            (f) =>
              f.status === "ACCEPTED" &&
              (f.from === currentUserId || f.to === currentUserId)
          )
          .map((f) => (f.from === currentUserId ? f.to : f.from));
        const allowedAuthors = [currentUserId, ...friends];

        let filteredPosts = db.posts.filter((p) =>
          allowedAuthors.includes(p.author)
        );

        // Add comment count and reactions
        filteredPosts = filteredPosts.map((post) => {
          const author = db.users.find((u) => u._id === post.author);

          const postWithAuthor = {
            ...post,
            author: {
              _id: author._id,
              name: author.name,
              avatarUrl: author.avatarUrl,
            },
          };

          const reactions = db.reactions.filter(
            (r) => r.targetType === "POST" && r.targetId === post._id
          );

          const reactionsWithAuthor = reactions.map((r) => {
            const author = db.users.find((u) => u._id === r.author);
            return {
              ...r,
              author: {
                _id: author._id,
                name: author.name,
                avatarUrl: author.avatarUrl,
              },
            };
          });

          return {
            ...postWithAuthor,
            commentCount: db.comments.filter((c) => c.post === post._id).length,
            reactions: reactionsWithAuthor,
          };
        });

        filteredPosts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return generateApiResponse({
          success: true,
          data: {
            posts: filteredPosts,
            totalPages: 1,
            count: filteredPosts.length,
          },
          status: 200,
        });
      } catch (error) {
        console.error("❌ Error getting posts:", error);
        return generateApiResponse({
          success: false,
          errors: [error],
          message: error.message || "Failed to get posts",
          status: error.status || 500,
        });
      }
    })
  ),

  http.get(
    "/api/posts/user/:userId",
    withAuth(({ params, request }) => {
      try {
        const { userId } = params;

        const userExists = db.users.findIndex((u) => u._id === userId) > -1;

        if (!userExists) {
          return generateApiResponse({
            success: false,
            errors: ["User not found"],
            message: "User not found",
            status: 404,
          });
        }

        let userPosts = db.posts.filter((p) => p.author === userId);

        // Add counts/reactions
        userPosts = userPosts.map((post) => {
          const author = db.users.find((u) => u._id === post.author);

          const postWithAuthor = {
            ...post,
            author: {
              _id: author._id,
              name: author.name,
              avatarUrl: author.avatarUrl,
            },
          };

          const reactions = db.reactions.filter(
            (r) => r.targetType === "POST" && r.targetId === post._id
          );

          return {
            ...postWithAuthor,
            commentCount: db.comments.filter((c) => c.post === post._id).length,
            reactions,
          };
        });

        userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return generateApiResponse({
          success: true,
          data: { posts: userPosts, totalPages: 1, count: userPosts.length },
          status: 200,
        });
      } catch (error) {
        console.error(
          `❌ Error getting posts for user ${params.userId}:`,
          error
        );
        return generateApiResponse({
          success: false,
          errors: [error],
          message: error.message || "Failed to get user posts",
          status: error.status || 500,
        });
      }
    })
  ),

  http.post(
    "/api/posts",
    withAuth(async ({ request }) => {
      try {
        const accessToken = request.headers.get("Authorization").split(" ")[1];
        const { content, image } = await request.json();
        const payload = await extractJWT(accessToken);
        const currentUser = findUser(payload._id);

        if (!currentUser) {
          return generateApiResponse({
            success: false,
            errors: ["User not found"],
            message: "User not found",
            status: 401,
          });
        }

        if (!content || content.trim().length === 0) {
          return generateApiResponse({
            success: false,
            errors: ["Post content cannot be empty"],
            message: "Post content cannot be empty",
            status: 400,
          });
        }

        const newPost = {
          _id: uuidv4(),
          content: content.trim(),
          image: image || null,
          author: currentUser._id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),

          reactions: [],
          commentCount: 0,
        };

        db.posts.unshift(newPost);
        saveToStorage();
        // console.log("  -> New post created:", newPost._id);

        return generateApiResponse({
          success: true,
          data: {
            post: {
              ...newPost,
              author: {
                _id: currentUser._id,
                name: currentUser.name,
                avatarUrl: currentUser.avatarUrl,
              },
            },
          },
          message: "Post created successfully",
          status: 200,
        });
      } catch (error) {
        console.error("❌ Error creating post:", error);
        return generateApiResponse({
          success: false,
          errors: [error],
          message: error.message || "Failed to create post",
          status: error.status || 500,
        });
      }
    })
  ),

  // --- Comment Routes ---
  http.get("/api/posts/:postId/comments", ({ params }) => {
    try {
      const postId = params.postId;
      // console.log(`💬 Get Comments for Post: ${postId}`);

      let postComments = db.comments.filter((c) => c.post === postId);

      // Add reactions
      postComments = postComments.map((comment) => {
        const author = db.users.find((u) => u._id === comment.author);
        const reactions = db.reactions.filter(
          (r) => r.targetType === "COMMENT" && r.targetId === comment._id
        );

        const reactionsWithAuthor = reactions.map((r) => {
          const author = db.users.find((u) => u._id === r.author);
          return {
            ...r,
            author: {
              _id: author._id,
              name: author.name,
              avatarUrl: author.avatarUrl,
            },
          };
        });

        return {
          ...comment,
          author: {
            _id: author._id,
            name: author.name,
            avatarUrl: author.avatarUrl,
          },
          reactions: reactionsWithAuthor,
        };
      });

      postComments.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      ); // Older first

      return generateApiResponse({
        success: true,
        data: {
          comments: postComments,
          totalPages: 1,
          count: postComments.length,
        },
        status: 200,
      });
    } catch (error) {
      console.error(
        `❌ Error getting comments for post ${params.postId}:`,
        error
      );
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to get comments",
        status: error.status || 500,
      });
    }
  }),

  http.post("/api/posts/:postId/comments", async ({ request, params }) => {
    try {
      const postId = params.postId;
      const { content } = await request.json();
      const accessToken = request.headers.get("Authorization").split(" ")[1];
      const payload = await extractJWT(accessToken);
      const currentUser = findUser(payload._id);
      // console.log(`💬 Create Comment: User=${currentUser._id}, Post=${postId}`);

      if (!content) {
        return generateApiResponse({
          success: false,
          errors: ["Comment content cannot be empty"],
          message: "Comment content cannot be empty",
          status: 400,
        });
      }

      const postExists = db.posts.some((p) => p._id === postId);
      if (!postExists) {
        return generateApiResponse({
          success: false,
          errors: ["Post not found"],
          message: "Post not found",
          status: 404,
        });
      }

      const newComment = {
        _id: uuidv4(),
        content,
        post: postId,
        author: currentUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: [],
      };

      db.comments.push(newComment); // Add to the comments collection
      saveToStorage(); // Save changes to storage
      // console.log("  -> New comment added:", newComment._id);

      return generateApiResponse({
        success: true,
        data: newComment,
        message: "Comment added successfully",
        status: 200,
      });
    } catch (error) {
      console.error(
        `❌ Error creating comment for post ${params.postId}:`,
        error
      );
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to create comment",
        status: error.status || 500,
      });
    }
  }),

  // --- Reaction Routes ---
  http.post(
    "/api/reactions",
    withAuth(async ({ request }) => {
      try {
        const { targetType, targetId, emoji } = await request.json();
        const accessToken = request.headers.get("Authorization").split(" ")[1];
        const payload = await extractJWT(accessToken);
        const currentUser = findUser(payload._id);
        // console.log(
        //   `👍 Reaction: User=${currentUser._id}, Type=${targetType}, ID=${targetId}, Emoji=${emoji}`
        // );

        if (!["POST", "COMMENT"].includes(targetType) || !targetId || !emoji) {
          return generateApiResponse({
            success: false,
            errors: ["Invalid reaction request"],
            message: "Invalid reaction request",
            status: 400,
          });
        }

        // Find existing reaction by this user for this target
        const existingReactionIndex = db.reactions.findIndex(
          (r) =>
            r.targetType === targetType &&
            r.targetId === targetId &&
            r.author === currentUser._id
        );

        // Upsert reaction

        let updatedReaction;

        if (existingReactionIndex > -1) {
          const existingReaction = db.reactions[existingReactionIndex];

          if (existingReaction.emoji === emoji) {
            // User is removing their reaction (e.g., unliking)
            db.reactions.splice(existingReactionIndex, 1);
            updatedReaction = { ...existingReaction, emoji: null };
          } else {
            // User is changing their reaction (e.g., liking a different emoji)
            db.reactions[existingReactionIndex].emoji = emoji;
            updatedReaction = { ...existingReaction, emoji };
          }
        } else {
          // Add new reaction
          updatedReaction = {
            _id: uuidv4(),
            targetType,
            targetId,
            emoji,
            author: currentUser._id,
            createdAt: new Date().toISOString(),
          };
          db.reactions.push(updatedReaction);
        }

        saveToStorage();

        return generateApiResponse({
          success: true,
          data: {
            reaction: {
              ...updatedReaction,
              author: {
                _id: currentUser._id,
                name: currentUser.name,
                avatarUrl: currentUser.avatarUrl,
              },
            },
          },
          status: 200,
        });
      } catch (error) {
        console.error("❌ Error handling reaction:", error);
        return generateApiResponse({
          success: false,
          errors: [error],
          message: error.message || "Failed to handle reaction",
          status: error.status || 500,
        });
      }
    })
  ),

  // --- Friendship Routes (User1's perspective) ---
  http.get("/api/friends", async ({ request }) => {
    try {
      const url = new URL(request.url);
      const name = url.searchParams.get("name") || "";
      // console.log(`👫 Get Friends: name='${name}'`);

      const accessToken = request.headers.get("Authorization").split(" ")[1];
      const payload = await extractJWT(accessToken);
      const currentUserId = payload._id;

      const friendIds = db.friendships
        .filter(
          (f) =>
            f.status === "ACCEPTED" &&
            (f.from === currentUserId || f.to === currentUserId)
        )
        .map((f) => (f.from === currentUserId ? f.to : f.from));

      let friendUsers = db.users.filter((u) => friendIds.includes(u._id));

      if (name) {
        friendUsers = friendUsers.filter((u) =>
          u.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      return generateApiResponse({
        success: true,
        data: { users: friendUsers, totalPages: 1, count: friendUsers.length },
        status: 200,
      });
    } catch (error) {
      console.error("❌ Error getting friends:", error);
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to get friends",
        status: error.status || 500,
      });
    }
  }),

  http.get("/api/friends/requests", async ({ request }) => {
    try {
      // console.log(`🔔 Get All Requests`);
      const accessToken = request.headers.get("Authorization").split(" ")[1];
      const payload = await extractJWT(accessToken);
      const currentUserId = payload._id;

      // Incoming Requests Logic
      let incomingRaw = db.friendships.filter(
        (fs) => fs.to === currentUserId && fs.status === "PENDING"
      );
      // Use helper to populate sender/receiver
      const incomingRequests = incomingRaw.map(populateFriendshipUsers);

      // Outgoing Requests Logic
      let outgoingRaw = db.friendships.filter(
        (fs) => fs.from === currentUserId && fs.status === "PENDING"
      );
      // Use helper to populate sender/receiver
      const outgoingRequests = outgoingRaw.map(populateFriendshipUsers);

      return generateApiResponse({
        success: true,
        data: { incoming: incomingRequests, outgoing: outgoingRequests },
        status: 200,
      });
    } catch (error) {
      console.error("❌ Error getting friend requests:", error);
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to get friend requests",
        status: error.status || 500,
      });
    }
  }),

  http.get("/api/friends/requests/incoming", async ({ request }) => {
    try {
      const url = new URL(request.url);
      const name = url.searchParams.get("name") || "";
      // console.log(`📩 Get Incoming Requests: name='${name}'`);

      const accessToken = request.headers.get("Authorization").split(" ")[1];
      const payload = await extractJWT(accessToken);
      const currentUserId = payload._id;

      let incomingRequests = db.friendships.filter(
        (fs) => fs.to === currentUserId && fs.status === "PENDING"
      );

      // Populate requester info
      incomingRequests = incomingRequests.map((req) => ({
        ...req,
        requester: db.users.find((u) => u._id === req.from),
      }));

      if (name) {
        incomingRequests = incomingRequests.filter((req) =>
          req.requester?.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      return generateApiResponse({
        success: true,
        data: {
          requests: incomingRequests,
          totalPages: 1,
          count: incomingRequests.length,
        },
        status: 200,
      });
    } catch (error) {
      console.error("❌ Error getting incoming friend requests:", error);
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to get incoming friend requests",
        status: error.status || 500,
      });
    }
  }),

  http.get("/api/friends/requests/outgoing", async ({ request }) => {
    try {
      const url = new URL(request.url);
      const name = url.searchParams.get("name") || "";
      const accessToken = request.headers.get("Authorization").split(" ")[1];
      const payload = await extractJWT(accessToken);
      const currentUserId = payload._id;
      // console.log(`📤 Get Outgoing Requests: name='${name}'`);

      let outgoingRequests = db.friendships.filter(
        (fs) => fs.from === currentUserId && fs.status === "PENDING"
      );

      // Populate recipient info
      outgoingRequests = outgoingRequests.map((req) => ({
        ...req,
        recipient: db.users.find((u) => u._id === req.to),
      }));

      if (name) {
        outgoingRequests = outgoingRequests.filter((req) =>
          req.recipient?.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      return generateApiResponse({
        success: true,
        data: {
          requests: outgoingRequests,
          totalPages: 1,
          count: outgoingRequests.length,
        },
        status: 200,
      });
    } catch (error) {
      console.error("❌ Error getting outgoing friend requests:", error);
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to get outgoing friend requests",
        status: error.status || 500,
      });
    }
  }),

  // --- Friendship Action Routes ---
  http.post("/api/friends/requests", async ({ request }) => {
    try {
      const { to: targetUserId } = await request.json();
      // console.log(`✉️ Send Friend Request: user1 -> ${targetUserId}`);

      const accessToken = request.headers.get("Authorization").split(" ")[1];
      const payload = await extractJWT(accessToken);
      const currentUserId = payload._id;

      if (targetUserId === currentUserId) {
        // Cannot friend yourself
        return generateApiResponse({
          success: false,
          errors: ["You cannot send a friend request to yourself."],
          message: "You cannot send a friend request to yourself.",
          status: 400,
        });
      }

      const existing = db.friendships.find(
        (fs) =>
          (fs.from === currentUserId && fs.to === targetUserId) ||
          (fs.to === currentUserId && fs.from === targetUserId)
      );

      if (!existing) {
        const newFriendshipRaw = {
          _id: uuidv4(),
          from: currentUserId,
          to: targetUserId,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.friendships.push(newFriendshipRaw);
        saveToStorage(); // Save changes to storage
        // Return the populated new friendship object
        return generateApiResponse({
          success: true,
          data: { friendship: populateFriendshipUsers(newFriendshipRaw) },
          message: "Friend request sent successfully",
          status: 200,
        });
      }

      if (existing.status === "PENDING") {
        return generateApiResponse({
          success: false,
          errors: ["Friend request already pending."],
          message: "Friend request already pending.",
          status: 400,
        });
      }

      if (existing.status === "ACCEPTED") {
        return generateApiResponse({
          success: false,
          errors: ["You are already friends with this user."],
          message: "You are already friends with this user.",
          status: 400,
        });
      }

      return generateApiResponse({
        success: false,
        errors: ["Cannot send friend request."],
        message: "Cannot send friend request.",
        status: 400,
      });
    } catch (error) {
      console.error("❌ Error sending friend request:", error);
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to send friend request",
        status: error.status || 500,
      });
    }
  }),

  http.put(
    "/api/friends/requests/:requesterId",
    async ({ params, request }) => {
      try {
        const { requesterId } = params;
        const url = new URL(request.url);
        const action = url.searchParams.get("action"); // 'accept' or 'decline'
        const accessToken = request.headers.get("Authorization").split(" ")[1];
        const payload = await extractJWT(accessToken);
        const currentUserId = payload._id;

        // console.log(
        //   `👫 Action on Request: requester=${requesterId}, action=${action}`
        // );

        const requestIndex = db.friendships.findIndex(
          (fs) =>
            fs.from === requesterId &&
            fs.to === currentUserId &&
            fs.status === "PENDING"
        );

        if (requestIndex === -1) {
          return generateApiResponse({
            success: false,
            errors: ["Incoming friend request not found or already handled."],
            message: "Incoming friend request not found or already handled.",
            status: 404,
          });
        }

        if (action === "ACCEPT") {
          db.friendships[requestIndex].status = "ACCEPTED";
          db.friendships[requestIndex].updatedAt = new Date().toISOString();
          saveToStorage(); // Save changes to storage
          // Return the updated friendship record, populated
          return generateApiResponse({
            success: true,
            data: {
              friendship: populateFriendshipUsers(db.friendships[requestIndex]),
            },
            message: "Friend request accepted",
            status: 200,
          });
        }

        if (action === "DECLINE") {
          const declinedRequest = db.friendships.splice(requestIndex, 1)[0];
          saveToStorage(); // Save changes to storage
          // Return the ID of the declined/removed friendship
          return generateApiResponse({
            success: true,
            data: { declinedFriendshipId: declinedRequest._id },
            message: "Friend request declined",
            status: 200,
          });
        }

        return generateApiResponse({
          success: false,
          errors: ["Invalid action."],
          message: "Invalid action.",
          status: 400,
        });
      } catch (error) {
        console.error("❌ Error handling friend request action:", error);
        return generateApiResponse({
          success: false,
          errors: [error],
          message: error.message || "Failed to handle friend request action",
          status: error.status || 500,
        });
      }
    }
  ),

  http.delete(
    "/api/friends/requests/:recipientId",
    async ({ params, request }) => {
      try {
        const { recipientId } = params;
        const accessToken = request.headers.get("Authorization").split(" ")[1];
        const payload = await extractJWT(accessToken);
        const currentUserId = payload._id;
        // console.log(`❌ Cancel Outgoing Request: user1 -> ${recipientId}`);

        const requestIndex = db.friendships.findIndex(
          (fs) =>
            fs.from === currentUserId &&
            fs.to === recipientId &&
            fs.status === "PENDING"
        );

        if (requestIndex === -1) {
          return generateApiResponse({
            success: false,
            errors: ["Outgoing friend request not found."],
            message: "Outgoing friend request not found.",
            status: 404,
          });
        }

        db.friendships.splice(requestIndex, 1); // Remove the pending request
        saveToStorage(); // Save changes to storage

        return generateApiResponse({
          success: true,
          message: "Friend request cancelled",
          status: 204,
        });
      } catch (error) {
        console.error("❌ Error cancelling friend request:", error);
        return generateApiResponse({
          success: false,
          errors: [error],
          message: error.message || "Failed to cancel friend request",
          status: error.status || 500,
        });
      }
    }
  ),

  http.delete("/api/friends/:friendId", async ({ params, request }) => {
    try {
      const { friendId } = params;
      // console.log(`👋 Unfriend: user1 <-> ${friendId}`);

      const accessToken = request.headers.get("Authorization").split(" ")[1];
      const payload = await extractJWT(accessToken);
      const currentUserId = payload._id;

      const friendshipIndex = db.friendships.findIndex(
        (fs) =>
          ((fs.from === currentUserId && fs.to === friendId) ||
            (fs.to === currentUserId && fs.from === friendId)) &&
          fs.status === "ACCEPTED"
      );

      if (friendshipIndex === -1) {
        return generateApiResponse({
          success: false,
          errors: ["Friendship not found."],
          message: "Friendship not found.",
          status: 404,
        });
      }

      db.friendships.splice(friendshipIndex, 1); // Remove the friendship
      saveToStorage(); // Save changes to storage

      return generateApiResponse({
        success: true,
        message: "Friend removed successfully",
        status: 204,
      });
    } catch (error) {
      console.error("❌ Error removing friend:", error);
      return generateApiResponse({
        success: false,
        errors: [error],
        message: error.message || "Failed to remove friend",
        status: error.status || 500,
      });
    }
  }),
];

// Create and return the MSW browser server
const browserServer = setupWorker(...handlers);

// Initialize database on first visit
const initializeDatabase = () => {
  const storedData = localStorage.getItem("codercomm-server-data");
  if (!storedData) {
    console.log("📊 No data found: Initializing database in localStorage");
    saveToStorage();
  } else {
    const storedData = localStorage.getItem("codercomm-server-data");
    if (storedData) {
      db = JSON.parse(storedData);
      console.log("📊 Data loaded from storage");
    }
  }
};

// Call initialization when browser server starts
browserServer.start = async (options) => {
  await setupWorker(...handlers).start(options);
  initializeDatabase();
};

export { browserServer };
