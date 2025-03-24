# API Services Setup

In this step, we'll set up the API services for our application. We'll create a mock API for development and configure Axios for making API requests.

## Configure API Service

First, let's create a configuration file for our API. Create `src/lib/config.js`:

```javascript
// API URLs
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Pagination
export const POSTS_PER_PAGE = 5;
export const COMMENTS_PER_POST = 3;
export const USERS_PER_PAGE = 10;

// Defaults
export const DEFAULT_AVATAR = "https://via.placeholder.com/150";
export const DEFAULT_COVER = "https://via.placeholder.com/1200x300";
```

Next, create the API service in `src/lib/apiService.js`:

```javascript
import axios from "axios";

// Initialize with token from localStorage if it exists
const token = localStorage.getItem("accessToken");
const initialHeaders = {
  "Content-Type": "application/json",
};

if (token) {
  initialHeaders.Authorization = `Bearer ${token}`;
}

// Determine if we're using the mock API server
const usingMockApi = !import.meta.env.VITE_API_URL;

// Set the base URL - if using mock API, we need to include the /api prefix
const baseURL = usingMockApi 
  ? '/api' // Mock server has a namespace 'api'
  : import.meta.env.VITE_API_URL || '';

const apiService = axios.create({
  baseURL,
  headers: initialHeaders,
});

apiService.interceptors.request.use(
  (request) => {
    console.log("Starting Request", { 
      url: request.url, 
      method: request.method,
      baseURL: request.baseURL,
      fullURL: request.baseURL + request.url
    });
    return request;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => {
    console.log("Response:", { 
      url: response.config.url, 
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    console.error("Response Error:", error);
    const message = error.response?.data?.errors?.message || 
                   error.response?.data?.message || 
                   "Something went wrong";
    return Promise.reject({ message });
  }
);

export default apiService;
```

## Create JWT Utility

Create a utility file for JWT token handling in `src/utils/jwt.js`:

```javascript
import { jwtDecode } from "jwt-decode";

/**
 * Validates a JWT token by checking if it's not expired
 * @param {string} accessToken - JWT token
 * @returns {boolean} True if token is valid
 */
export const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }
  try {
    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("JWT validation error:", error);
    return false;
  }
};
```

## Create the Mock API

For development without a backend, we'll create a mock API using MirageJS. In a future module, we'll teach you how to build a proper backend, but for now, we'll use this mock API to simulate backend functionality.

First, install MirageJS:

```bash
npm install miragejs
```

### Create the Data for Mock API

Create a new file `src/mockApi/data.js` with the following content:

