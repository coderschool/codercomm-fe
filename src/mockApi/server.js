import { createServer, Response } from 'miragejs';
import { users, posts, comments, friendships, reactions } from './data';

/**
 * Configures and starts the MirageJS mock server.
 * Again, learners: Treat this as a black box! Just ensure it's created correctly.
 * It defines API endpoints (like /api/auth/login, /api/posts, etc.)
 * and determines what data to return when the frontend requests it.
 */
export function mockServer({ environment = 'development' } = {}) {
  // Ensure data arrays are mutable for in-memory updates
  let currentPosts = [...posts];
  let currentComments = [...comments];
  let currentReactions = [...reactions];
  let currentFriendships = [...friendships];
  let currentUsers = [...users]; // Added for potential registration simulation

  return createServer({
    environment,

    routes() {
      // Namespace for all API routes
      this.namespace = 'api';
      // Delay all responses by 300ms to simulate network latency
      this.timing = 300;

      // --- Authentication Routes ---
      // LOGIN: Always logs in as 'user1' if email matches. Ignores password for simplicity.
      this.post('/auth/login', (schema, request) => {
        const { email /*, password */ } = JSON.parse(request.requestBody);
        // Use currentUsers for consistency, although it's static here
        const user = currentUsers.find(u => u.email === email); 

        if (user && user._id === "user1") { // Simplify: only allow login as user1 for demo
          console.log(`🔶 Mock Login Success: ${email}`);
          // Simulate fetching full user data (with counts) on login
          const userPosts = currentPosts.filter(post => post.author._id === "user1");
          const userFriends = currentFriendships.filter(
            fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
          );
          const fullUser = {
             ...user, 
             postCount: userPosts.length,
             friendCount: userFriends.length
          };
          return {
            user: fullUser, // Return full user object
            accessToken: `mock-token-for-${user._id}-${Date.now()}` // Generate a fake token
          };
        } else {
          console.log(`🔶 Mock Login Failed: ${email}`);
          return new Response(401, {}, { message: 'Invalid credentials or user not allowed in mock' });
        }
      });
      
      // REGISTER: Simulates creating a new user (but returns an error as configured)
      this.post('/users', (schema, request) => {
         console.log("🔶 Mock Register Attempt (will fail):", JSON.parse(request.requestBody).email);
         return new Response(400, {}, { message: 'Mock registration is disabled. Please use the Login page instead for this demo.' });
         /* // Example if registration was enabled:
         const { name, email, password } = JSON.parse(request.requestBody);
         const newUser = {
           _id: `user-${Date.now()}`,
           username: email.split('@')[0].slice(0, 15), // Limit username length
           name: name,
           email: email,
           // Important: Do NOT store plain passwords, even in mock data
           avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
           coverUrl: `https://picsum.photos/seed/${Date.now()}/800/200`,
           aboutMe: "", city: "", country: "", company: "", jobTitle: "",
           facebookLink: "", instagramLink: "", linkedinLink: "", twitterLink: "",
           createdAt: new Date().toISOString(),
           postCount: 0, friendCount: 0 // Initial counts
         };
         currentUsers.push(newUser); // Add to our mutable array
         console.log("🔶 Mock Register Success:", email);
         return {
           user: newUser,
           accessToken: `mock-token-for-${newUser._id}-${Date.now()}`
         };
         */
      });

      // --- User Routes ---
      // GET CURRENT USER: Returns details for 'user1'
      this.get('/users/me', () => {
        console.log("🔶 Mock Get Current User (user1)");
        const user = currentUsers.find(u => u._id === "user1");
        if (!user) return new Response(404, {}, { message: 'User not found' });

        // Add dynamic counts
        const userPosts = currentPosts.filter(post => post.author._id === "user1");
        const userFriends = currentFriendships.filter(
          fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
        );

        return {
          ...user, // Return a copy
          postCount: userPosts.length,
          friendCount: userFriends.length
        };
      });

      // GET USER BY ID: Returns details for a specific user
      this.get('/users/:id', (schema, request) => {
        const { id } = request.params;
        console.log(`🔶 Mock Get User By ID: ${id}`);
        const user = currentUsers.find(u => u._id === id);

        if (!user) {
          return new Response(404, {}, { message: 'User not found' });
        }

        // Add dynamic counts
        const userPosts = currentPosts.filter(post => post.author._id === id);
        const userFriends = currentFriendships.filter(
          fs => (fs.from === id || fs.to === id) && fs.status === 'accepted'
        );

        return {
          ...user, // Return a copy
          postCount: userPosts.length,
          friendCount: userFriends.length
        };
      });

      // GET USERS LIST (supports search & pagination)
      this.get('/users', (schema, request) => {
        const { name = '', page = 1, limit = 10 } = request.queryParams;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        console.log(`🔶 Mock Get Users List: name='${name}', page=${pageNum}, limit=${limitNum}`);

        let filteredUsers = currentUsers.filter(
          user => user.name.toLowerCase().includes(name.toLowerCase())
        );

        const totalUsers = filteredUsers.length;
        const totalPages = Math.ceil(totalUsers / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedUsers = filteredUsers.slice(start, end);

        // Add friendship status relative to user1
        const results = paginatedUsers.map(user => {
          const friendship = currentFriendships.find(
            fs => (fs.from === "user1" && fs.to === user._id) ||
                  (fs.to === "user1" && fs.from === user._id)
          );
          // Return only necessary fields + friendship status
          return { 
            _id: user._id,
            name: user.name,
            username: user.username,
            avatarUrl: user.avatarUrl,
            friendship: friendship || null 
          }; 
        });

        return {
          users: results,
          count: totalUsers,
          totalPages: totalPages
        };
      });
      
      // UPDATE USER PROFILE (Only allows updating user1 in this mock)
      this.put('/users/me', (schema, request) => {
          const updatedData = JSON.parse(request.requestBody);
          console.log(`🔶 Mock Update User Profile (user1):`, updatedData);
          const userIndex = currentUsers.findIndex(u => u._id === "user1");
          if (userIndex > -1) {
            // Update in-memory data (won't persist refresh)
            // Only update allowed fields
            const allowedUpdates = { 
               name: updatedData.name, 
               aboutMe: updatedData.aboutMe,
               avatarUrl: updatedData.avatarUrl,
               coverUrl: updatedData.coverUrl,
               city: updatedData.city,
               country: updatedData.country,
               company: updatedData.company,
               jobTitle: updatedData.jobTitle,
            };
            currentUsers[userIndex] = { ...currentUsers[userIndex], ...allowedUpdates };
            // Refetch counts as they are not part of the update payload
            const userPosts = currentPosts.filter(post => post.author._id === "user1");
            const userFriends = currentFriendships.filter(
                fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
            );
            return { 
                ...currentUsers[userIndex],
                postCount: userPosts.length,
                friendCount: userFriends.length
            }; // Return the merged data with counts
          }
          return new Response(404, {}, { message: 'User not found' });
      });


      // --- Post Routes ---
      // GET FEED POSTS (for user1, includes friends posts, paginated)
      this.get('/posts', (schema, request) => {
        const { page = 1, limit = 5 } = request.queryParams;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        console.log(`🔶 Mock Get Feed Posts (user1): page=${pageNum}, limit=${limitNum}`);

        // Get user1's accepted friends
        const userFriendships = currentFriendships.filter(
          fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
        );
        const friendIds = userFriendships.map(fs => fs.from === "user1" ? fs.to : fs.from);
        const relevantUserIds = ["user1", ...friendIds];

        // Filter posts by author (user1 or friends) using the current in-memory posts
        let relevantPosts = currentPosts.filter(post => relevantUserIds.includes(post.author._id));

        // Sort by creation date, newest first
        relevantPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalPosts = relevantPosts.length;
        const totalPages = Math.ceil(totalPosts / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedPosts = relevantPosts.slice(start, end);

        // Add comment counts and reactions to each post
        const results = paginatedPosts.map(post => {
          const postComments = currentComments.filter(comment => comment.post === post._id);
          const postReactions = currentReactions.filter(reaction =>
            reaction.targetType === 'Post' && reaction.targetId === post._id
          );
          return {
            ...post, // Return copy of post data
            commentCount: postComments.length,
            reactions: postReactions // Attach the actual reactions array
          };
        });

        return {
          posts: results,
          count: totalPosts,
          totalPages: totalPages
        };
      });

      // GET POSTS BY USER ID (paginated)
      this.get('/posts/user/:userId', (schema, request) => {
        const { userId } = request.params;
        const { page = 1, limit = 5 } = request.queryParams;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        console.log(`🔶 Mock Get Posts By User: userId=${userId}, page=${pageNum}, limit=${limitNum}`);

        let userPosts = currentPosts.filter(post => post.author._id === userId);

        // Sort by creation date, newest first
        userPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalPosts = userPosts.length;
        const totalPages = Math.ceil(totalPosts / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedPosts = userPosts.slice(start, end);

        // Add comment counts and reactions
        const results = paginatedPosts.map(post => {
          const postComments = currentComments.filter(comment => comment.post === post._id);
          const postReactions = currentReactions.filter(reaction =>
            reaction.targetType === 'Post' && reaction.targetId === post._id
          );
          return {
            ...post, // Return copy
            commentCount: postComments.length,
            reactions: postReactions
          };
        });

        return {
          posts: results,
          count: totalPosts,
          totalPages: totalPages
        };
      });

      // CREATE POST (as user1)
      this.post('/posts', (schema, request) => {
        const { content, image = null } = JSON.parse(request.requestBody);
        console.log(`🔶 Mock Create Post (user1): content="${content.substring(0, 20)}..."`);
        const currentUser = currentUsers.find(u => u._id === "user1");
        if (!currentUser) return new Response(401, {}, { message: 'Unauthorized' });

        const newPost = {
          _id: `post-${Date.now()}`,
          content,
          image,
          author: { // Embed author details
            _id: currentUser._id,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: [], // Start with empty reactions
          commentCount: 0 // Start with 0 comments
        };

        // Add to in-memory array (prepends to the start)
        currentPosts.unshift(newPost);

        return newPost; // Return the created post
      });
      
      // DELETE POST (Allows user1 to delete their own posts)
      this.delete('/posts/:postId', (schema, request) => {
        const { postId } = request.params;
        console.log(`🔶 Mock Delete Post: postId=${postId}`);
        const index = currentPosts.findIndex(p => p._id === postId);
        
        // Basic check: Only allow user1 to delete their own posts in mock
        if (index > -1 && currentPosts[index].author._id === "user1") {
            const deletedPost = currentPosts.splice(index, 1)[0]; // Remove and get the post
            // Also remove related reactions
            currentReactions = currentReactions.filter(r => !(r.targetType === 'Post' && r.targetId === postId));
            // Also remove related comments
            currentComments = currentComments.filter(c => c.post !== postId);
            console.log(' -> Post deleted successfully along with related reactions/comments.');
            return new Response(204); // No Content
        } else if (index === -1) {
            return new Response(404, {}, { message: "Post not found" });
        } else {
            return new Response(403, {}, { message: "Forbidden: Cannot delete other users' posts in mock" });
        }
      });


      // --- Comment Routes ---
      // GET COMMENTS FOR A POST (paginated)
      this.get('/posts/:postId/comments', (schema, request) => {
        const { postId } = request.params;
        const { page = 1, limit = 3 } = request.queryParams;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        console.log(`🔶 Mock Get Comments: postId=${postId}, page=${pageNum}, limit=${limitNum}`);

        let postComments = currentComments.filter(comment => comment.post === postId);

        // Sort by creation date, newest first
        postComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalComments = postComments.length;
        const totalPages = Math.ceil(totalComments / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedComments = postComments.slice(start, end);

        // Add reactions to comments
        const results = paginatedComments.map(comment => {
          const commentReactions = currentReactions.filter(reaction =>
            reaction.targetType === 'Comment' && reaction.targetId === comment._id
          );
          return {
            ...comment, // Return copy
            reactions: commentReactions
          };
        });

        return {
          comments: results,
          count: totalComments,
          totalPages: totalPages
        };
      });

      // ADD COMMENT (as user1)
      this.post('/comments', (schema, request) => {
        const { content, postId } = JSON.parse(request.requestBody);
        console.log(`🔶 Mock Add Comment (user1): postId=${postId}, content="${content.substring(0, 20)}..."`);
        const currentUser = currentUsers.find(u => u._id === "user1");
        if (!currentUser) return new Response(401, {}, { message: 'Unauthorized' });

        const newComment = {
          _id: `comment-${Date.now()}`,
          content,
          post: postId, // Link to the post
          author: { // Embed author details
            _id: currentUser._id,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: [] // Start with empty reactions
        };

        // Add to in-memory array (prepends to start)
        currentComments.unshift(newComment);
        
        // Also update commentCount on the related post (in-memory)
        const postIndex = currentPosts.findIndex(p => p._id === postId);
        if (postIndex > -1) {
            // Ensure commentCount exists before incrementing
            currentPosts[postIndex].commentCount = (currentPosts[postIndex].commentCount || 0) + 1;
        }

        return newComment; // Return the created comment
      });


      // --- Reaction Routes ---
      // ADD/UPDATE/REMOVE REACTION (as user1)
      this.post('/reactions', (schema, request) => {
        const { targetType, targetId, emoji } = JSON.parse(request.requestBody);
        console.log(`🔶 Mock Reaction (user1): type=${targetType}, id=${targetId}, emoji=${emoji}`);
        const currentUser = currentUsers.find(u => u._id === "user1");
        if (!currentUser) return new Response(401, {}, { message: 'Unauthorized' });

        // Find if user1 already reacted to this target
        const existingReactionIndex = currentReactions.findIndex(reaction =>
          reaction.targetType === targetType &&
          reaction.targetId === targetId &&
          reaction.author._id === currentUser._id
        );

        if (existingReactionIndex !== -1) {
          // Existing reaction found
          if (currentReactions[existingReactionIndex].emoji === emoji) {
            // Same emoji clicked again: remove reaction (toggle off)
            console.log(` -> Removing reaction`);
            currentReactions.splice(existingReactionIndex, 1);
          } else {
            // Different emoji clicked: update reaction
            console.log(` -> Updating reaction emoji`);
            currentReactions[existingReactionIndex].emoji = emoji;
          }
        } else {
          // No existing reaction: add new reaction
          console.log(` -> Adding new reaction`);
          currentReactions.push({
            _id: `reaction-${Date.now()}`,
            targetType,
            targetId,
            emoji,
            author: { // Embed author details
              _id: currentUser._id,
              name: currentUser.name,
              avatarUrl: currentUser.avatarUrl
            },
            createdAt: new Date().toISOString()
          });
        }

        // Return all current reactions for the target
        // This simulates what a real API might return to update the UI
        return currentReactions.filter(reaction =>
          reaction.targetType === targetType && reaction.targetId === targetId
        );
      });


      // --- Friendship Routes (User1's perspective) ---
      // GET FRIENDS LIST (accepted friends of user1, paginated)
      this.get('/friends', (schema, request) => {
        const { name = '', page = 1, limit = 10 } = request.queryParams;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        console.log(`🔶 Mock Get Friends List (user1): name='${name}', page=${pageNum}, limit=${limitNum}`);

        const userFriendships = currentFriendships.filter(
          fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
        );
        const friendIds = userFriendships.map(fs => fs.from === "user1" ? fs.to : fs.from);
        let friendUsers = currentUsers.filter(user => friendIds.includes(user._id));

        // Filter by name if provided
        if (name) {
          friendUsers = friendUsers.filter(
            user => user.name.toLowerCase().includes(name.toLowerCase())
          );
        }

        const totalFriends = friendUsers.length;
        const totalPages = Math.ceil(totalFriends / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedFriends = friendUsers.slice(start, end);

        // Add the friendship object itself for context if needed
        const results = paginatedFriends.map(user => {
            const friendship = currentFriendships.find(
                fs => ((fs.from === "user1" && fs.to === user._id) || (fs.to === "user1" && fs.from === user._id)) && fs.status === 'accepted'
            );
             // Return only necessary fields + friendship status
             return { 
                 _id: user._id,
                 name: user.name,
                 username: user.username,
                 avatarUrl: user.avatarUrl,
                 friendship: friendship || null 
             }; 
        });

        return {
          users: results, // Renamed from 'friends' to 'users' for consistency
          count: totalFriends,
          totalPages: totalPages
        };
      });

      // GET INCOMING FRIEND REQUESTS (requests sent TO user1)
      this.get('/friends/requests/incoming', (schema, request) => {
        // Note: Pagination params often not needed for request lists, but included for consistency
        const { name = '', page = 1, limit = 100 } = request.queryParams; 
        console.log(`🔶 Mock Get Incoming Requests (for user1): name='${name}'`);

        let incomingRequests = currentFriendships.filter(
          fs => fs.to === "user1" && fs.status === "pending"
        );

        // Map to required format, embedding requester user info
        let formattedRequests = incomingRequests.map(friendship => {
          const requester = currentUsers.find(user => user._id === friendship.from);
          // Return slim requester info
          const slimRequester = requester ? { _id: requester._id, name: requester.name, avatarUrl: requester.avatarUrl } : null;
          return {
            ...friendship, // Copy friendship details
            requester: slimRequester
          };
        }).filter(req => req.requester); // Filter out any requests where requester wasn't found

        // Filter by requester name if provided
        if (name) {
          formattedRequests = formattedRequests.filter(req =>
            req.requester.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Simple pagination for consistency (usually lists are short)
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const totalRequests = formattedRequests.length;
        const totalPages = Math.ceil(totalRequests / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedRequests = formattedRequests.slice(start, end);


        return {
          requests: paginatedRequests,
          count: totalRequests,
          totalPages: totalPages
        };
      });

      // GET OUTGOING FRIEND REQUESTS (requests sent BY user1)
      this.get('/friends/requests/outgoing', (schema, request) => {
        const { name = '', page = 1, limit = 100 } = request.queryParams;
        console.log(`🔶 Mock Get Outgoing Requests (from user1): name='${name}'`);

        let outgoingRequests = currentFriendships.filter(
          fs => fs.from === "user1" && fs.status === "pending"
        );

        // Map embedding recipient info
        let formattedRequests = outgoingRequests.map(friendship => {
          const recipient = currentUsers.find(user => user._id === friendship.to);
          // Return slim recipient info
           const slimRecipient = recipient ? { _id: recipient._id, name: recipient.name, avatarUrl: recipient.avatarUrl } : null;
          return {
            ...friendship, // Copy friendship details
            recipient: slimRecipient
          };
        }).filter(req => req.recipient); // Filter if recipient not found

        // Filter by recipient name
        if (name) {
          formattedRequests = formattedRequests.filter(req =>
            req.recipient.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Simple pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const totalRequests = formattedRequests.length;
        const totalPages = Math.ceil(totalRequests / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedRequests = formattedRequests.slice(start, end);


        return {
          requests: paginatedRequests,
          count: totalRequests,
          totalPages: totalPages
        };
      });

      // --- Friendship Action Routes (Simplified Success Responses) ---

      // SEND FRIEND REQUEST (from user1 to targetUserId)
      this.post('/friends/requests', (schema, request) => {
        const { to: targetUserId } = JSON.parse(request.requestBody);
        console.log(`🔶 Mock Send Friend Request: user1 -> ${targetUserId}`);
        
        if (targetUserId === "user1") { // Cannot friend yourself
             return new Response(400, {}, { message: "You cannot send a friend request to yourself." });
        }
        
        // Simulate adding a pending request (won't persist refresh)
        const existing = currentFriendships.find(fs => (fs.from === "user1" && fs.to === targetUserId) || (fs.to === "user1" && fs.from === targetUserId));
        if (!existing) {
            currentFriendships.push({
                _id: `friendship-${Date.now()}`,
                from: "user1",
                to: targetUserId,
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return { success: true, message: "Friend request sent." };
        } else if (existing.status === 'pending') {
             return new Response(400, {}, { message: "Friend request already pending." });
        } else if (existing.status === 'accepted') {
             return new Response(400, {}, { message: "You are already friends with this user." });
        } else {
             // Handle other statuses like declined/blocked if needed
             return new Response(400, {}, { message: "Cannot send friend request." });
        }
      });

      // ACCEPT/DECLINE FRIEND REQUEST (action on request where user1 is the recipient)
      // PUT /friends/requests/:requesterId?action=accept or action=decline
      this.put('/friends/requests/:requesterId', (schema, request) => {
        const { requesterId } = request.params;
        const { action } = request.queryParams; // 'accept' or 'decline'
        console.log(`🔶 Mock Action on Incoming Request: requester=${requesterId}, action=${action}`);
        const requestIndex = currentFriendships.findIndex(fs => fs.from === requesterId && fs.to === "user1" && fs.status === 'pending');

        if (requestIndex > -1) {
            if (action === 'accept') {
                currentFriendships[requestIndex].status = 'accepted';
                currentFriendships[requestIndex].updatedAt = new Date().toISOString();
                // Return the updated friendship record
                return { ...currentFriendships[requestIndex] }; 
            } else if (action === 'decline') {
                // Could change status to 'declined' or just remove it
                currentFriendships.splice(requestIndex, 1); 
                // Return success or maybe the ID of the removed request
                return { success: true, message: "Friend request declined." }; 
            } else {
                 return new Response(400, {}, { message: "Invalid action." });
            }
        } else {
            return new Response(404, {}, { message: "Incoming friend request not found or already handled." });
        }
      });

      // CANCEL FRIEND REQUEST (action on request sent BY user1)
      // DELETE /friends/requests/:recipientId
      this.delete('/friends/requests/:recipientId', (schema, request) => {
        const { recipientId } = request.params;
        console.log(`🔶 Mock Cancel Outgoing Request: user1 -> ${recipientId}`);
        const requestIndex = currentFriendships.findIndex(fs => fs.from === "user1" && fs.to === recipientId && fs.status === 'pending');

        if (requestIndex > -1) {
            currentFriendships.splice(requestIndex, 1); // Remove the pending request
            return new Response(204); // No Content is appropriate for successful delete
        } else {
            return new Response(404, {}, { message: "Outgoing friend request not found." });
        }
      });
      
      // UNFRIEND USER
      // DELETE /friends/:friendId
      this.delete('/friends/:friendId', (schema, request) => {
        const { friendId } = request.params;
         console.log(`🔶 Mock Unfriend: user1 <-> ${friendId}`);
        const friendshipIndex = currentFriendships.findIndex(
            fs => ((fs.from === "user1" && fs.to === friendId) || (fs.to === "user1" && fs.from === friendId)) && fs.status === 'accepted'
        );

        if (friendshipIndex > -1) {
            currentFriendships.splice(friendshipIndex, 1); // Remove the friendship
            return new Response(204); // No Content
        } else {
            return new Response(404, {}, { message: "Friendship not found." });
        }
      });
      
      // Fallback for unhandled routes
      this.passthrough(); // Allows requests not handled by Mirage to pass through
      // Example: Allow requests to external APIs if needed
      // this.passthrough('https://api.example.com/**'); 
    }
  });
}