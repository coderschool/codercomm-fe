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
// Sample users with relative creation dates
export const users = [
  {
    _id: "user1",
    username: "learnreact",
    name: "Nguyen Van React",
    email: "reactlover@coderschool.vn",
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
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year ago
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
    createdAt: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000).toISOString() // 340 days ago
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
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString() // 300 days ago
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
    createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString() // 270 days ago
  },
  {
    _id: "user5",
    username: "devopswhiz",
    name: "Hoang The Cloud",
    email: "cloudguru@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=hoangcloud",
    coverUrl: "https://picsum.photos/id/1039/800/200",
    aboutMe: "If it works on your machine, I'll make it work in production",
    city: "Can Tho",
    country: "Vietnam",
    company: "Cloud Crusaders",
    jobTitle: "DevOps Engineer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString() // 240 days ago
  }
];

// Sample posts with relative creation dates
// Posts that user1 can see (from user1 or his friends)
export const posts = [
  {
    _id: "post1",
    content: "Just built my first React component! Took me 5 cups of cà phê sữa đá but it was worth it! 🚀",
    image: "https://picsum.photos/id/237/800/400",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
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
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
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
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "post4",
    content: "Learning React Hooks is like learning to use đũa (chopsticks) - awkward at first, but then you can't imagine coding without them! 🥢",
    image: "https://picsum.photos/id/24/800/400",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "post5",
    content: "Designed a mobile-responsive website that looks good on everything from an iPhone 13 Pro Max to my grandmother's Nokia! 📱",
    image: "https://picsum.photos/id/28/800/400",
    author: {
      _id: "user2", // Friend of user1
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "post6",
    content: "Optimized our database queries and now the app loads faster than you can say 'một, hai, ba, yo!' ⚡",
    image: "https://picsum.photos/id/4/800/400",
    author: {
      _id: "user3", // Friend of user1
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Sample comments with relative creation dates
// Only comments on posts that user1 can see
export const comments = [
  {
    _id: "comment1",
    content: "Siêu đỉnh! Can you share your code on GitHub?",
    post: "post1",
    author: {
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 3 days ago + 2 hours
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "comment2",
    content: "Quá đẹp! Did you use Redux for state management?",
    post: "post1",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 3 days ago + 4 hours
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
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
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 4 days ago + 3 hours
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "comment4",
    content: "useEffect(() => { setSoup('delicious') }, [hunger]); Best hook ever!",
    post: "post4",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // 14 days ago + 5 hours
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString()
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
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // 21 days ago + 6 hours
    updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString()
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
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 30 days ago + 4 hours
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
  }
];

// Sample reactions with relative creation dates
// Only reactions to posts or comments that user1 can see
export const reactions = [
  {
    _id: "reaction1",
    targetType: "Post",
    targetId: "post1",
    emoji: "like",
    author: {
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString() // 3 days ago + 1 hour
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString() // 3 days ago + 3 hours
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
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString() // 4 days ago + 2 hours
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString() // 3 days ago + 2.5 hours
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
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000).toISOString() // 4 days ago + 3.5 hours
  }
];

// Sample friendships with relative creation dates
// Focus on friendships involving user1
export const friendships = [
  {
    _id: "friendship1",
    from: "user1", // Nguyen
    to: "user2",   // Tran
    status: "accepted",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString() // 90 days ago + 1 hour
  },
  {
    _id: "friendship2",
    from: "user1", // Nguyen
    to: "user3",   // Le
    status: "accepted",
    createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(), // 85 days ago
    updatedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString() // 85 days ago + 1 hour
  },
  {
    _id: "friendship3",
    from: "user1", // Nguyen 
    to: "user5",   // Hoang
    status: "pending",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship4",
    from: "user4", // Pham
    to: "user1",   // Nguyen
    status: "pending",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship5",
    from: "user3", // Le
    to: "user1",   // Nguyen
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship6",
    from: "user2", // Tran
    to: "user1",   // Nguyen 
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship7",
    from: "user1", // Nguyen
    to: "user4",   // Pham
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship8",
    from: "user5", // Hoang
    to: "user1",   // Nguyen
    status: "pending",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];
```

Next, create the main server file `src/mockApi/server.js`:

```js
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