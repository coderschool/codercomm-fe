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
- **Material UI v5** - Component library with emotion styling

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
- Set `VITE_USE_MOCK_API=true` to use the mock API (no backend needed)
- Or set up Cloudinary for image uploads with real backend

4. Start the development server:
```bash
# With mock API
npm run dev:mock

# Or with real API
npm run dev
```

## Using the Mock API

This project includes a mock API server using MirageJS, which provides in-memory data for development and testing. The mock API:

- Works entirely client-side with no external dependencies
- Includes realistic sample data for users, posts, comments, etc.
- Implements all the endpoints needed for the application
- Handles authentication with mock tokens

To use the mock API:
1. Set `VITE_USE_MOCK_API=true` in your `.env` file
2. Run `npm run dev:mock`
3. Login with any of the sample users:
   - Email: `john@example.com` (or any email from the mock data)
   - Password: `password` (all mock users use this password)

## Cloudinary Setup (for real API)

If using the real API:

1. Sign up for a [Cloudinary](https://cloudinary.com/) account
2. Create an **unsigned** upload preset in your Cloudinary dashboard
3. Add your Cloudinary cloud name and upload preset to the `.env` file:
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset
```

## Build for Production

```bash
npm run build
```

## Learn More

This project demonstrates modern React best practices:

- **React Query** for data fetching and caching
- **Zustand** for simple, flexible state management
- **React Hook Form** for efficient form handling
- **Component composition** for reusable UI
- **Custom hooks** for shared logic
- **Material UI** theming and styling
- **MirageJS** for API mocking