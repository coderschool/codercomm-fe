import { createServer } from 'miragejs';
import { users, posts, comments, friendships, reactions } from './data';

export function mockServer({ environment = 'development' } = {}) {
  return createServer({
    environment,
    
    routes() {
      this.namespace = 'api';
      
      // Authentication - always return user1 for simplicity
      this.post('/auth/login', () => {
        const user = users.find(user => user._id === "user1");
        
        return {
          user,
          accessToken: 'mock-token'
        };
      });
      
      // Users - always return user1 as current user
      this.get('/users/me', () => {
        const user = users.find(user => user._id === "user1");
        
        // Add counts for posts and friends
        const userPosts = posts.filter(post => post.author._id === "user1");
        const userFriends = friendships.filter(
          fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
        );
        
        return {
          ...user,
          postCount: userPosts.length,
          friendCount: userFriends.length
        };
      });
      
      // Get user by ID
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
      
      // Get users with pagination
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
        paginatedUsers.forEach(user => {
          const friendship = friendships.find(
            fs => (fs.from === "user1" && fs.to === user._id) || 
                 (fs.to === "user1" && fs.from === user._id)
          );
          
          if (friendship) {
            user.friendship = friendship;
          }
        });
        
        return {
          users: paginatedUsers,
          count: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit)
        };
      });
      
      // Posts - get feed posts
      this.get('/posts', (schema, request) => {
        const { page = 1, limit = 5 } = request.queryParams;
        
        // Get user's friends
        const userFriendships = friendships.filter(
          fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
        );
        
        const friendIds = userFriendships.map(fs => 
          fs.from === "user1" ? fs.to : fs.from
        );
        
        // Get posts from user and friends
        let relevantPosts = posts.filter(post => 
          post.author._id === "user1" || friendIds.includes(post.author._id)
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
      
      // Get posts by user
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
      
      // Create a post
      this.post('/posts', (schema, request) => {
        const { content, image } = JSON.parse(request.requestBody);
        const currentUser = users.find(user => user._id === "user1");
        
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
      
      // Get comments for a post
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
      
      // Add a comment
      this.post('/comments', (schema, request) => {
        const { content, postId } = JSON.parse(request.requestBody);
        const currentUser = users.find(user => user._id === "user1");
        
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
      
      // React to a post or comment
      this.post('/reactions', (schema, request) => {
        const { targetType, targetId, emoji } = JSON.parse(request.requestBody);
        const currentUser = users.find(user => user._id === "user1");
        
        // Check if user already reacted
        const existingReactionIndex = reactions.findIndex(reaction => 
          reaction.targetType === targetType && 
          reaction.targetId === targetId && 
          reaction.author._id === currentUser._id
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
          reactions.push({
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
          });
        }
        
        // Return all reactions for the target
        return reactions.filter(reaction => 
          reaction.targetType === targetType && reaction.targetId === targetId
        );
      });
      
      // Friends
      this.get('/friends', (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // Get accepted friendships
        const userFriendships = friendships.filter(
          fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
        );
        
        // Get friend IDs
        const friendIds = userFriendships.map(fs => 
          fs.from === "user1" ? fs.to : fs.from
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
            fs => (fs.from === "user1" && fs.to === user._id) || 
                  (fs.to === "user1" && fs.from === user._id)
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
      
      // Incoming friend requests
      this.get('/friends/requests/incoming', (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // Get pending friend requests where user1 is the recipient
        let incomingRequests = friendships.filter(
          friendship => friendship.to === "user1" && friendship.status === "pending"
        );
        
        // Filter by name if provided
        if (name) {
          incomingRequests = incomingRequests.filter(friendship => {
            const requester = users.find(user => user._id === friendship.from);
            return requester.name.toLowerCase().includes(name.toLowerCase());
          });
        }
        
        // Map to required format with requester user info
        const formattedRequests = incomingRequests.map(friendship => {
          const requester = users.find(user => user._id === friendship.from);
          return {
            _id: friendship._id,
            from: friendship.from,
            to: friendship.to,
            status: friendship.status,
            createdAt: friendship.createdAt,
            updatedAt: friendship.updatedAt,
            requester: requester
          };
        });
        
        return { 
          requests: formattedRequests, 
          count: formattedRequests.length, 
          totalPages: formattedRequests.length > 0 ? 1 : 0 
        };
      });

      // Outgoing friend requests
      this.get('/friends/requests/outgoing', (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // Get pending friend requests where user1 is the sender
        let outgoingRequests = friendships.filter(
          friendship => friendship.from === "user1" && friendship.status === "pending"
        );
        
        // Filter by name if provided
        if (name) {
          outgoingRequests = outgoingRequests.filter(friendship => {
            const recipient = users.find(user => user._id === friendship.to);
            return recipient.name.toLowerCase().includes(name.toLowerCase());
          });
        }
        
        // Map to required format with recipient user info
        const formattedRequests = outgoingRequests.map(friendship => {
          const recipient = users.find(user => user._id === friendship.to);
          return {
            _id: friendship._id,
            from: friendship.from,
            to: friendship.to,
            status: friendship.status,
            createdAt: friendship.createdAt,
            updatedAt: friendship.updatedAt,
            recipient: recipient
          };
        });
        
        return { 
          requests: formattedRequests, 
          count: formattedRequests.length, 
          totalPages: formattedRequests.length > 0 ? 1 : 0 
        };
      });

      // Friend request actions
      this.post('/friends/requests', () => ({ success: true }));
      this.put('/friends/requests/:userId', () => ({ success: true }));
      this.delete('/friends/requests/:userId', () => ({ success: true }));
      this.delete('/friends/:userId', () => ({ success: true }));
    }
  });
}