```javascript
// Sample users data
export const users = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    password: "password123",
    avatarUrl: "https://via.placeholder.com/150",
    coverUrl: "https://via.placeholder.com/1200x300",
    aboutMe: "Frontend developer passionate about React and UX design",
    city: "San Francisco",
    country: "USA",
    company: "TechFlow Inc.",
    jobTitle: "Senior Frontend Developer",
    facebookLink: "facebook.com/alexj",
    instagramLink: "instagram.com/alexj",
    linkedinLink: "linkedin.com/in/alexj",
    twitterLink: "twitter.com/alexj",
    postCount: 5,
    friendCount: 3,
  },
  {
    id: "2",
    name: "Sam Wilson",
    email: "sam@example.com",
    password: "password123",
    avatarUrl: "https://via.placeholder.com/150",
    coverUrl: "https://via.placeholder.com/1200x300",
    aboutMe: "Full-stack developer with a passion for clean code",
    city: "New York",
    country: "USA",
    company: "CodeCraft",
    jobTitle: "Full-stack Developer",
    facebookLink: "",
    instagramLink: "instagram.com/samw",
    linkedinLink: "linkedin.com/in/samw",
    twitterLink: "",
    postCount: 3,
    friendCount: 2,
  },
  {
    id: "3",
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    avatarUrl: "https://via.placeholder.com/150",
    coverUrl: "https://via.placeholder.com/1200x300",
    aboutMe: "Backend developer specializing in Node.js and databases",
    city: "Seattle",
    country: "USA",
    company: "DataSphere",
    jobTitle: "Backend Engineer",
    facebookLink: "facebook.com/janed",
    instagramLink: "",
    linkedinLink: "linkedin.com/in/janed",
    twitterLink: "twitter.com/janed",
    postCount: 7,
    friendCount: 5,
  }
];

// Sample posts data
export const posts = [
  {
    id: "1",
    content: "Just launched a new React project. Check it out and let me know what you think!",
    image: null,
    userId: "1",
    createdAt: "2023-12-01T09:30:00.000Z",
    updatedAt: "2023-12-01T09:30:00.000Z",
    reactions: {
      like: 5,
      love: 2,
    },
    commentCount: 3,
  },
  {
    id: "2",
    content: "Learning Tailwind CSS today. It's amazing how quickly you can build beautiful UIs!",
    image: null,
    userId: "2",
    createdAt: "2023-12-02T14:20:00.000Z",
    updatedAt: "2023-12-02T14:20:00.000Z",
    reactions: {
      like: 8,
    },
    commentCount: 2,
  },
  {
    id: "3",
    content: "Anyone else excited about React 18? The new features are game-changing!",
    image: null,
    userId: "1",
    createdAt: "2023-12-03T11:15:00.000Z",
    updatedAt: "2023-12-03T11:15:00.000Z",
    reactions: {
      like: 3,
      love: 1,
    },
    commentCount: 4,
  },
  {
    id: "4",
    content: "Just fixed a nasty bug that's been haunting me for days. The feeling of relief is incredible!",
    image: null,
    userId: "3",
    createdAt: "2023-12-04T16:45:00.000Z",
    updatedAt: "2023-12-04T16:45:00.000Z",
    reactions: {
      like: 12,
      love: 3,
    },
    commentCount: 5,
  }
];

// Sample comments data
export const comments = [
  {
    id: "1",
    content: "Great work! The UI looks amazing.",
    userId: "2",
    postId: "1",
    createdAt: "2023-12-01T10:15:00.000Z",
    reactions: {
      like: 2,
    },
  },
  {
    id: "2",
    content: "Can you share the repository? I'd love to check out the code.",
    userId: "3",
    postId: "1",
    createdAt: "2023-12-01T11:30:00.000Z",
    reactions: {
      like: 1,
    },
  },
  {
    id: "3",
    content: "I've been using Tailwind for a while now. It's a game-changer!",
    userId: "1",
    postId: "2",
    createdAt: "2023-12-02T15:10:00.000Z",
    reactions: {
      like: 3,
    },
  },
  {
    id: "4",
    content: "The concurrent mode is what I'm most excited about.",
    userId: "2",
    postId: "3",
    createdAt: "2023-12-03T12:20:00.000Z",
    reactions: {
      like: 1,
    },
  },
  {
    id: "5",
    content: "Congratulations! Debugging is one of the most satisfying parts of coding.",
    userId: "1",
    postId: "4",
    createdAt: "2023-12-04T17:30:00.000Z",
    reactions: {
      like: 4,
    },
  }
];

// Sample friend relationships data
export const friends = [
  {
    id: "1",
    from: "1", // User ID
    to: "2", // User ID
    status: "accepted", // "pending", "accepted", "declined"
  },
  {
    id: "2",
    from: "1", // User ID
    to: "3", // User ID
    status: "accepted", // "pending", "accepted", "declined"
  },
  {
    id: "3",
    from: "2", // User ID
    to: "3", // User ID
    status: "pending", // "pending", "accepted", "declined"
  }
];
```

### Create the Mock Server

Create `src/mockApi/server.js` to set up the mock server:

