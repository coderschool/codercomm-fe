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

Now let's install the core dependencies we'll need. We'll group them by purpose.

```bash
# --- Core & Routing ---
# React Router for handling navigation between pages
npm install react-router-dom

# --- UI & Styling Utilities ---
# Utility libraries used by ShadCN UI and for class name composition
npm install clsx lucide-react class-variance-authority tailwind-merge

# --- Form Handling ---
# Libraries for building and validating forms easily
npm install react-hook-form @hookform/resolvers yup

# --- State Management ---
# Zustand for managing application state globally
npm install zustand

# --- API & Data Fetching ---
# Axios for making HTTP requests to our API
# React Query for managing server state (fetching, caching, updating data)
# React Query Devtools for debugging React Query
npm install axios @tanstack/react-query @tanstack/react-query-devtools

# --- Utilities ---
# date-fns for formatting dates
# numeral for formatting numbers
# prop-types for runtime type checking of component props
npm install date-fns numeral prop-types

# --- Notifications ---
# Sonner for displaying toast notifications
npm install sonner

# --- Development Dependencies ---
# MirageJS for creating a mock API server during development
npm install miragejs --save-dev
```

## 3. Set Up TailwindCSS

Now let's set up TailwindCSS for styling:

```bash
# Install TailwindCSS and its peer dependencies
npm install -D tailwindcss postcss autoprefixer

# Install TailwindCSS animation plugin
npm install -D tailwindcss-animate

# Generate Tailwind configuration files
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
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
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
  
  /* Example dark mode variables (add if needed)
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    ... other dark mode variables ...
  }
  */
 
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

## 4. Initialize ShadCN UI

ShadCN UI is a collection of reusable UI components built on top of TailwindCSS and Radix UI. Initialize it in your project:

```bash
npx shadcn@latest init
```

This command will ask you a few questions to configure `components.json`. Choose the defaults, ensuring it matches your setup (e.g., using `src/index.css`, `tailwind.config.js`, alias `@/*`). This sets up the foundation for adding individual ShadCN components later.

## 5. Set Up jsconfig.json for Absolute Imports

Create a `jsconfig.json` file in the root of your project to enable convenient absolute imports (e.g., `import Component from '@/components/Component'`) instead of long relative paths (`../../components/Component`).

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

Then update your `vite.config.js` to recognize these paths:

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

## 6. Set Up Basic File Structure

Create the following directory structure inside `src/`. This organized structure helps manage the application as it grows:

```
src/
├── components/     # Reusable UI components shared across features
│   └── ui/         # Specifically for ShadCN UI components added via CLI
├── features/       # Components, hooks, etc., specific to a feature (e.g., auth, posts)
├── hooks/          # Custom React hooks shared across the application
├── layouts/        # Layout components (e.g., MainLayout, BlankLayout)
├── lib/            # Core libraries, API service, state store setup
├── mockApi/        # MirageJS mock API server setup and data
├── pages/          # Top-level page components corresponding to routes
├── routes/         # Routing configuration and route guards
└── utils/          # Utility functions shared across the application
```

## 7. Setup Complete Mock API with MirageJS

> **Important Note for Learners:** The next section involves setting up MirageJS, a tool that simulates a backend API *entirely within your browser*. This is incredibly useful because it allows us to build and test the *entire* frontend application (login, posting, commenting, etc.) without needing a real backend server yet.
>
> **You DO NOT need to understand the details of the MirageJS code (`data.js`, `server.js`) at this stage.** Your primary task is to **copy and paste** these files correctly into `src/mockApi/`. We've pre-configured it to handle all the API requests our frontend will make throughout the tutorial. Treat it as a "black box" that just works for now. We'll focus on how our React components *interact* with this mock API in later steps.

MirageJS lets us build, test, and share a complete working frontend without depending on any backend services yet.

Let's set up the MirageJS configuration. We'll create two files:

First, create the mock data file `src/mockApi/data.js`:

```js
// src/mockApi/data.js

// --- Helper to generate dates relative to now ---
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();


// --- Sample Users ---
export const users = [
  {
    _id: "user1",
    username: "learnreact",
    name: "Nguyen Van React",
    email: "reactlover@coderschool.vn", // Use this for login
    // Note: Mirage doesn't handle actual password hashing/checking here.
    // The login route in server.js simply checks the email.
    avatarUrl: "https://i.pravatar.cc/150?u=nguyen",
    coverUrl: "https://picsum.photos/id/1018/800/200",
    aboutMe: "React developer by day, phở connoisseur by night",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    company: "CoderSchool",
    jobTitle: "Frontend Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: daysAgo(365) // 1 year ago
  },
  {
    _id: "user2",
    username: "cssqueen",
    name: "Tran Thi CSS",
    email: "styling@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=tran",
    coverUrl: "https://picsum.photos/id/1019/800/200",
    aboutMe: "Making divs pretty since 2015. Can center anything vertically.",
    city: "Hanoi",
    country: "Vietnam",
    company: "Design Divas",
    jobTitle: "UI/UX Designer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: daysAgo(340)
  },
  {
    _id: "user3",
    username: "nodemaster",
    name: "Le Thanh Backend",
    email: "serverside@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=lethanh",
    coverUrl: "https://picsum.photos/id/1025/800/200",
    aboutMe: "I make APIs so fast even my coffee can't keep up",
    city: "Da Nang",
    country: "Vietnam",
    company: "Server Solutions",
    jobTitle: "Backend Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: daysAgo(300)
  },
  {
    _id: "user4",
    username: "fullstackdev",
    name: "Pham Minh Code",
    email: "fullstack@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=phamminh",
    coverUrl: "https://picsum.photos/id/1031/800/200",
    aboutMe: "I do frontend, backend, and can fix the office printer",
    city: "Hue",
    country: "Vietnam",
    company: "Viet Tech",
    jobTitle: "Full-stack Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: daysAgo(270)
  },
  {
    _id: "user5",
    username: "devopswhiz",
    name: "Hoang The Cloud",
    email: "cloudguru@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=hoangcloud",
    coverUrl: "https://picsum.photos/id/1039/800/200",
    aboutMe: "If it works on your machine, I\'ll make it work in production",
    city: "Can Tho",
    country: "Vietnam",
    company: "Cloud Crusaders",
    jobTitle: "DevOps Engineer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: daysAgo(240)
  }
];

// --- Sample Posts ---
// Posts visible to user1 (authored by user1 or friends user2, user3)
export const posts = [
  {
    _id: "post1",
    content: "Just built my first React component! Took me 5 cups of cà phê sữa đá but it was worth it! 🚀",
    image: "https://picsum.photos/id/237/800/400",
    author: { // Embedded author info for convenience
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3)
  },
  {
    _id: "post2",
    content: "Created a beautiful UI for a bánh mì ordering app. Swipe for the design! 🥖",
    image: "https://picsum.photos/id/292/800/400",
    author: {
      _id: "user2", // Friend of user1
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4)
  },
  {
    _id: "post3",
    content: "Just deployed my Node.js API to the cloud. It's so fast, it delivered my phở before I ordered it! 🍜",
    image: "https://picsum.photos/id/42/800/400",
    author: {
      _id: "user3", // Friend of user1
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7)
  },
  {
    _id: "post4",
    content: "Learning React Hooks is like learning to use đũa (chopsticks) - awkward at first, but then you can\'t imagine coding without them! 🥢",
    image: "https://picsum.photos/id/24/800/400",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14)
  },
  {
    _id: "post5",
    content: "Designed a mobile-responsive website that looks good on everything from an iPhone 13 Pro Max to my grandmother\'s Nokia! 📱",
    image: "https://picsum.photos/id/28/800/400",
    author: {
      _id: "user2", // Friend of user1
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: daysAgo(21),
    updatedAt: daysAgo(21)
  },
  {
    _id: "post6",
    content: "Optimized our database queries and now the app loads faster than you can say \'một, hai, ba, yo!\' ⚡",
    image: "https://picsum.photos/id/4/800/400",
    author: {
      _id: "user3", // Friend of user1
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30)
  }
];

// --- Sample Comments ---
// Comments on posts visible to user1
export const comments = [
  {
    _id: "comment1",
    content: "Siêu đỉnh! Can you share your code on GitHub?",
    post: "post1", // Reference to post ID
    author: { // Embedded author info
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: hoursAgo(70), // Approx 3 days ago + 2 hours
    updatedAt: hoursAgo(70)
  },
  {
    _id: "comment2",
    content: "Quá đẹp! Did you use Zustand for state management?", // Updated comment
    post: "post1",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: hoursAgo(68), // Approx 3 days ago + 4 hours
    updatedAt: hoursAgo(68)
  },
  {
    _id: "comment3",
    content: "The UI is cleaner than my browser history after a job interview! 😂",
    post: "post2",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: hoursAgo(93), // Approx 4 days ago + 3 hours
    updatedAt: hoursAgo(93)
  },
  {
    _id: "comment4",
    content: "useEffect(() => { setPho(\'delicious\') }, [hunger]); Best hook ever!", // Updated comment
    post: "post4",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: hoursAgo(331), // Approx 14 days ago + 5 hours
    updatedAt: hoursAgo(331)
  },
  {
    _id: "comment5",
    content: "Are you using Tailwind for this? The responsive design is on point! 👌",
    post: "post5",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: hoursAgo(500), // Approx 21 days ago + 4 hours
    updatedAt: hoursAgo(500)
  },
  {
    _id: "comment6",
    content: "Share your database optimization tricks! I need to speed up my queries too.",
    post: "post6",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: hoursAgo(716), // Approx 30 days ago + 4 hours
    updatedAt: hoursAgo(716)
  }
];

// --- Sample Reactions ---
export const reactions = [
  {
    _id: "reaction1",
    targetType: "Post", // Can be "Post" or "Comment"
    targetId: "post1",  // ID of the post or comment
    emoji: "like",      // Type of reaction (like, love, etc.)
    author: { // Embedded author info
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: hoursAgo(71) // Approx 3 days ago + 1 hour
  },
  {
    _id: "reaction2",
    targetType: "Post",
    targetId: "post1",
    emoji: "like",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: hoursAgo(69) // Approx 3 days ago + 3 hours
  },
  {
    _id: "reaction3",
    targetType: "Post",
    targetId: "post2",
    emoji: "like",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: hoursAgo(94) // Approx 4 days ago + 2 hours
  },
  {
    _id: "reaction4",
    targetType: "Comment",
    targetId: "comment1",
    emoji: "like",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: hoursAgo(69.5) // Approx 3 days ago + 2.5 hours
  },
  {
    _id: "reaction5",
    targetType: "Comment",
    targetId: "comment3",
    emoji: "like",
    author: {
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: hoursAgo(92.5) // Approx 4 days ago + 3.5 hours
  }
];

// --- Sample Friendships ---
// Focus on user1's perspective
export const friendships = [
  { // User1 and User2 are friends
    _id: "friendship1",
    from: "user1", // User who initiated (or could be the other way)
    to: "user2",
    status: "accepted", // 'pending', 'accepted', 'declined', 'blocked'
    createdAt: daysAgo(90),
    updatedAt: daysAgo(89) // Accepted 1 day later
  },
  { // User1 and User3 are friends
    _id: "friendship2",
    from: "user3", // User3 sent request to User1
    to: "user1",
    status: "accepted",
    createdAt: daysAgo(85),
    updatedAt: daysAgo(84) // Accepted 1 day later
  },
  { // User1 sent a request to User5 (pending)
    _id: "friendship3",
    from: "user1",
    to: "user5",
    status: "pending",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10)
  },
  { // User4 sent a request to User1 (pending)
    _id: "friendship4",
    from: "user4",
    to: "user1",
    status: "pending",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15)
  },
  // --- Adding more pending requests for testing various scenarios ---
  {
    _id: "friendship5",
    from: "user3", // User3 sent another (redundant?) request recently - mock data quirk
    to: "user1",
    status: "pending",
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2)
  },
  {
    _id: "friendship6",
    from: "user2", // User2 sent a request to User1 recently (even though they are friends) - mock data quirk
    to: "user1",
    status: "pending",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  },
  {
    _id: "friendship7",
    from: "user1", // User1 sent request to User4
    to: "user4",
    status: "pending",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5)
  },
  {
    _id: "friendship8",
    from: "user5", // User5 sent request to User1
    to: "user1",
    status: "pending",
    createdAt: daysAgo(30), // 1 month ago
    updatedAt: daysAgo(30)
  }
];
```

Next, create the main server file `src/mockApi/server.js`:

```js
// src/mockApi/server.js
import { createServer, Response } from 'miragejs'; // Import Response
import { users, posts, comments, friendships, reactions } from './data';

/**
 * Configures and starts the MirageJS mock server.
 * Again, learners: Treat this as a black box! Just ensure it's created correctly.
 * It defines API endpoints (like /api/auth/login, /api/posts, etc.)
 * and determines what data to return when the frontend requests it.
 */
