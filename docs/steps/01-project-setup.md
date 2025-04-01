# Step 1: Project Setup and Configuration

In this step, we'll set up the foundation for our CoderComm frontend application. We'll create a new React project using Vite, configure TailwindCSS and ShadCN UI for styling, and set up React Router for navigation.

## Prerequisites

- Node.js v16 or higher
- npm v7 or higher

## 1. Create a New Vite Project

First, let's create a new Vite project with React:

```bash
npm create vite@latest codercomm-fe -- --template react
cd codercomm-fe
```

This creates a new React project using Vite as the build tool. Vite provides a faster development experience compared to Create React App.

## 2. Install Dependencies

Now let's install the core dependencies we'll need:

```bash
# Install React Router for routing
npm install react-router-dom

# Install UI libraries and utilities
npm install clsx lucide-react class-variance-authority tailwind-merge

# Install form handling libraries
npm install react-hook-form @hookform/resolvers yup

# Install state management libraries
npm install zustand

# Install API handling libraries
npm install axios @tanstack/react-query @tanstack/react-query-devtools

# Install date and number formatting
npm install date-fns numeral

# Install notification library
npm install sonner

# Install MirageJS for mock API
npm install miragejs --save-dev
```

## 3. Set Up TailwindCSS

Now let's set up TailwindCSS:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update the `tailwind.config.js` file:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0
        },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

Create or update your `src/index.css` file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
 
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
 
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
 
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
 
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
 
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
 
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
 
    --ring: 215 20.2% 65.1%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
 
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
 
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
 
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
 
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
 
    --ring: 217.2 32.6% 17.5%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

## 4. Set Up jsconfig.json

Create a `jsconfig.json` file in the root of your project to enable absolute imports:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Then update your `vite.config.js` to support these paths:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## 5. Set Up Basic File Structure

Create the following directory structure:

```
src/
├── components/
│   └── ui/
├── features/
├── hooks/
├── layouts/
├── lib/
├── mockApi/
├── pages/
├── routes/
└── utils/
```

## 6. Setup Complete Mock API with MirageJS

MirageJS is a client-side API mocking library that lets you build, test, and share a complete working application without having to depend on any backend services.

For this tutorial, we'll use MirageJS to simulate a backend API. This allows us to develop the frontend independently of the backend. In a real-world scenario, you would eventually replace MirageJS with actual API calls to your backend server.

Let's set up a complete MirageJS configuration that will support all the features we'll build throughout this tutorial. We'll create two files:

First, create a file for our mock data in `src/mockApi/data.js`:

```js
// Mock users data
export const users = [
  {
    _id: "user1",
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123", // In a real app, passwords would be hashed
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    coverUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6",
    aboutMe: "Full-stack developer with a passion for creating beautiful, responsive web applications.",
    postCount: 5,
    friendCount: 8,
  },
  {
    _id: "user2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "password123",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    coverUrl: "https://images.unsplash.com/photo-1516041541431-dd07cb8e2d5d",
    aboutMe: "Frontend developer specializing in React and modern JavaScript.",
    postCount: 3,
    friendCount: 6,
  },
];

// Mock posts data
export const posts = [
  {
    _id: "post1",
    content: "Just deployed a new React app with Tailwind CSS. Loving the developer experience!",
    createdAt: "2023-09-15T10:30:00Z",
    updatedAt: "2023-09-15T10:30:00Z",
    author: users[0],
    likes: 12,
    comments: 5,
  },
  {
    _id: "post2",
    content: "Working on a new feature for CoderComm. Can't wait to share it with everyone!",
    createdAt: "2023-09-12T14:20:00Z",
    updatedAt: "2023-09-12T14:20:00Z",
    author: users[0],
    likes: 8,
    comments: 2,
  },
  {
    _id: "post3",
    content: "Just finished reading 'Clean Code' by Robert C. Martin. Highly recommend it to all developers!",
    createdAt: "2023-09-10T09:15:00Z",
    updatedAt: "2023-09-10T09:15:00Z", 
    author: users[0],
    likes: 15,
    comments: 3,
  },
  {
    _id: "post4",
    content: "Attended a great webinar on modern JavaScript practices today. Learned so much!",
    createdAt: "2023-09-05T16:45:00Z",
    updatedAt: "2023-09-05T16:45:00Z",
    author: users[1],
    likes: 10,
    comments: 1,
  },
];

// Mock comments data
export const comments = [
  {
    _id: "comment1",
    content: "Great work! I love the design.",
    createdAt: "2023-09-15T11:30:00Z",
    updatedAt: "2023-09-15T11:30:00Z",
    author: users[1],
    postId: "post1",
    likes: 3,
  },
  {
    _id: "comment2",
    content: "Thanks for sharing this!",
    createdAt: "2023-09-15T12:45:00Z",
    updatedAt: "2023-09-15T12:45:00Z",
    author: users[1],
    postId: "post1",
    likes: 1,
  },
  {
    _id: "comment3",
    content: "I totally agree with your points.",
    createdAt: "2023-09-12T15:20:00Z",
    updatedAt: "2023-09-12T15:20:00Z",
    author: users[0],
    postId: "post4",
    likes: 2,
  },
  {
    _id: "comment4",
    content: "Looking forward to more content like this!",
    createdAt: "2023-09-10T10:15:00Z",
    updatedAt: "2023-09-10T10:15:00Z",
    author: users[1],
    postId: "post3",
    likes: 4,
  },
];

// Mock friendship data
export const friendships = [
  {
    _id: "friendship1",
    requesterId: users[0]._id,
    recipientId: users[1]._id,
    status: "accepted", // "pending", "accepted", "declined"
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T11:00:00Z",
  },
];

// Mock reactions data
export const reactions = [];
```