```javascript
import { createServer, Model, Response, belongsTo, hasMany } from "miragejs";
import { users, posts, comments, friends } from "./data";

export function mockServer({ environment = "development" } = {}) {
  return createServer({
    environment,
    
    models: {
      user: Model.extend({
        posts: hasMany(),
      }),
      post: Model.extend({
        user: belongsTo(),
        comments: hasMany(),
      }),
      comment: Model.extend({
        user: belongsTo(),
        post: belongsTo(),
      }),
      friend: Model.extend({
        from: belongsTo("user"),
        to: belongsTo("user"),
      }),
      reaction: Model.extend({
        user: belongsTo(),
        targetType: null, // 'Post' or 'Comment'
        targetId: null,
      }),
    },

    seeds(server) {
      // Seed the database with users
      users.forEach(user => {
        server.create("user", {
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      // Seed posts
      posts.forEach(post => {
        server.create("post", {
          ...post,
          createdAt: post.createdAt || new Date().toISOString(),
          updatedAt: post.updatedAt || new Date().toISOString(),
        });
      });

      // Seed comments
      comments.forEach(comment => {
        server.create("comment", {
          ...comment,
          createdAt: comment.createdAt || new Date().toISOString(),
          updatedAt: comment.createdAt || new Date().toISOString(),
        });
      });

      // Seed friend relationships
      friends.forEach(friendship => {
        server.create("friend", {
          ...friendship,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    },

    routes() {
      this.namespace = "api";
      this.timing = 750; // Add 750ms delay to simulate network latency

      // AUTH ROUTES
      this.post("/auth/login", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const { email, password } = attrs;
        const user = schema.users.findBy({ email });
        
        if (!user || user.password !== password) {
          return new Response(400, {}, { message: "Invalid email or password" });
        }
        
        // Create mock JWT token
        const accessToken = "mock-jwt-token";
        
        return new Response(200, {}, {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          accessToken,
        });
      });

      // USER ROUTES
      this.get("/users/me", (schema, request) => {
        // In a real app, we would use the token to identify the user
        // For demo, we'll return the first user
        const user = schema.users.first();
        if (!user) {
          return new Response(404, {}, { message: "User not found" });
        }
        return user;
      });

      this.get("/users", (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        let users = schema.users.all().models;
        
        // Filter by name if provided
        if (name) {
          users = users.filter(user => 
            user.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Paginate results
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedUsers = users.slice(start, end);
        
        return {
          users: paginatedUsers,
          count: users.length,
          totalPages: Math.ceil(users.length / limit),
        };
      });

      this.get("/users/:id", (schema, request) => {
        const { id } = request.params;
        const user = schema.users.find(id);
        
        if (!user) {
          return new Response(404, {}, { message: "User not found" });
        }
        
        // Add friendship status for demo purposes
        const friendship = schema.friends.findBy({
          $or: [
            { from: "1", to: id },
            { from: id, to: "1" }
          ]
        });
        
        const userData = { ...user.attrs };
        
        if (friendship) {
          userData.friendship = {
            id: friendship.id,
            status: friendship.status,
          };
        }
        
        return userData;
      });

      this.put("/users/:id", (schema, request) => {
        const { id } = request.params;
        const attrs = JSON.parse(request.requestBody);
        
        const user = schema.users.find(id);
        if (!user) {
          return new Response(404, {}, { message: "User not found" });
        }
        
        // Update user
        const updatedUser = user.update({
          ...attrs,
          updatedAt: new Date().toISOString(),
        });
        
        return updatedUser;
      });

      // POST ROUTES
      this.get("/posts", (schema, request) => {
        const { page = 1, limit = 5 } = request.queryParams;
        let posts = schema.posts.all().models;
        
        // Sort by createdAt (newest first)
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedPosts = posts.slice(start, end);
        
        // Add author info to each post
        const postsWithAuthor = paginatedPosts.map(post => {
          const author = schema.users.find(post.userId);
          return {
            ...post.attrs,
            author: author ? {
              _id: author.id,
              name: author.name,
              avatarUrl: author.avatarUrl,
            } : null
          };
        });
        
        return {
          posts: postsWithAuthor,
          count: posts.length,
          totalPages: Math.ceil(posts.length / limit),
        };
      });

      this.get("/posts/user/:userId", (schema, request) => {
        const { userId } = request.params;
        const { page = 1, limit = 5 } = request.queryParams;
        
        let posts = schema.posts.where({ userId }).models;
        
        // Sort by createdAt (newest first)
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedPosts = posts.slice(start, end);
        
        // Add author info to each post
        const postsWithAuthor = paginatedPosts.map(post => {
          const author = schema.users.find(post.userId);
          return {
            ...post.attrs,
            author: author ? {
              _id: author.id,
              name: author.name,
              avatarUrl: author.avatarUrl,
            } : null
          };
        });
        
        return {
          posts: postsWithAuthor,
          count: posts.length,
          totalPages: Math.ceil(posts.length / limit),
        };
      });

      this.post("/posts", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        
        // Use the first user for demo
        const userId = "1";
        
        const post = schema.posts.create({
          ...attrs,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: {},
          commentCount: 0,
        });
        
        return post;
      });

      // COMMENT ROUTES
      this.get("/posts/:postId/comments", (schema, request) => {
        const { postId } = request.params;
        const { page = 1, limit = 3 } = request.queryParams;
        
        let comments = schema.comments.where({ postId }).models;
        
        // Sort by createdAt (newest first)
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedComments = comments.slice(start, end);
        
        // Add author info to each comment
        const commentsWithAuthor = paginatedComments.map(comment => {
          const author = schema.users.find(comment.userId);
          return {
            ...comment.attrs,
            author: author ? {
              _id: author.id,
              name: author.name,
              avatarUrl: author.avatarUrl,
            } : null
          };
        });
        
        return {
          comments: commentsWithAuthor,
          count: comments.length,
          totalPages: Math.ceil(comments.length / limit),
          totalComments: comments.length,
        };
      });

      this.post("/comments", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const { content, postId } = attrs;
        
        // Use first user for demo
        const userId = "1";
        
        const comment = schema.comments.create({
          content,
          postId,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: {},
        });
        
        // Update the post's comment count
        const post = schema.posts.find(postId);
        if (post) {
          post.update({
            commentCount: (post.commentCount || 0) + 1,
          });
        }
        
        return comment;
      });

      this.delete("/comments/:id", (schema, request) => {
        const { id } = request.params;
        const comment = schema.comments.find(id);
        
        if (!comment) {
          return new Response(404, {}, { message: "Comment not found" });
        }
        
        // Get postId before deleting
        const { postId } = comment;
        
        // Delete the comment
        comment.destroy();
        
        // Update post's comment count
        const post = schema.posts.find(postId);
        if (post && post.commentCount > 0) {
          post.update({
            commentCount: post.commentCount - 1,
          });
        }
        
        return new Response(200, {}, { message: "Comment deleted successfully" });
      });

      // REACTION ROUTES
      this.post("/reactions", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const { targetType, targetId, emoji } = attrs;
        
        // Find the target
        let target;
        if (targetType === "Post") {
          target = schema.posts.find(targetId);
        } else if (targetType === "Comment") {
          target = schema.comments.find(targetId);
        }
        
        if (!target) {
          return new Response(404, {}, { message: `${targetType} not found` });
        }
        
        // Update the reactions
        const reactions = target.reactions || {};
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        
        target.update({ reactions });
        
        return reactions;
      });

      // FRIEND ROUTES
      this.get("/friends", (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // For demo, we use user 1's friends
        const userId = "1";
        
        // Find accepted friend relationships where user 1 is involved
        const friendships = schema.friends.where(friendship => {
          return (friendship.from === userId || friendship.to === userId) && 
                 friendship.status === "accepted";
        }).models;
        
        // Get the IDs of the friends (the other user in each friendship)
        const friendIds = friendships.map(friendship => 
          friendship.from === userId ? friendship.to : friendship.from
        );
        
        // Get the friend users
        let friendUsers = schema.users.find(friendIds).models;
        
        // Filter by name if provided
        if (name) {
          friendUsers = friendUsers.filter(user => 
            user.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedFriends = friendUsers.slice(start, end);
        
        // Add friendship status to each user
        const friendsWithStatus = paginatedFriends.map(user => {
          const friendship = friendships.find(f => 
            f.from === user.id || f.to === user.id
          );
          
          return {
            ...user.attrs,
            friendship: {
              id: friendship.id,
              status: friendship.status,
            },
          };
        });
        
        return {
          users: friendsWithStatus,
          count: friendUsers.length,
          totalPages: Math.ceil(friendUsers.length / limit),
        };
      });

      this.get("/friends/requests/incoming", (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // For demo, we use user 1
        const userId = "1";
        
        // Find pending friend requests where user 1 is the recipient
        const friendships = schema.friends.where(friendship => {
          return friendship.to === userId && friendship.status === "pending";
        }).models;
        
        // Get the IDs of the users who sent the requests
        const requestUserIds = friendships.map(friendship => friendship.from);
        
        // Get the users
        let requestUsers = schema.users.find(requestUserIds).models;
        
        // Filter by name if provided
        if (name) {
          requestUsers = requestUsers.filter(user => 
            user.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedUsers = requestUsers.slice(start, end);
        
        // Add friendship status to each user
        const usersWithStatus = paginatedUsers.map(user => {
          const friendship = friendships.find(f => f.from === user.id);
          
          return {
            ...user.attrs,
            friendship: {
              id: friendship.id,
              status: friendship.status,
            },
          };
        });
        
        return {
          users: usersWithStatus,
          count: requestUsers.length,
          totalPages: Math.ceil(requestUsers.length / limit),
        };
      });

      this.get("/friends/requests/outgoing", (schema, request) => {
        const { name, page = 1, limit = 10 } = request.queryParams;
        
        // For demo, we use user 1
        const userId = "1";
        
        // Find pending friend requests where user 1 is the sender
        const friendships = schema.friends.where(friendship => {
          return friendship.from === userId && friendship.status === "pending";
        }).models;
        
        // Get the IDs of the users who received the requests
        const requestUserIds = friendships.map(friendship => friendship.to);
        
        // Get the users
        let requestUsers = schema.users.find(requestUserIds).models;
        
        // Filter by name if provided
        if (name) {
          requestUsers = requestUsers.filter(user => 
            user.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        
        // Paginate
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedUsers = requestUsers.slice(start, end);
        
        // Add friendship status to each user
        const usersWithStatus = paginatedUsers.map(user => {
          const friendship = friendships.find(f => f.to === user.id);
          
          return {
            ...user.attrs,
            friendship: {
              id: friendship.id,
              status: friendship.status,
            },
          };
        });
        
        return {
          users: usersWithStatus,
          count: requestUsers.length,
          totalPages: Math.ceil(requestUsers.length / limit),
        };
      });

      this.post("/friends/requests", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const { to } = attrs;
        
        // For demo, we use user 1 as the sender
        const from = "1";
        
        // Check if a friendship already exists
        const existingFriendship = schema.friends.findBy({
          $or: [
            { from, to },
            { from: to, to: from }
          ]
        });
        
        if (existingFriendship) {
          return new Response(400, {}, { 
            message: "Friend request already exists" 
          });
        }
        
        // Create a new friend request
        const friendship = schema.friends.create({
          from,
          to,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        return friendship;
      });

      this.put("/friends/requests/:userId", (schema, request) => {
        const { userId } = request.params;
        const attrs = JSON.parse(request.requestBody);
        const { status } = attrs;
        
        // For demo, we use user 1 as the recipient
        const to = "1";
        const from = userId;
        
        // Find the friendship
        const friendship = schema.friends.findBy({ from, to });
        
        if (!friendship) {
          return new Response(404, {}, { 
            message: "Friend request not found" 
          });
        }
        
        // Update the friendship status
        const updatedFriendship = friendship.update({
          status,
          updatedAt: new Date().toISOString(),
        });
        
        return updatedFriendship;
      });

      this.delete("/friends/requests/:userId", (schema, request) => {
        const { userId } = request.params;
        
        // For demo, we use user 1 as the sender
        const from = "1";
        const to = userId;
        
        // Find the friendship
        const friendship = schema.friends.findBy({ from, to });
        
        if (!friendship) {
          return new Response(404, {}, { 
            message: "Friend request not found" 
          });
        }
        
        // Delete the friendship
        friendship.destroy();
        
        return new Response(200, {}, { 
          message: "Friend request cancelled successfully" 
        });
      });

      this.delete("/friends/:userId", (schema, request) => {
        const { userId } = request.params;
        
        // For demo, we use user 1
        const currentUserId = "1";
        
        // Find the friendship (either direction)
        const friendship = schema.friends.findBy({
          $or: [
            { from: currentUserId, to: userId },
            { from: userId, to: currentUserId }
          ],
          status: "accepted"
        });
        
        if (!friendship) {
          return new Response(404, {}, { 
            message: "Friendship not found" 
          });
        }
        
        // Delete the friendship
        friendship.destroy();
        
        return new Response(200, {}, { 
          message: "Friend removed successfully" 
        });
      });
    }
  });
}
```

