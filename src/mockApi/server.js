// src/mockApi/server.js
import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { users, posts, comments, friendships, reactions } from "./data";

/**
 * Configures and starts the MSW API server.
 * It defines API endpoints (like /api/auth/login, /api/posts, etc.)
 * and determines what data to return when the frontend requests it.
 */

// Initialize data storage with localStorage as persistent database
let db = {
  users: [...users],
  posts: [...posts],
  comments: [...comments],
  friendships: [...friendships],
  reactions: [...reactions],
};

// Load data from localStorage if available
const loadFromStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const storedData = localStorage.getItem("appData");
      if (storedData) {
        db = JSON.parse(storedData);
        console.log("📊 Data loaded from storage");
      }
    } catch (error) {
      console.error("❌ Error loading data from storage:", error);
      resetToDefaultData();
    }
  }
};

// Save current data to localStorage
const saveToStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem("appData", JSON.stringify(db));
    } catch (error) {
      console.error("❌ Error saving data to storage:", error);
    }
  }
};

// Reset to initial data
const resetToDefaultData = () => {
  db = {
    users: [...users],
    posts: [...posts],
    comments: [...comments],
    friendships: [...friendships],
    reactions: [...reactions],
  };
  saveToStorage();
  console.log("🔄 Data reset to defaults");
};

