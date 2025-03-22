import { createServer } from 'miragejs';
import { users, posts, comments, friendships, reactions } from './data';

// Simple token generation for auth
const generateToken = (user) => {
  return `mock-token-${user._id}-${Date.now()}`;
};

export function mockServer({ environment = 'development' } = {}) {
  return createServer({
    environment,
    
    routes() {
      this.namespace = 'api';
      
      // Authentication
      this.post('/auth/login', (schema, request) => {
        const { email, password } = JSON.parse(request.requestBody);
        const user = users.find(user => user.email === email);
        
        if (user && password === 'password') { // Simple password check
          return {
            user,
            accessToken: generateToken(user)
          };
        }
        
        return new Response(401, {}, { message: 'Invalid email or password' });
      });
      
      // Users
      this.get('/users/me', (schema, request) => {
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        // Extract user ID from mock token
        const tokenParts = authHeader.split(' ')[1].split('-');
        const userId = tokenParts[1];
        const user = users.find(user => user._id === userId);
        
        if (!user) {
          return new Response(401, {}, { message: 'User not found' });
        }
        
        // Add counts for posts and friends
        const userPosts = posts.filter(post => post.author._id === userId);
        const userFriends = friendships.filter(
          fs => (fs.from === userId || fs.to === userId) && fs.status === 'accepted'
        );
        
        return {
          ...user,
          postCount: userPosts.length,
          friendCount: userFriends.length
        };
      });
      
      this.get('/users/:id', (schema, request) => {
        const { id } = request.params;
        const user = users.find(user => user._id === id);
        
        if (!user) {
          return new Response(404, {}, { message: 'User not found' });
        }
        
        // Add counts for posts and friends
        const userPosts = posts.filter(post => post.author._id === id);
        const userFriends = friendships.filter(
          fs => (fs.from === id || fs.to === id) && fs.status === 'accepted'
        );
        
        return {
          ...user,
          postCount: userPosts.length,
          friendCount: userFriends.length
        };
      });
      
      this.get('/users', (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        let filteredUsers = [...users];
        
        if (name) {
          filteredUsers = filteredUsers.filter(
            user => user.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedUsers = filteredUsers.slice(start, end);
        
        // Add friendship status
        const authHeader = request.requestHeaders.Authorization;
        if (authHeader) {
          const tokenParts = authHeader.split(' ')[1].split('-');
          const currentUserId = tokenParts[1];
          
          paginatedUsers.forEach(user => {
            const friendship = friendships.find(
              fs => (fs.from === currentUserId && fs.to === user._id) || 
                    (fs.to === currentUserId && fs.from === user._id)
            );
            
            if (friendship) {
              user.friendship = friendship;
            }
          });
        }
        
        return {
          users: paginatedUsers,
          count: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit)
        };
      });
      
      // Posts
      this.get('/posts', (schema, request) => {
        const { page = 1, limit = 5 } = request.queryParams;
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        
        // Get user's friends
        const userFriendships = friendships.filter(
          fs => (fs.from === currentUserId || fs.to === currentUserId) && fs.status === 'accepted'
        );
        
        const friendIds = userFriendships.map(fs => 
          fs.from === currentUserId ? fs.to : fs.from
        );
        
        // Get posts from user and friends
        let relevantPosts = posts.filter(post => 
          post.author._id === currentUserId || friendIds.includes(post.author._id)
        );
        
        // Sort by creation date, newest first
        relevantPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedPosts = relevantPosts.slice(start, end);
        
        // Add comment counts and reactions
        paginatedPosts.forEach(post => {
          post.commentCount = comments.filter(comment => comment.post === post._id).length;
          post.reactions = reactions.filter(reaction => 
            reaction.targetType === 'Post' && reaction.targetId === post._id
          );
        });
        
        return {
          posts: paginatedPosts,
          count: relevantPosts.length,
          totalPages: Math.ceil(relevantPosts.length / limit)
        };
      });
      
      this.get('/posts/user/:userId', (schema, request) => {
        const { userId } = request.params;
        const { page = 1, limit = 5 } = request.queryParams;
        
        let userPosts = posts.filter(post => post.author._id === userId);
        
        // Sort by creation date, newest first
        userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedPosts = userPosts.slice(start, end);
        
        // Add comment counts and reactions
        paginatedPosts.forEach(post => {
          post.commentCount = comments.filter(comment => comment.post === post._id).length;
          post.reactions = reactions.filter(reaction => 
            reaction.targetType === 'Post' && reaction.targetId === post._id
          );
        });
        
        return {
          posts: paginatedPosts,
          count: userPosts.length,
          totalPages: Math.ceil(userPosts.length / limit)
        };
      });
      
      this.post('/posts', (schema, request) => {
        const { content, image } = JSON.parse(request.requestBody);
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        const currentUser = users.find(user => user._id === currentUserId);
        
        if (!currentUser) {
          return new Response(401, {}, { message: 'User not found' });
        }
        
        // Create new post
        const newPost = {
          _id: `post-${Date.now()}`,
          content,
          image: image || null,
          author: {
            _id: currentUser._id,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: [],
          commentCount: 0
        };
        
        // Add to posts collection
        posts.unshift(newPost);
        
        return newPost;
      });
      
      // Comments
      this.get('/posts/:postId/comments', (schema, request) => {
        const { postId } = request.params;
        const { page = 1, limit = 3 } = request.queryParams;
        
        let postComments = comments.filter(comment => comment.post === postId);
        
        // Sort by creation date, newest first
        postComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedComments = postComments.slice(start, end);
        
        // Add reactions
        paginatedComments.forEach(comment => {
          comment.reactions = reactions.filter(reaction => 
            reaction.targetType === 'Comment' && reaction.targetId === comment._id
          );
        });
        
        return {
          comments: paginatedComments,
          count: postComments.length,
          totalPages: Math.ceil(postComments.length / limit)
        };
      });
      
      this.post('/comments', (schema, request) => {
        const { content, postId } = JSON.parse(request.requestBody);
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        const currentUser = users.find(user => user._id === currentUserId);
        
        if (!currentUser) {
          return new Response(401, {}, { message: 'User not found' });
        }
        
        // Check if post exists
        const post = posts.find(post => post._id === postId);
        if (!post) {
          return new Response(404, {}, { message: 'Post not found' });
        }
        
        // Create new comment
        const newComment = {
          _id: `comment-${Date.now()}`,
          content,
          post: postId,
          author: {
            _id: currentUser._id,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: []
        };
        
        // Add to comments collection
        comments.unshift(newComment);
        
        return newComment;
      });
      
      // Reactions (likes/dislikes)
      this.post('/reactions', (schema, request) => {
        const { targetType, targetId, emoji } = JSON.parse(request.requestBody);
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        const currentUser = users.find(user => user._id === currentUserId);
        
        if (!currentUser) {
          return new Response(401, {}, { message: 'User not found' });
        }
        
        // Check if target exists
        let targetExists = false;
        if (targetType === 'Post') {
          targetExists = posts.some(post => post._id === targetId);
        } else if (targetType === 'Comment') {
          targetExists = comments.some(comment => comment._id === targetId);
        }
        
        if (!targetExists) {
          return new Response(404, {}, { message: `${targetType} not found` });
        }
        
        // Check if user already reacted
        const existingReactionIndex = reactions.findIndex(reaction => 
          reaction.targetType === targetType && 
          reaction.targetId === targetId && 
          reaction.author._id === currentUserId
        );
        
        // If already reacted, update the reaction
        if (existingReactionIndex !== -1) {
          if (reactions[existingReactionIndex].emoji === emoji) {
            // If same emoji, remove the reaction (toggle off)
            reactions.splice(existingReactionIndex, 1);
          } else {
            // If different emoji, update it
            reactions[existingReactionIndex].emoji = emoji;
          }
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
              avatarUrl: currentUser.avatarUrl
            },
            createdAt: new Date().toISOString()
          };
          
          reactions.push(newReaction);
        }
        
        // Return all reactions for the target
        return reactions.filter(reaction => 
          reaction.targetType === targetType && reaction.targetId === targetId
        );
      });
      
      // Friends
      this.get('/friends', (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        
        // Get accepted friendships
        const userFriendships = friendships.filter(
          fs => (fs.from === currentUserId || fs.to === currentUserId) && fs.status === 'accepted'
        );
        
        // Get friend IDs
        const friendIds = userFriendships.map(fs => 
          fs.from === currentUserId ? fs.to : fs.from
        );
        
        // Get friend users
        let friendUsers = users.filter(user => friendIds.includes(user._id));
        
        // Filter by name if provided
        if (name) {
          friendUsers = friendUsers.filter(
            user => user.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedFriends = friendUsers.slice(start, end);
        
        // Add friendship status
        paginatedFriends.forEach(user => {
          const friendship = friendships.find(
            fs => (fs.from === currentUserId && fs.to === user._id) || 
                  (fs.to === currentUserId && fs.from === user._id)
          );
          
          if (friendship) {
            user.friendship = friendship;
          }
        });
        
        return {
          users: paginatedFriends,
          count: friendUsers.length,
          totalPages: Math.ceil(friendUsers.length / limit)
        };
      });
      
      this.get('/friends/requests/incoming', (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        
        // Get pending friend requests received
        const incomingRequests = friendships.filter(
          fs => fs.to === currentUserId && fs.status === 'pending'
        );
        
        // Get sender IDs
        const senderIds = incomingRequests.map(fs => fs.from);
        
        // Get sender users
        let senderUsers = users.filter(user => senderIds.includes(user._id));
        
        // Filter by name if provided
        if (name) {
          senderUsers = senderUsers.filter(
            user => user.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedSenders = senderUsers.slice(start, end);
        
        // Add friendship status
        paginatedSenders.forEach(user => {
          const friendship = friendships.find(
            fs => fs.from === user._id && fs.to === currentUserId
          );
          
          if (friendship) {
            user.friendship = friendship;
          }
        });
        
        return {
          users: paginatedSenders,
          count: senderUsers.length,
          totalPages: Math.ceil(senderUsers.length / limit)
        };
      });
      
      this.get('/friends/requests/outgoing', (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        
        // Get pending friend requests sent
        const outgoingRequests = friendships.filter(
          fs => fs.from === currentUserId && fs.status === 'pending'
        );
        
        // Get recipient IDs
        const recipientIds = outgoingRequests.map(fs => fs.to);
        
        // Get recipient users
        let recipientUsers = users.filter(user => recipientIds.includes(user._id));
        
        // Filter by name if provided
        if (name) {
          recipientUsers = recipientUsers.filter(
            user => user.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedRecipients = recipientUsers.slice(start, end);
        
        // Add friendship status
        paginatedRecipients.forEach(user => {
          const friendship = friendships.find(
            fs => fs.from === currentUserId && fs.to === user._id
          );
          
          if (friendship) {
            user.friendship = friendship;
          }
        });
        
        return {
          users: paginatedRecipients,
          count: recipientUsers.length,
          totalPages: Math.ceil(recipientUsers.length / limit)
        };
      });
      
      this.post('/friends/requests', (schema, request) => {
        const { to } = JSON.parse(request.requestBody);
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        
        // Check if recipient exists
        const recipient = users.find(user => user._id === to);
        if (!recipient) {
          return new Response(404, {}, { message: 'User not found' });
        }
        
        // Check if already friends or request pending
        const existingFriendship = friendships.find(
          fs => (fs.from === currentUserId && fs.to === to) || 
                (fs.from === to && fs.to === currentUserId)
        );
        
        if (existingFriendship) {
          return new Response(400, {}, { message: 'Friendship or request already exists' });
        }
        
        // Create new friendship request
        const newFriendship = {
          _id: `friendship-${Date.now()}`,
          from: currentUserId,
          to,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to friendships collection
        friendships.push(newFriendship);
        
        return newFriendship;
      });
      
      this.put('/friends/requests/:userId', (schema, request) => {
        const { userId } = request.params;
        const { status } = JSON.parse(request.requestBody);
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        
        // Find the friendship request
        const friendshipIndex = friendships.findIndex(
          fs => fs.from === userId && fs.to === currentUserId && fs.status === 'pending'
        );
        
        if (friendshipIndex === -1) {
          return new Response(404, {}, { message: 'Friend request not found' });
        }
        
        // Update status
        friendships[friendshipIndex].status = status;
        friendships[friendshipIndex].updatedAt = new Date().toISOString();
        
        return friendships[friendshipIndex];
      });
      
      this.delete('/friends/requests/:userId', (schema, request) => {
        const { userId } = request.params;
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        
        // Find the friendship request
        const friendshipIndex = friendships.findIndex(
          fs => fs.from === currentUserId && fs.to === userId && fs.status === 'pending'
        );
        
        if (friendshipIndex === -1) {
          return new Response(404, {}, { message: 'Friend request not found' });
        }
        
        // Remove friendship
        const removedFriendship = friendships[friendshipIndex];
        friendships.splice(friendshipIndex, 1);
        
        return { success: true };
      });
      
      this.delete('/friends/:userId', (schema, request) => {
        const { userId } = request.params;
        
        // Get current user from token
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(401, {}, { message: 'Not authenticated' });
        }
        
        const tokenParts = authHeader.split(' ')[1].split('-');
        const currentUserId = tokenParts[1];
        
        // Find the friendship
        const friendshipIndex = friendships.findIndex(
          fs => (
            ((fs.from === currentUserId && fs.to === userId) || 
             (fs.from === userId && fs.to === currentUserId)) && 
            fs.status === 'accepted'
          )
        );
        
        if (friendshipIndex === -1) {
          return new Response(404, {}, { message: 'Friendship not found' });
        }
        
        // Remove friendship
        const removedFriendship = friendships[friendshipIndex];
        friendships.splice(friendshipIndex, 1);
        
        return { success: true };
      });
    }
  });
}