Next, create the main server file `src/mockApi/server.js`:

```js
import { createServer, Response } from 'miragejs';
import { users, posts, comments, friendships, reactions } from './data';

export function mockServer({ environment = 'development' } = {}) {
  return createServer({
    environment,
    
    routes() {
      this.namespace = 'api';
      
      // Authentication - always return user1 for simplicity in development
      this.post('/auth/login', (schema, request) => {
        const { email, password } = JSON.parse(request.requestBody);
        
        // Find user by email
        const user = users.find(user => user.email === email);
        
        if (!user || password !== 'password123') {
          return new Response(401, {}, { 
            message: 'Invalid email or password'
          });
        }
        
        return {
          user,
          accessToken: 'mock-token'
        };
      });
      
      // User registration
      this.post('/users', (schema, request) => {
        const data = JSON.parse(request.requestBody);
        
        // Check if email already exists
        const existingUser = users.find(user => user.email === data.email);
        if (existingUser) {
          return new Response(400, {}, { 
            message: 'Email already in use'
          });
        }
        
        // Create new user
        const newUser = {
          _id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          password: data.password,
          avatarUrl: null,
          coverUrl: null,
          aboutMe: '',
          postCount: 0,
          friendCount: 0,
        };
        
        // Add to "database"
        users.push(newUser);
        
        return {
          user: newUser,
          accessToken: 'mock-token'
        };
      });
      
      // Get current user (We use user1 for simplicity)
      this.get('/users/me', () => {
        const user = users.find(user => user._id === "user1");
        
        // Add counts for posts and friends
        const userPosts = posts.filter(post => post.author._id === "user1");
        const userFriends = friendships.filter(
          fs => (fs.requesterId === "user1" || fs.recipientId === "user1") && fs.status === 'accepted'
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
          fs => (fs.requesterId === id || fs.recipientId === id) && fs.status === 'accepted'
        );
        
        return {
          ...user,
          postCount: userPosts.length,
          friendCount: userFriends.length
        };
      });
      
      // Update user profile
      this.put('/users/:id', (schema, request) => {
        const { id } = request.params;
        const data = JSON.parse(request.requestBody);
        let user = users.find(user => user._id === id);
        
        if (!user) {
          return new Response(404, {}, { message: 'User not found' });
        }
        
        // Update user data
        user = { 
          ...user, 
          name: data.name || user.name,
          aboutMe: data.aboutMe || user.aboutMe,
          avatarUrl: data.avatarUrl || user.avatarUrl,
          coverUrl: data.coverUrl || user.coverUrl
        };
        
        // Update the user in our "database"
        const index = users.findIndex(u => u._id === id);
        users[index] = user;
        
        return user;
      });
      
      // Posts - get feed
      this.get('/posts', (schema, request) => {
        const { page = 1, limit = 5 } = request.queryParams;
        
        // Get user's friends
        const userFriendships = friendships.filter(
          fs => (fs.requesterId === "user1" || fs.recipientId === "user1") && fs.status === 'accepted'
        );
        
        const friendIds = userFriendships.map(fs => 
          fs.requesterId === "user1" ? fs.recipientId : fs.requesterId
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
        
        return {
          posts: paginatedPosts,
          count: userPosts.length,
          totalPages: Math.ceil(userPosts.length / limit)
        };
      });
      
      // Create a new post
      this.post('/posts', (schema, request) => {
        const data = JSON.parse(request.requestBody);
        const userId = data.userId;
        
        // Find the author
        const author = users.find(user => user._id === userId);
        
        if (!author) {
          return new Response(404, {}, { message: 'User not found' });
        }
        
        // Create new post
        const newPost = {
          _id: `post-${Date.now()}`,
          content: data.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: author,
          likes: 0,
          comments: 0,
        };
        
        // Add to "database"
        posts.unshift(newPost);
        
        // Update post count for the user
        author.postCount += 1;
        
        return newPost;
      });
      
      // Get a specific post
      this.get('/posts/:id', (schema, request) => {
        const { id } = request.params;
        const post = posts.find(post => post._id === id);
        
        if (!post) {
          return new Response(404, {}, { message: 'Post not found' });
        }
        
        return post;
      });
      
      // Like a post
      this.post('/posts/:id/like', (schema, request) => {
        const { id } = request.params;
        const post = posts.find(post => post._id === id);
        
        if (!post) {
          return new Response(404, {}, { message: 'Post not found' });
        }
        
        // Increment likes
        post.likes += 1;
        
        return post;
      });
      
      // Unlike a post
      this.delete('/posts/:id/like', (schema, request) => {
        const { id } = request.params;
        const post = posts.find(post => post._id === id);
        
        if (!post) {
          return new Response(404, {}, { message: 'Post not found' });
        }
        
        // Decrement likes (ensure it doesn't go below 0)
        post.likes = Math.max(0, post.likes - 1);
        
        return post;
      });
      
      // Delete a post
      this.delete('/posts/:id', (schema, request) => {
        const { id } = request.params;
        const postIndex = posts.findIndex(post => post._id === id);
        
        if (postIndex === -1) {
          return new Response(404, {}, { message: 'Post not found' });
        }
        
        // Get the post to return after deletion
        const post = posts[postIndex];
        
        // Remove from "database"
        posts.splice(postIndex, 1);
        
        // Update post count for the user
        const author = users.find(user => user._id === post.author._id);
        if (author) {
          author.postCount = Math.max(0, author.postCount - 1);
        }
        
        return post;
      });
      
      // Get comments for a post
      this.get('/posts/:postId/comments', (schema, request) => {
        const { postId } = request.params;
        const postComments = comments.filter(comment => comment.postId === postId);
        
        // Sort comments by creation date (newest first)
        const sortedComments = [...postComments].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        return {
          comments: sortedComments,
          count: sortedComments.length,
        };
      });
      
      // Create a comment
      this.post('/comments', (schema, request) => {
        const data = JSON.parse(request.requestBody);
        const { content, postId, userId } = data;
        
        // Find the author and post
        const author = users.find(user => user._id === userId);
        const post = posts.find(post => post._id === postId);
        
        if (!author) {
          return new Response(404, {}, { message: 'User not found' });
        }
        
        if (!post) {
          return new Response(404, {}, { message: 'Post not found' });
        }
        
        // Create new comment
        const newComment = {
          _id: `comment-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author,
          postId,
          likes: 0,
        };
        
        // Add to "database"
        comments.push(newComment);
        
        // Update comment count on the post
        post.comments += 1;
        
        return newComment;
      });
      
      // Delete a comment
      this.delete('/comments/:id', (schema, request) => {
        const { id } = request.params;
        const commentIndex = comments.findIndex(comment => comment._id === id);
        
        if (commentIndex === -1) {
          return new Response(404, {}, { message: 'Comment not found' });
        }
        
        // Get the comment to return after deletion
        const comment = comments[commentIndex];
        
        // Find associated post and decrement its comment count
        const post = posts.find(post => post._id === comment.postId);
        if (post) {
          post.comments = Math.max(0, post.comments - 1);
        }
        
        // Remove from "database"
        comments.splice(commentIndex, 1);
        
        return comment;
      });
      
      // Like a comment
      this.post('/comments/:id/like', (schema, request) => {
        const { id } = request.params;
        const comment = comments.find(comment => comment._id === id);
        
        if (!comment) {
          return new Response(404, {}, { message: 'Comment not found' });
        }
        
        // Increment likes
        comment.likes += 1;
        
        return comment;
      });
      
      // Unlike a comment
      this.delete('/comments/:id/like', (schema, request) => {
        const { id } = request.params;
        const comment = comments.find(comment => comment._id === id);
        
        if (!comment) {
          return new Response(404, {}, { message: 'Comment not found' });
        }
        
        // Decrement likes (ensure it doesn't go below 0)
        comment.likes = Math.max(0, comment.likes - 1);
        
        return comment;
      });
      
      // Get friends of a user
      this.get('/users/:userId/friends', (schema, request) => {
        const { userId } = request.params;
        
        // Find accepted friendships where the user is either the requester or recipient
        const userFriendships = friendships.filter(friendship => 
          friendship.status === "accepted" && 
          (friendship.requesterId === userId || friendship.recipientId === userId)
        );
        
        // Get the friend IDs (the other party in each friendship)
        const friendIds = userFriendships.map(friendship => 
          friendship.requesterId === userId ? friendship.recipientId : friendship.requesterId
        );
        
        // Get the user objects for each friend
        const friends = users.filter(user => friendIds.includes(user._id));
        
        return {
          friends,
          count: friends.length,
        };
      });
      
      // Get incoming friend requests for a user
      this.get('/users/:userId/friend-requests/incoming', (schema, request) => {
        const { userId } = request.params;
        
        // Find pending friendships where the user is the recipient
        const pendingFriendships = friendships.filter(friendship => 
          friendship.status === "pending" && friendship.recipientId === userId
        );
        
        // Get the requester user objects
        const requests = pendingFriendships.map(friendship => {
          const requester = users.find(user => user._id === friendship.requesterId);
          return {
            _id: friendship._id,
            requester,
            createdAt: friendship.createdAt,
          };
        });
        
        return {
          requests,
          count: requests.length,
        };
      });
      
      // Get outgoing friend requests for a user
      this.get('/users/:userId/friend-requests/outgoing', (schema, request) => {
        const { userId } = request.params;
        
        // Find pending friendships where the user is the requester
        const pendingFriendships = friendships.filter(friendship => 
          friendship.status === "pending" && friendship.requesterId === userId
        );
        
        // Get the recipient user objects
        const requests = pendingFriendships.map(friendship => {
          const recipient = users.find(user => user._id === friendship.recipientId);
          return {
            _id: friendship._id,
            recipient,
            createdAt: friendship.createdAt,
          };
        });
        
        return {
          requests,
          count: requests.length,
        };
      });
      
      // Send a friend request
      this.post('/friend-requests', (schema, request) => {
        const data = JSON.parse(request.requestBody);
        const { requesterId, recipientId } = data;
        
        // Validate users exist
        const requester = users.find(user => user._id === requesterId);
        const recipient = users.find(user => user._id === recipientId);
        
        if (!requester || !recipient) {
          return new Response(404, {}, { message: 'User not found' });
        }
        
        // Check if a friendship already exists
        const existingFriendship = friendships.find(friendship => 
          (friendship.requesterId === requesterId && friendship.recipientId === recipientId) ||
          (friendship.requesterId === recipientId && friendship.recipientId === requesterId)
        );
        
        if (existingFriendship) {
          return new Response(400, {}, { message: 'Friendship already exists' });
        }
        
        // Create new friendship
        const newFriendship = {
          _id: `friendship-${Date.now()}`,
          requesterId,
          recipientId,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Add to "database"
        friendships.push(newFriendship);
        
        return newFriendship;
      });
      
      // Accept or decline a friend request
      this.patch('/friend-requests/:id', (schema, request) => {
        const { id } = request.params;
        const data = JSON.parse(request.requestBody);
        const { status } = data;
        
        // Find the friendship
        const friendship = friendships.find(f => f._id === id);
        
        if (!friendship) {
          return new Response(404, {}, { message: 'Friend request not found' });
        }
        
        if (friendship.status !== "pending") {
          return new Response(400, {}, { message: 'Friend request already processed' });
        }
        
        // Update status
        friendship.status = status;
        friendship.updatedAt = new Date().toISOString();
        
        return friendship;
      });
      
      // Delete a friendship
      this.delete('/friendships/:id', (schema, request) => {
        const { id } = request.params;
        
        const friendshipIndex = friendships.findIndex(f => f._id === id);
        
        if (friendshipIndex === -1) {
          return new Response(404, {}, { message: 'Friendship not found' });
        }
        
        // Get the friendship to return after deletion
        const friendship = friendships[friendshipIndex];
        
        // Remove from "database"
        friendships.splice(friendshipIndex, 1);
        
        return friendship;
      });
    },
  });
}
```

And finally, update your `src/main.jsx` file to start the mock server:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { mockServer } from './mockApi/server';

// Import Tailwind CSS
import './index.css';

// Start mock server if API URL is not set
if (!import.meta.env.VITE_API_URL) {
  mockServer({ environment: 'development' });
  console.log('🔶 Using mock API server (no VITE_API_URL provided)');
}

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

> **Important Note**: The mock API is provided as a black box for our frontend development. We don't need to understand or modify it during this tutorial. It simply simulates the behavior of a real backend API, allowing us to focus purely on frontend development. As we progress through the tutorial, we'll interact with various endpoints, but we won't need to modify the mock API itself.

## 7. Create a Basic App Component

Update your `src/App.jsx` file:

```jsx
import React from "react";

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-8">
        Welcome to CoderComm
      </h1>
      <p className="text-center">
        A social media application for developers
      </p>
    </div>
  );
}

export default App;
```

## 8. Run the Application

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to see your application.

## What's Next?

In the next step, we'll implement the authentication system, including login and registration pages, and set up the state management using Zustand. 