export function mockServer({ environment = 'development' } = {}) {
  return createServer({
    environment,

    // seeds(server) { // Optional: Use seeds if you need to initialize data from the server context
    //   server.db.loadData({ users, posts, comments, friendships, reactions });
    // },

    routes() {
      // Namespace for all API routes
      this.namespace = 'api';
      // Delay all responses by 300ms to simulate network latency
      this.timing = 300;

      // --- Authentication Routes ---
      // LOGIN: Always logs in as 'user1' if email matches. Ignores password for simplicity.
      this.post('/auth/login', (schema, request) => {
        const { email /*, password */ } = JSON.parse(request.requestBody);
        const user = users.find(u => u.email === email);

        if (user && user._id === "user1") { // Simplify: only allow login as user1 for demo
          console.log(`🔶 Mock Login Success: ${email}`);
          return {
            user: { ...user }, // Return a copy
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
        const user = users.find(u => u._id === "user1");
        if (!user) return new Response(404, {}, { message: 'User not found' });

        // Add dynamic counts
        const userPosts = posts.filter(post => post.author._id === "user1");
        const userFriends = friendships.filter(
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
        const user = users.find(u => u._id === id);

        if (!user) {
          return new Response(404, {}, { message: 'User not found' });
        }

        // Add dynamic counts
        const userPosts = posts.filter(post => post.author._id === id);
        const userFriends = friendships.filter(
          fs => (fs.from === id || fs.to === id) && fs.status === 'accepted'
        );

        return {
          ...user, // Return a copy
          postCount: userPosts.length,
          friendCount: userFriends.length
        };
      });

      // GET USERS LIST
      this.get('/users', (schema, request) => {
        const { name = '' } = request.queryParams;
        console.log(`🔶 Mock Get Users List: name='${name}'`);

        let filteredUsers = users.filter(
          user => user.name.toLowerCase().includes(name.toLowerCase())
        );

        return { users: filteredUsers, totalPages: 1, count: filteredUsers.length };
      });
      
      // UPDATE USER PROFILE (Simplified: just returns the updated data)
      this.put('/users/me', (schema, request) => {
          const updatedData = JSON.parse(request.requestBody);
          console.log(`🔶 Mock Update User Profile (user1):`, updatedData);
          const userIndex = users.findIndex(u => u._id === "user1");
          if (userIndex > -1) {
            // Update in-memory data (won't persist refresh)
            users[userIndex] = { ...users[userIndex], ...updatedData };
            return { ...users[userIndex] }; // Return the merged data
          }
          return new Response(404, {}, { message: 'User not found' });
      });


      // --- Post Routes ---
      // GET FEED POSTS (for user1, includes friends posts, paginated)
      this.get('/posts', (schema, request) => {
        console.log(`🔶 Mock Get All Posts`);
        // Get user1's accepted friends
        const userFriendships = friendships.filter(
          fs => (fs.from === "user1" || fs.to === "user1") && fs.status === 'accepted'
        );
        const friendIds = userFriendships.map(fs => fs.from === "user1" ? fs.to : fs.from);
        const relevantUserIds = ["user1", ...friendIds];

        // Filter posts by author (user1 or friends)
        let relevantPosts = posts.filter(post => relevantUserIds.includes(post.author._id));

        // Sort by creation date, newest first
        relevantPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalPosts = relevantPosts.length;
        const totalPages = Math.ceil(totalPosts / 10);
        const start = (parseInt(request.queryParams.page) - 1) * 10;
        const end = start + 10;
        const paginatedPosts = relevantPosts.slice(start, end);

        // Add comment counts and reactions
        const results = paginatedPosts.map(post => {
          const postComments = comments.filter(comment => comment.post === post._id);
          const postReactions = reactions.filter(reaction =>
            reaction.targetType === 'Post' && reaction.targetId === post._id
          );
          return {
            ...post, // Return copy
            commentCount: postComments.length,
            reactions: postReactions
          };
        });

        return { posts: results, count: totalPosts, totalPages: totalPages };
      });

      // GET POSTS BY USER ID (paginated)
      this.get('/posts/user/:userId', (schema, request) => {
        const userId = request.params.userId;
        console.log(`🔶 Mock Get Posts for User: ${userId}`);
        let userPosts = posts.filter(post => post.author._id === userId);

        // Sort by creation date, newest first
        userPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalPosts = userPosts.length;
        const totalPages = Math.ceil(totalPosts / 10);
        const start = (parseInt(request.queryParams.page) - 1) * 10;
        const end = start + 10;
        const paginatedPosts = userPosts.slice(start, end);

        // Add comment counts and reactions
        const results = paginatedPosts.map(post => {
          const postComments = comments.filter(comment => comment.post === post._id);
          const postReactions = reactions.filter(reaction =>
            reaction.targetType === 'Post' && reaction.targetId === post._id
          );
          return {
            ...post, // Return copy
            commentCount: postComments.length,
            reactions: postReactions
          };
        });

        return { posts: results, count: totalPosts, totalPages: totalPages };
      });

      // CREATE POST (as user1)
      this.post('/posts', (schema, request) => {
        const { content, image = null } = JSON.parse(request.requestBody);
        console.log(`🔶 Mock Create Post (user1): content="${content.substring(0, 20)}..."`);
        const currentUser = users.find(u => u._id === "user1");

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
        posts.unshift(newPost);

        return newPost; // Return the created post
      });
      
      // DELETE POST (Simplified: removes from in-memory array)
      this.delete('/posts/:postId', (schema, request) => {
        const { postId } = request.params;
        console.log(`🔶 Mock Delete Post: postId=${postId}`);
        const index = posts.findIndex(p => p._id === postId);
        // Basic check: Only allow user1 to delete their own posts in mock
        if (index > -1 && posts[index].author._id === "user1") {
            posts.splice(index, 1);
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
        const postId = request.params.postId;
        console.log(`🔶 Mock Get Comments for Post: ${postId}`);
        let postComments = comments.filter(comment => comment.post === postId);

        // Sort by creation date, newest first
        postComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalComments = postComments.length;
        const totalPages = Math.ceil(totalComments / 10);
        const start = (parseInt(request.queryParams.page) - 1) * 10;
        const end = start + 10;
        const paginatedComments = postComments.slice(start, end);

        // Add reactions to comments
        const results = paginatedComments.map(comment => {
          const commentReactions = reactions.filter(reaction =>
            reaction.targetType === 'Comment' && reaction.targetId === comment._id
          );
          return {
            ...comment, // Return copy
            reactions: commentReactions
          };
        });

        return { comments: results, count: totalComments, totalPages: totalPages };
      });

      // ADD COMMENT (as user1)
      this.post('/comments', (schema, request) => {
        const { content, postId } = JSON.parse(request.requestBody);
        console.log(`🔶 Mock Add Comment (user1): postId=${postId}, content="${content.substring(0, 20)}..."`);
        const currentUser = users.find(u => u._id === "user1");

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
        comments.unshift(newComment);

        return newComment; // Return the created comment
      });


      // --- Reaction Routes ---
      // ADD/UPDATE/REMOVE REACTION (as user1)
      this.post('/reactions', (schema, request) => {
        const { targetType, targetId, emoji } = JSON.parse(request.requestBody);
        console.log(`🔶 Mock Reaction (user1): type=${targetType}, id=${targetId}, emoji=${emoji}`);
        const currentUser = users.find(u => u._id === "user1");

        // Find if user1 already reacted to this target
        const existingReactionIndex = reactions.findIndex(reaction =>
          reaction.targetType === targetType &&
          reaction.targetId === targetId &&
          reaction.author._id === currentUser._id
        );

        if (existingReactionIndex !== -1) {
          // Existing reaction found
          if (reactions[existingReactionIndex].emoji === emoji) {
            // Same emoji clicked again: remove reaction (toggle off)
            console.log(` -> Removing reaction`);
            reactions.splice(existingReactionIndex, 1);
          } else {
            // Different emoji clicked: update reaction
            console.log(` -> Updating reaction emoji`);
            reactions[existingReactionIndex].emoji = emoji;
          }
        } else {
          // No existing reaction: add new reaction
          console.log(` -> Adding new reaction`);
          reactions.push({
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
        return reactions.filter(reaction =>
          reaction.targetType === targetType && reaction.targetId === targetId
        );
      });


      // --- Friendship Routes (User1's perspective) ---
      // GET FRIENDS LIST (accepted friends of user1)
      this.get('/friends', (schema, request) => {
        const { name = '' } = request.queryParams;
        console.log(`🔶 Mock Get Friends (for user1): name='${name}'`);
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

      // GET INCOMING FRIEND REQUESTS (requests sent TO user1)
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
        // Simulate adding a pending request (won't persist refresh)
        const existing = friendships.find(fs => (fs.from === "user1" && fs.to === targetUserId) || (fs.to === "user1" && fs.from === targetUserId));
        if (!existing) {
            friendships.push({
                _id: `friendship-${Date.now()}`,
                from: "user1",
                to: targetUserId,
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return { success: true, message: "Friend request sent." };
        } else {
             return new Response(400, {}, { message: "Friendship already exists or pending." });
        }
      });

      // ACCEPT/DECLINE FRIEND REQUEST (action on request where user1 is the recipient)
      // PUT /friends/requests/:requesterId?action=accept or action=decline
      this.put('/friends/requests/:requesterId', (schema, request) => {
        const { requesterId } = request.params;
        const { action } = request.queryParams; // 'accept' or 'decline'
        console.log(`🔶 Mock Action on Incoming Request: requester=${requesterId}, action=${action}`);
        const requestIndex = friendships.findIndex(fs => fs.from === requesterId && fs.to === "user1" && fs.status === 'pending');

        if (requestIndex > -1) {
            if (action === 'accept') {
                friendships[requestIndex].status = 'accepted';
                friendships[requestIndex].updatedAt = new Date().toISOString();
                return { success: true, message: "Friend request accepted." };
            } else if (action === 'decline') {
                // Could change status to 'declined' or just remove it
                friendships.splice(requestIndex, 1); 
                return { success: true, message: "Friend request declined." };
            } else {
                 return new Response(400, {}, { message: "Invalid action." });
            }
        } else {
            return new Response(404, {}, { message: "Incoming friend request not found." });
        }
      });

      // CANCEL FRIEND REQUEST (action on request sent BY user1)
      // DELETE /friends/requests/:recipientId
      this.delete('/friends/requests/:recipientId', (schema, request) => {
        const { recipientId } = request.params;
        console.log(`🔶 Mock Cancel Outgoing Request: user1 -> ${recipientId}`);
        const requestIndex = friendships.findIndex(fs => fs.from === "user1" && fs.to === recipientId && fs.status === 'pending');

        if (requestIndex > -1) {
            friendships.splice(requestIndex, 1); // Remove the pending request
            return { success: true, message: "Friend request cancelled." };
        } else {
            return new Response(404, {}, { message: "Outgoing friend request not found." });
        }
      });
      
      // UNFRIEND USER
      // DELETE /friends/:friendId
      this.delete('/friends/:friendId', (schema, request) => {
        const { friendId } = request.params;
         console.log(`🔶 Mock Unfriend: user1 <-> ${friendId}`);
        const friendshipIndex = friendships.findIndex(
            fs => ((fs.from === "user1" && fs.to === friendId) || (fs.to === "user1" && fs.from === friendId)) && fs.status === 'accepted'
        );

        if (friendshipIndex > -1) {
            friendships.splice(friendshipIndex, 1); // Remove the friendship
            return { success: true, message: "User unfriended." };
        } else {
            return new Response(404, {}, { message: "Friendship not found." });
        }
      });
      
      // Fallback for unhandled routes
      this.passthrough(); // Allows requests not handled by Mirage to pass through
      this.urlPrefix = ''; // Reset URL Prefix if needed for passthrough
      this.namespace = ''; // Reset namespace if needed
      // Example: Allow requests to external APIs if needed
      // this.passthrough('https://api.example.com/**'); 
    }
  });
}
```

Finally, update your `src/main.jsx` file to *conditionally* start the mock server only in development mode *if* a real API URL isn't provided via environment variables.

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Import Tailwind CSS
import './index.css';

// Start mock server conditionally (only in development and if no VITE_API_URL)
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  // Dynamically import the mock server setup only when needed
  import('./mockApi/server').then(({ mockServer }) => {
    mockServer({ environment: 'development' });
    console.log('🔶 Mock API Server Started (Development Mode)');
  });
} else if (import.meta.env.VITE_API_URL) {
  console.log(` Bypassing mock server. Using real API at: ${import.meta.env.VITE_API_URL}`);
}

const container = document.getElementById('root');
const root = createRoot(container); // Create a root.

// Render the app
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

> **Recap & Reminder:** You've just added the MirageJS mock API setup. Remember, you copied `data.js` and `server.js`. The code in `server.js` defines fake API endpoints that our app will talk to. `main.jsx` now starts this mock server *only* when we run `npm run dev` and don't have a real API configured. **Don't worry about the internal logic of `server.js` for now!**

## 8. Create a Basic App Component

Update your `src/App.jsx` file to be a minimal starting point:

```jsx
// src/App.jsx
import React from "react";

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-primary text-center my-8">
        Welcome to CoderComm
      </h1>
      <p className="text-center text-muted-foreground"> 
        A social media application for developers, built step-by-step!
      </p>
      {/* We'll replace this content with our Router in the next step */}
    </div>
  );
}

export default App;
```

## 9. Run the Application

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` (or the port Vite assigns) in your browser. You should see the basic "Welcome to CoderComm" message. Check your browser's console - you should see the message "🔶 Mock API Server Started..." indicating MirageJS is running.

## 10. Frequently Asked Questions (FAQ)

*   **Q: What is Vite? Why not Create React App (CRA)?**
    *   A: Vite is a modern frontend build tool. It offers significantly faster development server startup and Hot Module Replacement (HMR) compared to older tools like CRA, leading to a smoother development experience.
*   **Q: What is TailwindCSS?**
    *   A: Tailwind is a utility-first CSS framework. Instead of writing custom CSS rules, you apply pre-defined utility classes directly in your HTML/JSX (e.g., `text-blue-500`, `p-4`, `flex`). This speeds up styling and maintains consistency.
*   **Q: What is ShadCN UI? Why use it with Tailwind?**
    *   A: ShadCN UI provides beautifully designed, accessible UI components (Buttons, Cards, Forms, etc.) that you *copy* into your project, built using Tailwind classes. Unlike libraries like Material UI or Chakra UI, you own the code, making customization easier. It works seamlessly *with* Tailwind. We initialize it (`shadcn init`) and then add specific components as needed.
*   **Q: Why use absolute imports (`@/components/...`)?**
    *   A: Absolute imports make it easier to move files around without breaking import paths. `@/` points to your `src/` directory, so `import Button from '@/components/ui/button'` works from anywhere in `src/` without needing `../../..`.
*   **Q: What is MirageJS again? Do I need to learn it?**
    *   A: MirageJS creates a *fake* backend API that runs *only in your browser*. It intercepts network requests from your app (like login requests) and sends back predefined responses. This lets you build the entire frontend *as if* a real backend exists. **You don't need to learn MirageJS internals for this tutorial.** Just copy the provided files; we'll focus on how our React code *calls* the fake API endpoints.
*   **Q: What are Development Dependencies (`--save-dev` or `-D`)?**
    *   A: These are tools needed only during development (like MirageJS for mocking, Tailwind for building CSS) and not required for the final production build that users interact with.

## What's Next?

In the next step, we'll dive into the **Authentication System**. We'll create the Login and Registration pages, set up our global state management with **Zustand**, and protect routes so only logged-in users can access certain parts of the app. 