Don't worry too much about understanding all the details of the mock API implementation. In a future module, we'll teach you how to build a proper backend from scratch. For now, just use this mock API as-is to simulate backend functionality.

## Update main.jsx to Use the Mock API

Edit `src/main.jsx` to initialize the mock server when no API URL is provided:

```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';

import App from './App';
import { mockServer } from './mockApi/server';

// Import Tailwind CSS
import './index.css';

// Start mock server if API URL is not set
if (!import.meta.env.VITE_API_URL) {
  mockServer({ environment: 'development' });
  console.log('🔶 Using mock API server (no VITE_API_URL provided)');
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
```

## Create a Utility File

Create `src/lib/utils.js` for common utility functions:

```javascript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Combine and merge class names with Tailwind utilities
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Create pagination parameters for API requests
 * @param {Object} options - Pagination options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit] - Items per page
 * @param {string} [options.filter] - Filter string
 * @param {string} [options.filterKey='name'] - Key to filter by
 * @returns {Object} Parameter object for API request
 */
export function getPaginationParams({ 
  page = 1, 
  limit,
  filter = '',
  filterKey = 'name'
}) {
  const params = { page };
  
  // Add limit if specified
  if (limit) params.limit = limit;
  
  // Add filter if specified
  if (filter) params[filterKey] = filter;
  
  return params;
}
```

## Test the API Setup

Update your App.jsx to test the API:

```jsx
import React, { useEffect, useState } from "react";
import apiService from "./lib/apiService";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try to fetch the current user
        const response = await apiService.get("/users/me");
        setUser(response);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">CoderComm</h1>
        {user && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">User Info:</h2>
            <p className="text-gray-700">Name: {user.name}</p>
            <p className="text-gray-700">Email: {user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

Start your development server:

```bash
npm run dev
```

Visit your application and you should see a card with user information from the mock API. The API service is now set up and working!

With this in place, we're ready to build the authentication system in the next step.