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
npm install axios

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
> Your task here is to **ensure you have the correct mock API files** from the project repository. We've pre-configured this mock server to handle all the API requests our frontend will make throughout the tutorial. Treat it as a "black box" that just works for now. We'll focus on how our React components *interact* with this mock API in later steps.

MirageJS lets us build, test, and share a complete working frontend without depending on any backend services yet.

**Action:**

1.  Navigate to the `src/mockApi/` directory in the **provided source code** for this tutorial project.
2.  Copy the two files, `data.js` and `server.js`, from that directory.
3.  Paste these two files into the `src/mockApi/` directory within **your own `codercomm-fe` project**.

These files contain the sample data and the mock server logic, respectively, that define the API routes (like `/api/auth/login`, `/api/posts`) and the data they return.

## 8. Integrate Mock Server into Application

To make sure our mock API runs when we start the development server, we need to initialize it in our main application entry point.

Update `src/main.jsx` to include the following:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { mockServer } from './mockApi/server' // Import the mock server

// Start the mock server in development environment
if (process.env.NODE_ENV === 'development') {
  mockServer();
  console.log("🔶 Mock API Server Started!");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

This code imports the `mockServer` function and calls it if the application is running in the development environment (`NODE_ENV === 'development'`). Vite automatically sets this environment variable. Now, whenever you run `npm run dev`, the mock API will be active.

## 9. Initial Run and Verification

Let's make sure everything is set up correctly.

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
2.  **Open your browser:** Navigate to the local URL provided by Vite (usually `http://localhost:5173`).
3.  **Check the console:** Open your browser's developer console. You should see the message "🔶 Mock API Server Started!". You might also see console logs from MirageJS whenever the frontend tries to make an API request (which it isn't doing yet, but will soon).
4.  **View the basic page:** You should see the default Vite + React landing page content, styled with basic Tailwind styles inherited from `index.css`.

If the server starts without errors and you see the console message, your basic setup is complete!

## Summary

In this step, we have:

-   Created a new React project using Vite.
-   Installed essential dependencies for routing (`react-router-dom`), UI (`ShadCN UI`, `TailwindCSS`), forms (`react-hook-form`, `yup`), state management (`zustand`), API calls (`axios`), and utilities.
-   Configured TailwindCSS and initialized ShadCN UI.
-   Set up absolute imports using `jsconfig.json` and `vite.config.js`.
-   Established a basic project folder structure.
-   Copied and integrated the MirageJS mock API server (`data.js`, `server.js`) to simulate backend interactions during development.
-   Verified the setup by running the development server.

You now have a solid foundation to start building the CoderComm application features. 