// Load data when the module initializes
loadFromStorage();

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
  // --- Authentication Routes ---
  http.post("/api/auth/login", async ({ request }) => {
    const { email } = await request.json();
    const user = db.users.find((u) => u.email === email);

    if (user && user._id === "user1") {
      console.log(`🔑 Login Success: ${email}`);
      // Get full user data with counts
      const userPosts = db.posts.filter((post) => post.author._id === "user1");
      const userFriends = db.friendships.filter(
        (fs) =>
          (fs.from === "user1" || fs.to === "user1") && fs.status === "accepted"
      );
      const fullUser = {
        ...user,
        postCount: userPosts.length,
        friendCount: userFriends.length,
      };

      return HttpResponse.json(
        {
          user: fullUser,
          accessToken: `token-for-${user._id}-${Date.now()}`,
        },
        { status: 200, delay: 300 }
      );
    } else {
      console.log(`❌ Login Failed: ${email}`);
      return HttpResponse.json(
        { message: "Invalid credentials" },
        { status: 401, delay: 300 }
      );
    }
  }),

  // --- User Routes ---
  http.get("/api/users/me", () => {
    console.log("👤 Get Current User (user1)");
    const user = findUser("user1");

    if (!user) {
      return HttpResponse.json(
        { message: "User not found" },
        { status: 404, delay: 300 }
      );
    }

    return HttpResponse.json({ ...user }, { status: 200, delay: 300 });
  }),

  http.get("/api/users/:id", ({ params }) => {
    const id = params.id;
    console.log(`👤 Get User: ${id}`);

    const user = findUser(id);
    if (!user) {
      return HttpResponse.json(
        { message: "User not found" },
        { status: 404, delay: 300 }
      );
    }

    // Add friend counts
    const userData = { ...user };
    userData.friendCount = db.friendships.filter(
      (f) => (f.from === id || f.to === id) && f.status === "accepted"
    ).length;
    userData.postCount = db.posts.filter((p) => p.author._id === id).length;

    return HttpResponse.json({ user: userData }, { status: 200, delay: 300 });
  }),

  http.get("/api/users", ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name") || "";

    console.log(`👥 Get Users List: name='${name}'`);

    let filteredUsers = name
      ? db.users.filter((u) =>
          u.name.toLowerCase().includes(name.toLowerCase())
        )
      : db.users;

    // Add friendship status relative to user1 (logged-in user)
    const currentUser = "user1";
    filteredUsers = filteredUsers.map((user) => {
      const rawFriendship = db.friendships.find(
        (f) =>
          (f.from === currentUser && f.to === user._id) ||
          (f.from === user._id && f.to === currentUser)
      );
      // Populate the friendship object using the helper
      const populatedFriendship = populateFriendshipUsers(rawFriendship);
      return { ...user, friendship: populatedFriendship }; // Use populated object
    });

    return HttpResponse.json(
      { users: filteredUsers, totalPages: 1, count: filteredUsers.length },
      { status: 200, delay: 300 }
    );
  }),

  // --- Post Routes ---
  http.get("/api/posts", () => {
    console.log(`📝 Get All Posts`);

    const currentUser = "user1"; // Logged in user
    const friends = db.friendships
      .filter(
        (f) =>
          f.status === "accepted" &&
          (f.from === currentUser || f.to === currentUser)
      )
      .map((f) => (f.from === currentUser ? f.to : f.from));
    const allowedAuthors = [currentUser, ...friends];

    let filteredPosts = db.posts.filter((p) =>
      allowedAuthors.includes(p.author._id)
    );

    // Add comment count and reactions
    filteredPosts = filteredPosts.map((post) => ({
      ...post,
      commentCount: db.comments.filter((c) => c.post === post._id).length,
      reactions: db.reactions.filter(
        (r) => r.targetType === "Post" && r.targetId === post._id
      ),
    }));

    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return HttpResponse.json(
      { posts: filteredPosts, totalPages: 1, count: filteredPosts.length },
      { status: 200, delay: 300 }
    );
  }),

  http.get("/api/posts/user/:userId", ({ params }) => {
    const userId = params.userId;
    console.log(`📝 Get Posts for User: ${userId}`);

    let userPosts = db.posts.filter((p) => p.author._id === userId);

    // Add counts/reactions
    userPosts = userPosts.map((post) => ({
      ...post,
      commentCount: db.comments.filter((c) => c.post === post._id).length,
      reactions: db.reactions.filter(
        (r) => r.targetType === "Post" && r.targetId === post._id
      ),
    }));

    userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return HttpResponse.json(
      { posts: userPosts, totalPages: 1, count: userPosts.length },
      { status: 200, delay: 300 }
    );
  }),

  http.post("/api/posts", async ({ request }) => {
    const { content, image } = await request.json();
    const currentUser = findUser("user1");
    console.log(`📝 Create Post: User=${currentUser?._id}`);

    if (!currentUser) {
      return HttpResponse.json(
        { message: "User not found" },
        { status: 401, delay: 300 }
      );
    }

    if (!content || content.trim().length === 0) {
      return HttpResponse.json(
        { message: "Post content cannot be empty" },
        { status: 400, delay: 300 }
      );
    }

    const newPost = {
      _id: `post-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      content: content.trim(),
      image: image || null, // Handle optional image
      author: {
        // Embed author details
        _id: currentUser._id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Add default reactions and commentCount for consistency
      reactions: [],
      commentCount: 0,
    };

    db.posts.unshift(newPost); // Add to beginning of the array
    saveToStorage(); // Save changes to storage
    console.log("  -> New post created:", newPost._id);

    return HttpResponse.json(newPost, { status: 200, delay: 300 });
  }),

  // --- Comment Routes ---
  http.get("/api/posts/:postId/comments", ({ params }) => {
    const postId = params.postId;
    console.log(`💬 Get Comments for Post: ${postId}`);

    let postComments = db.comments.filter((c) => c.post === postId);

    // Add reactions
    postComments = postComments.map((comment) => ({
      ...comment,
      reactions: db.reactions.filter(
        (r) => r.targetType === "Comment" && r.targetId === comment._id
      ),
    }));

    postComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Older first

    return HttpResponse.json(
      { comments: postComments, totalPages: 1, count: postComments.length },
      { status: 200, delay: 300 }
    );
  }),

  http.post("/api/posts/:postId/comments", async ({ request, params }) => {
    const postId = params.postId;
    const { content } = await request.json();
    const currentUser = findUser("user1");
    console.log(`💬 Create Comment: User=${currentUser._id}, Post=${postId}`);

    if (!content) {
      return HttpResponse.json(
        { message: "Comment content cannot be empty" },
        { status: 400, delay: 300 }
      );
    }

    const postExists = db.posts.some((p) => p._id === postId);
    if (!postExists) {
      return HttpResponse.json(
        { message: "Post not found" },
        { status: 404, delay: 300 }
      );
    }

    const newComment = {
      _id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      content,
      post: postId,
      author: {
        _id: currentUser._id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: [], // Start with empty reactions
    };

    db.comments.push(newComment); // Add to the comments collection
    saveToStorage(); // Save changes to storage
    console.log("  -> New comment added:", newComment._id);

    return HttpResponse.json(newComment, { status: 200, delay: 300 });
  }),

  // --- Reaction Routes ---
  http.post("/api/reactions", async ({ request }) => {
    const { targetType, targetId, emoji } = await request.json();
    const currentUser = findUser("user1");
    console.log(
      `👍 Reaction: User=${currentUser._id}, Type=${targetType}, ID=${targetId}, Emoji=${emoji}`
    );

    if (!["Post", "Comment"].includes(targetType) || !targetId || !emoji) {
      return HttpResponse.json(
        { message: "Invalid reaction request" },
        { status: 400, delay: 300 }
      );
    }

    // Find existing reaction by this user for this target
    const existingIndex = db.reactions.findIndex(
      (r) =>
        r.targetType === targetType &&
        r.targetId === targetId &&
        r.author._id === currentUser._id &&
        r.emoji === emoji // Match emoji for toggling specific reaction type
    );

    if (existingIndex > -1) {
      // User is removing their reaction (e.g., unliking)
      db.reactions.splice(existingIndex, 1);
      saveToStorage(); // Save changes to storage
      console.log(` -> Reaction removed`);
    } else {
      // Add new reaction
      const newReaction = {
        _id: `reaction-${Date.now()}`,
        targetType,
        targetId,
        emoji,
        author: {
          _id: currentUser._id,
          name: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
        },
        createdAt: new Date().toISOString(),
      };
      db.reactions.push(newReaction);
      saveToStorage(); // Save changes to storage
      console.log(` -> Reaction added`);
    }

    // Return all reactions for the target
    const updatedReactions = db.reactions.filter(
      (r) => r.targetType === targetType && r.targetId === targetId
    );

    return HttpResponse.json(updatedReactions, { status: 200, delay: 300 });
  }),

  // --- Friendship Routes (User1's perspective) ---
  http.get("/api/friends", ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name") || "";
    console.log(`👫 Get Friends: name='${name}'`);

    const currentUser = "user1";
    const friendIds = db.friendships
      .filter(
        (f) =>
          f.status === "accepted" &&
          (f.from === currentUser || f.to === currentUser)
      )
      .map((f) => (f.from === currentUser ? f.to : f.from));

    let friendUsers = db.users.filter((u) => friendIds.includes(u._id));

    if (name) {
      friendUsers = friendUsers.filter((u) =>
        u.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    return HttpResponse.json(
      { users: friendUsers, totalPages: 1, count: friendUsers.length },
      { status: 200, delay: 300 }
    );
  }),

  http.get("/api/friends/requests", () => {
    console.log(`🔔 Get All Requests`);
    const currentUser = "user1";

    // Incoming Requests Logic
    let incomingRaw = db.friendships.filter(
      (fs) => fs.to === currentUser && fs.status === "pending"
    );
    // Use helper to populate sender/receiver
    const incomingRequests = incomingRaw.map(populateFriendshipUsers);

    // Outgoing Requests Logic
    let outgoingRaw = db.friendships.filter(
      (fs) => fs.from === currentUser && fs.status === "pending"
    );
    // Use helper to populate sender/receiver
    const outgoingRequests = outgoingRaw.map(populateFriendshipUsers);

    return HttpResponse.json(
      { incoming: incomingRequests, outgoing: outgoingRequests },
      { status: 200, delay: 300 }
    );
  }),

  http.get("/api/friends/requests/incoming", ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name") || "";
    console.log(`📩 Get Incoming Requests: name='${name}'`);

    let incomingRequests = db.friendships.filter(
      (fs) => fs.to === "user1" && fs.status === "pending"
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

    return HttpResponse.json(
      {
        requests: incomingRequests,
        totalPages: 1,
        count: incomingRequests.length,
      },
      { status: 200, delay: 300 }
    );
  }),

  http.get("/api/friends/requests/outgoing", ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name") || "";
    console.log(`📤 Get Outgoing Requests: name='${name}'`);

    let outgoingRequests = db.friendships.filter(
      (fs) => fs.from === "user1" && fs.status === "pending"
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

    return HttpResponse.json(
      {
        requests: outgoingRequests,
        totalPages: 1,
        count: outgoingRequests.length,
      },
      { status: 200, delay: 300 }
    );
  }),

  // --- Friendship Action Routes ---
  http.post("/api/friends/requests", async ({ request }) => {
    const { to: targetUserId } = await request.json();
    console.log(`✉️ Send Friend Request: user1 -> ${targetUserId}`);

    if (targetUserId === "user1") {
      // Cannot friend yourself
      return HttpResponse.json(
        { message: "You cannot send a friend request to yourself." },
        { status: 400, delay: 300 }
      );
    }

    const existing = db.friendships.find(
      (fs) =>
        (fs.from === "user1" && fs.to === targetUserId) ||
        (fs.to === "user1" && fs.from === targetUserId)
    );

    if (!existing) {
      const newFriendshipRaw = {
        _id: `friendship-${Date.now()}`,
        from: "user1",
        to: targetUserId,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.friendships.push(newFriendshipRaw);
      saveToStorage(); // Save changes to storage
      // Return the populated new friendship object
      return HttpResponse.json(
        { friendship: populateFriendshipUsers(newFriendshipRaw) },
        { status: 200, delay: 300 }
      );
    } else if (existing.status === "pending") {
      return HttpResponse.json(
        { message: "Friend request already pending." },
        { status: 400, delay: 300 }
      );
    } else if (existing.status === "accepted") {
      return HttpResponse.json(
        { message: "You are already friends with this user." },
        { status: 400, delay: 300 }
      );
    } else {
      return HttpResponse.json(
        { message: "Cannot send friend request." },
        { status: 400, delay: 300 }
      );
    }
  }),

  http.put("/api/friends/requests/:requesterId", ({ params, request }) => {
    const { requesterId } = params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action"); // 'accept' or 'decline'

    console.log(
      `🤝 Action on Request: requester=${requesterId}, action=${action}`
    );

    const requestIndex = db.friendships.findIndex(
      (fs) =>
        fs.from === requesterId && fs.to === "user1" && fs.status === "pending"
    );

    if (requestIndex > -1) {
      if (action === "accept") {
        db.friendships[requestIndex].status = "accepted";
        db.friendships[requestIndex].updatedAt = new Date().toISOString();
        saveToStorage(); // Save changes to storage
        // Return the updated friendship record, populated
        return HttpResponse.json(
          {
            friendship: populateFriendshipUsers(db.friendships[requestIndex]),
          },
          { status: 200, delay: 300 }
        );
      } else if (action === "decline") {
        const declinedRequest = db.friendships.splice(requestIndex, 1)[0];
        saveToStorage(); // Save changes to storage
        // Return the ID of the declined/removed friendship
        return HttpResponse.json(
          { declinedFriendshipId: declinedRequest._id },
          { status: 200, delay: 300 }
        );
      } else {
        return HttpResponse.json(
          { message: "Invalid action." },
          { status: 400, delay: 300 }
        );
      }
    } else {
      return HttpResponse.json(
        { message: "Incoming friend request not found or already handled." },
        { status: 404, delay: 300 }
      );
    }
  }),

  http.delete("/api/friends/requests/:recipientId", ({ params }) => {
    const { recipientId } = params;
    console.log(`❌ Cancel Outgoing Request: user1 -> ${recipientId}`);

    const requestIndex = db.friendships.findIndex(
      (fs) =>
        fs.from === "user1" && fs.to === recipientId && fs.status === "pending"
    );

    if (requestIndex > -1) {
      db.friendships.splice(requestIndex, 1); // Remove the pending request
      saveToStorage(); // Save changes to storage
      return new HttpResponse(null, { status: 204, delay: 300 }); // No Content
    } else {
      return HttpResponse.json(
        { message: "Outgoing friend request not found." },
        { status: 404, delay: 300 }
      );
    }
  }),

  http.delete("/api/friends/:friendId", ({ params }) => {
    const { friendId } = params;
    console.log(`👋 Unfriend: user1 <-> ${friendId}`);

    const friendshipIndex = db.friendships.findIndex(
      (fs) =>
        ((fs.from === "user1" && fs.to === friendId) ||
          (fs.to === "user1" && fs.from === friendId)) &&
        fs.status === "accepted"
    );

    if (friendshipIndex > -1) {
      db.friendships.splice(friendshipIndex, 1); // Remove the friendship
      saveToStorage(); // Save changes to storage
      return new HttpResponse(null, { status: 204, delay: 300 }); // No Content
    } else {
      return HttpResponse.json(
        { message: "Friendship not found." },
        { status: 404, delay: 300 }
      );
    }
  }),

  // Reset data route (for development)
  http.post("/api/reset", () => {
    resetToDefaultData();
    return HttpResponse.json(
      { message: "Data reset to defaults" },
      { status: 200, delay: 300 }
    );
  }),
];

// Create and return the MSW browser server
const browserServer = setupWorker(...handlers);

export { browserServer };
