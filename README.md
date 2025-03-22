# CoderComm - Modern React Social Network

CoderComm is a social media web application with core features inspired by Facebook. This project is built using modern React best practices for teaching the FTW (Frontend Web Development) course at CoderSchool.

## Key Features

### Authentication
- Register with name, email, password
- Login with email and password

### User Profiles
- View and edit personal profile
- Update avatar, cover photo, and personal information
- View other users' profiles

### Posts
- Create, edit, and delete posts
- Attach images to posts
- Like and dislike posts
- View posts from friends

### Comments
- Create, edit, and delete comments on posts
- Like and dislike comments

### Friends
- Send, accept, or decline friend requests
- View friend list
- Unfriend users

## Modern Tech Stack (2025)

### Core Technologies
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Next-generation build tool for faster development
- **React Router 6** - Declarative routing for React
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Shadcn UI** - Component collection built with Radix UI and Tailwind CSS

### State Management & Data Fetching
- **React Query** - Data fetching, caching, and state management for server state
- **Zustand** - Lightweight state management for UI state
- **React Hook Form** - Form handling with validation

### Other Technologies
- **Axios** - HTTP client for API requests
- **Cloudinary** - Cloud storage for images
- **date-fns** - Date utilities
- **yup** - Schema validation
- **react-helmet-async** - Document head manager
- **MirageJS** - Mock API server for development and testing

## Project Structure

```
src/
├── components/         # Reusable components
│   └── ui/             # UI components using Shadcn UI / Radix
├── features/           # Feature-based modules
│   ├── comment/        # Comment-related components and hooks
│   ├── friend/         # Friend-related components and hooks
│   ├── post/           # Post-related components and hooks
│   └── user/           # User-related components and hooks
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
├── lib/                # Core utilities and configurations
│   ├── apiService.js   # Axios instance and interceptors
│   ├── auth.js         # Authentication utilities
│   ├── cloudinary.js   # Cloudinary integration
│   ├── config.js       # Application configuration
│   ├── formatters.js   # Formatting utilities
│   ├── utils.js        # Utility functions for Tailwind
│   └── store.js        # Zustand store
├── mockApi/            # Mock API server and data
│   ├── data.js         # Mock data for development
│   └── server.js       # MirageJS server configuration
├── pages/              # Application pages
└── routes/             # Route configurations
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd codercomm-fe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Create a `.env` file based on `.env.example`
- By default, the mock API will be used (no backend needed)
- To use a real API, uncomment and set the `VITE_API_URL` in the `.env` file

4. Start the development server:
```bash
npm run dev
```

## Using the Mock API

This project includes a mock API server using MirageJS, which provides in-memory data for development and testing. The mock API is used automatically when no `VITE_API_URL` is provided, and:

- Works entirely client-side with no external dependencies
- Includes realistic sample data for users, posts, comments, etc.
- Implements all the endpoints needed for the application
- Handles authentication with mock tokens

You can log in with any of the sample user emails (e.g., `john@example.com`, `jane@example.com`) using the password `password` for all users.

## Cloudinary Setup (for real API)

If using a real API:

1. Sign up for a [Cloudinary](https://cloudinary.com/) account
2. Create an **unsigned** upload preset in your Cloudinary dashboard
3. Uncomment and set the Cloudinary environment variables in your `.env` file:
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset
```

## Build for Production

```bash
npm run build
```

## Component Architecture

This project uses a component-first approach inspired by Shadcn UI. Instead of importing pre-built components from a library, we:

1. Copy and adapt components from Shadcn UI as needed
2. Style them with Tailwind CSS
3. Customize them to fit our application

This approach gives students:
- Full control over the components
- Better understanding of how components work
- Ability to customize without fighting against a library
- Experience with modern Tailwind-based workflows

## Learn More

This project demonstrates modern React best practices:

- **React Query** for data fetching and caching
- **Zustand** for simple, flexible state management
- **Tailwind CSS** for utility-first styling
- **Shadcn UI pattern** for component architecture
- **React Hook Form** for efficient form handling
- **Component composition** for reusable UI
- **Custom hooks** for shared logic
- **MirageJS** for API mocking