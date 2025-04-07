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

  // Helper to find user object by ID
  const findUser = (userId) => currentUsers.find(u => u._id === userId);

  // Helper function to populate sender/receiver objects in a friendship/request
  const populateFriendshipUsers = (friendship) => {
    if (!friendship) return null;
    const sender = findUser(friendship.from); 
    const receiver = findUser(friendship.to);
    // Return a new object with sender/receiver fields, keeping original props
    return {
      ...friendship,
      sender: sender ? { _id: sender._id, name: sender.name, avatarUrl: sender.avatarUrl } : null,
      receiver: receiver ? { _id: receiver._id, name: receiver.name, avatarUrl: receiver.avatarUrl } : null,
    };
  };

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
      

      // --- User Routes ---
      // GET CURRENT USER: Returns details for 'user1'
      this.get('/users/me', () => {
        console.log("🔶 Mock Get Current User (user1)");
        const user = currentUsers.find(u => u._id === "user1");
        if (!user) return new Response(404, {}, { message: 'User not found' });
        return {
          ...user, // Return a copy
        };
      });

      // GET USER BY ID: Returns details for a specific user
      this.get('/users/:id', (schema, request) => {
        const id = request.params.id;
        console.log(`🔶 Mock Get User: ${id}`);
        const user = currentUsers.find(u => u._id === id);
        if (!user) return new Response(404, {}, { message: 'User not found' });
        // Add friend counts (mock)
        user.friendCount = currentFriendships.filter(f => (f.from === id || f.to === id) && f.status === 'accepted').length;
        user.postCount = currentPosts.filter(p => p.author._id === id).length;
        return { user };
      });

      this.get('/users', (schema, request) => {
        const { name = '' } = request.queryParams;
        console.log(`🔶 Mock Get Users List: name='${name}'`);
        let filteredUsers = name 
          ? currentUsers.filter(u => u.name.toLowerCase().includes(name.toLowerCase()))
          : currentUsers;
        
        // Add friendship status relative to user1 (mock logged-in user)
        const currentUser = 'user1'; // Assume user1 is logged in
        filteredUsers = filteredUsers.map(user => {
          const rawFriendship = currentFriendships.find(f => 
            ((f.from === currentUser && f.to === user._id) || (f.from === user._id && f.to === currentUser))
          );
          // Populate the friendship object using the helper
          const populatedFriendship = populateFriendshipUsers(rawFriendship);
          return { ...user, friendship: populatedFriendship }; // Use populated object
        });

        // Return ALL filtered users
        return { users: filteredUsers, totalPages: 1, count: filteredUsers.length }; 
      });
      

      // --- Post Routes ---
      // GET FEED POSTS (for user1, includes friends posts, paginated)
      this.get('/posts', (schema, request) => {
        console.log(`🔶 Mock Get All Posts`);
        const currentUser = 'user1'; // Assume user1 is logged in
        const friends = currentFriendships
            .filter(f => f.status === 'accepted' && (f.from === currentUser || f.to === currentUser))
            .map(f => (f.from === currentUser ? f.to : f.from));
        const allowedAuthors = [currentUser, ...friends];
        
        let filteredPosts = currentPosts.filter(p => allowedAuthors.includes(p.author._id));
        
        // Add comment count and reactions (mock)
        filteredPosts = filteredPosts.map(post => ({
          ...post,
          commentCount: currentComments.filter(c => c.post === post._id).length,
          reactions: currentReactions.filter(r => r.targetType === 'Post' && r.targetId === post._id)
        }));
        
        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Return ALL posts
        return { posts: filteredPosts, totalPages: 1, count: filteredPosts.length };
      });

      // GET POSTS BY USER ID (paginated)
      this.get('/posts/user/:userId', (schema, request) => {
        const userId = request.params.userId;
        console.log(`🔶 Mock Get Posts for User: ${userId}`);
        let userPosts = currentPosts.filter(p => p.author._id === userId);
        
        // Add counts/reactions
        userPosts = userPosts.map(post => ({
          ...post,
          commentCount: currentComments.filter(c => c.post === post._id).length,
          reactions: currentReactions.filter(r => r.targetType === 'Post' && r.targetId === post._id)
        }));
        
        userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Return ALL user posts
        return { posts: userPosts, totalPages: 1, count: userPosts.length }; 
      });

      // CREATE POST (as user1)
      this.post('/posts', (schema, request) => {
        const { content, image } = JSON.parse(request.requestBody);
        const currentUser = currentUsers.find(u => u._id === 'user1'); // Assume user1 is creator
        console.log(`🔶 Mock Create Post: User=${currentUser._id}`);
        if (!content) {
          return new Response(400, {}, { message: 'Post content is required' });
        }
        const newPost = {
          _id: `post-${Date.now()}`,
          content,
          image: image || null,
          author: { _id: currentUser._id, name: currentUser.name, avatarUrl: currentUser.avatarUrl },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        currentPosts.unshift(newPost); // Add to beginning of the array
        // Return the created post with added counts/reactions
        return { 
          ...newPost, 
          commentCount: 0, 
          reactions: [] 
        }; 
      });
      
      // DELETE POST (Allows user1 to delete their own posts)
      this.delete('/posts/:id', (schema, request) => {
        const postId = request.params.id;
        const currentUser = 'user1';
        const postIndex = currentPosts.findIndex(p => p._id === postId);
        console.log(`🔶 Mock Delete Post: ${postId}, User=${currentUser}`);
        if (postIndex === -1) {
          return new Response(404, {}, { message: 'Post not found' });
        }
        if (currentPosts[postIndex].author._id !== currentUser) {
           return new Response(403, {}, { message: 'User not authorized to delete this post' });
        }
        currentPosts.splice(postIndex, 1);
        // Also remove related comments and reactions
        const commentsToRemove = currentComments.filter(c => c.post === postId).map(c => c._id);
        currentComments = currentComments.filter(c => c.post !== postId);
        currentReactions = currentReactions.filter(r => 
          !(r.targetType === 'Post' && r.targetId === postId) &&
          !(r.targetType === 'Comment' && commentsToRemove.includes(r.targetId))
        );
        return new Response(204); // No content
      });


      // --- Comment Routes ---
      // GET COMMENTS FOR A POST (paginated)
      this.get('/posts/:postId/comments', (schema, request) => {
        const postId = request.params.postId;
        console.log(`🔶 Mock Get Comments for Post: ${postId}`);
        let postComments = currentComments.filter(c => c.post === postId);
        
        // Add reactions
        postComments = postComments.map(comment => ({
           ...comment,
           reactions: currentReactions.filter(r => r.targetType === 'Comment' && r.targetId === comment._id)
        }));
        
        postComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Older first
        
        // Return ALL comments
        return { comments: postComments, totalPages: 1, count: postComments.length }; 
      });

      // ADD COMMENT (as user1) to a specific post
      this.post('/posts/:postId/comments', (schema, request) => {
        const postId = request.params.postId; // Get postId from URL
        const { content } = JSON.parse(request.requestBody); // Get content from body
        const currentUser = currentUsers.find(u => u._id === 'user1'); // Assume user1 is creator
        console.log(`🔶 Mock Create Comment: User=${currentUser._id}, Post=${postId}`);
        
        if (!content) {
          return new Response(400, {}, { message: 'Comment content cannot be empty' });
        }
        
        const postExists = currentPosts.some(p => p._id === postId);
        if (!postExists) {
          return new Response(404, {}, { message: 'Post not found' });
        }
        
        const newComment = {
          _id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`, // More unique ID
          content,
          post: postId,
          author: { _id: currentUser._id, name: currentUser.name, avatarUrl: currentUser.avatarUrl },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: [] // Start with empty reactions
        };
        
        currentComments.push(newComment); // Add to the global list
        console.log("  -> New comment added:", newComment);
        
        // Return the created comment object
        return newComment; 
      });


      // --- Reaction Routes ---
      // ADD/UPDATE/REMOVE REACTION (as user1)
      this.post('/reactions', (schema, request) => {
        const { targetType, targetId, emoji } = JSON.parse(request.requestBody);
        const currentUser = currentUsers.find(u => u._id === 'user1'); // Assume user1
        console.log(`🔶 Mock Reaction: User=${currentUser._id}, Type=${targetType}, ID=${targetId}, Emoji=${emoji}`);
        
        if (!['Post', 'Comment'].includes(targetType) || !targetId || !emoji) {
           return new Response(400, {}, { message: 'Invalid reaction request' });
        }
        
        // Find existing reaction by this user for this target
        const existingIndex = currentReactions.findIndex(r => 
            r.targetType === targetType && 
            r.targetId === targetId && 
            r.author._id === currentUser._id &&
            r.emoji === emoji // Match emoji for toggling specific reaction type
        );

        if (existingIndex > -1) {
          // User is removing their reaction (e.g., unliking)
          currentReactions.splice(existingIndex, 1);
          console.log(` -> Reaction removed`);
        } else {
          // Add new reaction
          const newReaction = {
             _id: `reaction-${Date.now()}`,
             targetType,
             targetId,
             emoji,
             author: { _id: currentUser._id, name: currentUser.name, avatarUrl: currentUser.avatarUrl },
             createdAt: new Date().toISOString(),
          };
          currentReactions.push(newReaction);
          console.log(` -> Reaction added`);
        }
        
        // Return all reactions for the target (or could return success status)
        const updatedReactions = currentReactions.filter(r => r.targetType === targetType && r.targetId === targetId);
        return updatedReactions; 
      });


      // --- Friendship Routes (User1's perspective) ---
      // GET FRIENDS LIST (accepted friends of user1, paginated)
      this.get('/friends', (schema, request) => {
        const { name = '' } = request.queryParams;
        console.log(`🔶 Mock Get Friends (for user1): name='${name}'`);
        const currentUser = 'user1';
        const friendIds = currentFriendships
            .filter(f => f.status === 'accepted' && (f.from === currentUser || f.to === currentUser))
            .map(f => (f.from === currentUser ? f.to : f.from));
            
        let friendUsers = currentUsers.filter(u => friendIds.includes(u._id));
        
        if (name) {
            friendUsers = friendUsers.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
        }
        
        // Return ALL friends
        return { users: friendUsers, totalPages: 1, count: friendUsers.length }; 
      });

      // GET ALL FRIEND REQUESTS (combined incoming/outgoing for user1)
      this.get('/friends/requests', (schema, request) => {
        console.log(`🔶 Mock Get All Requests (for user1)`);
        const currentUser = 'user1';

        // Incoming Requests Logic
        let incomingRaw = currentFriendships.filter(
          fs => fs.to === currentUser && fs.status === "pending"
        );
        // Use helper to populate sender/receiver
        const incomingRequests = incomingRaw.map(populateFriendshipUsers);

        // Outgoing Requests Logic
        let outgoingRaw = currentFriendships.filter(
          fs => fs.from === currentUser && fs.status === "pending"
        );
        // Use helper to populate sender/receiver
        const outgoingRequests = outgoingRaw.map(populateFriendshipUsers);

        // Return combined object with populated users
        return { 
          incoming: incomingRequests, 
          outgoing: outgoingRequests 
        };
      });

      // GET INCOMING FRIEND REQUESTS (requests sent TO user1)
      // Note: This route might become redundant if the combined one is always used.
      this.get('/friends/requests/incoming', (schema, request) => {
        const { name = '' } = request.queryParams; 
        console.log(`🔶 Mock Get Incoming Requests (for user1): name='${name}'`);

        let incomingRequests = currentFriendships.filter(
          fs => fs.to === "user1" && fs.status === "pending"
        );
        
        // Populate requester info
        incomingRequests = incomingRequests.map(req => ({
          ...req,
          requester: currentUsers.find(u => u._id === req.from)
        }));
        
        if (name) {
           incomingRequests = incomingRequests.filter(req => req.requester?.name.toLowerCase().includes(name.toLowerCase()));
        }
        
        // Return ALL requests
        return { requests: incomingRequests, totalPages: 1, count: incomingRequests.length };
      });

      // GET OUTGOING FRIEND REQUESTS (requests sent BY user1)
      this.get('/friends/requests/outgoing', (schema, request) => {
        const { name = '' } = request.queryParams;
        console.log(`🔶 Mock Get Outgoing Requests (for user1): name='${name}'`);
        let outgoingRequests = currentFriendships.filter(
          fs => fs.from === "user1" && fs.status === "pending"
        );
        
        // Populate recipient info
        outgoingRequests = outgoingRequests.map(req => ({
          ...req,
          recipient: currentUsers.find(u => u._id === req.to)
        }));

         if (name) {
           outgoingRequests = outgoingRequests.filter(req => req.recipient?.name.toLowerCase().includes(name.toLowerCase()));
        }
        
        // Return ALL requests
        return { requests: outgoingRequests, totalPages: 1, count: outgoingRequests.length };
      });

      // --- Friendship Action Routes (Simplified Success Responses) ---

      // SEND FRIEND REQUEST (from user1 to targetUserId)
      this.post('/friends/requests', (schema, request) => {
        const { to: targetUserId } = JSON.parse(request.requestBody);
        console.log(`🔶 Mock Send Friend Request: user1 -> ${targetUserId}`);
        
        if (targetUserId === "user1") { // Cannot friend yourself
             return new Response(400, {}, { message: "You cannot send a friend request to yourself." });
        }
        
        const existing = currentFriendships.find(fs => (fs.from === "user1" && fs.to === targetUserId) || (fs.to === "user1" && fs.from === targetUserId));
        if (!existing) {
            const newFriendshipRaw = {
                _id: `friendship-${Date.now()}`,
                from: "user1",
                to: targetUserId,
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            currentFriendships.push(newFriendshipRaw);
            // Return the populated new friendship object
            return { friendship: populateFriendshipUsers(newFriendshipRaw) };
        } else if (existing.status === 'pending') {
             return new Response(400, {}, { message: "Friend request already pending." });
        } else if (existing.status === 'accepted') {
             return new Response(400, {}, { message: "You are already friends with this user." });
        } else {
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
                // Return the updated friendship record, populated
                return { friendship: populateFriendshipUsers(currentFriendships[requestIndex]) }; 
            } else if (action === 'decline') {
                const declinedRequest = currentFriendships.splice(requestIndex, 1)[0]; 
                // Return the ID or maybe the populated object that was declined/removed
                return { declinedFriendshipId: declinedRequest._id }; 
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
      
      // Reset passthrough
      this.passthrough(); // Allow unhandled requests to pass through (e.g., to Vite dev server)
    }
  });
}