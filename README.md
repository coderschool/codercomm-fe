# CoderComm - Modern React Social Network

CoderComm is a social media web application with core features inspired by Facebook. This project is built using modern React best practices for teaching the FTW (Frontend Web Development) course at CoderSchool.

## Key Features

### Authentication
- Register with name, email, password
- Login with email and password

### User Profiles
- View and edit personal profile
- Update avatar and cover photo via URLs
- View other users' profiles

### Posts
- Create, and view posts
- Like and dislike posts
- View posts from friends

### Comments
- Create comments on posts
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
- **shadcn/ui** - Component collection built with Radix UI and Tailwind CSS

### State Management & Data Fetching
- **React Query** - Data fetching, caching, and state management for server state
- **Zustand** - Lightweight state management for UI state
- **React Hook Form** - Form handling with validation

### Other Technologies
- **Axios** - HTTP client for API requests
- **date-fns** - Date utilities
- **yup** - Schema validation
- **Lucide React** - Modern icon library
- **react-helmet-async** - Document head manager
- **MirageJS** - Mock API server for development and testing

## Project Structure

```
src/
├── components/         # Reusable components
│   └── ui/             # UI components from shadcn/ui
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

## Simplified Architecture

This project has been intentionally simplified to focus on modern React patterns:

- No image upload functionality (uses URLs for profile images)
- Clean component architecture with shadcn/ui
- Direct use of React Hook Form with shadcn/ui form components
- Zustand for global state management
- React Query for server state and data fetching

## UI Component System

This project uses the [shadcn/ui](https://ui.shadcn.com/) component system, which provides:

- Accessible, customizable components based on Radix UI primitives
- Fully styled with Tailwind CSS
- No external runtime dependencies, everything is part of your project
- Components are copied and pasted directly into your project, not installed as a dependency
- Components are maintained within the codebase, allowing full customization

### shadcn/ui Components Included

- Avatar - User avatars with image and fallback
- Button - Versatile buttons with variants
- Card - Card containers with header, content, footer
- Checkbox - Form checkbox inputs
- Dialog - Modal dialog boxes
- Dropdown Menu - Contextual dropdown menus
- Form - Complete form validation system
- Input - Text input fields
- Label - Accessible form labels
- Select - Dropdown select components
- Sheet - Slide-out panels
- Tabs - Tabbed interface components

### Adding shadcn/ui Components

If needed, more components can be added using the shadcn CLI:

```bash
npx shadcn@latest add [component-name]
```

## Component Architecture

This project follows a component-first approach. Instead of importing components from a library:

1. Components are added directly to the project using the shadcn/ui CLI
2. Components are fully editable and customizable
3. The structure encourages learning how components work
4. Components are built using Radix UI for accessibility and Tailwind CSS for styling

This approach gives students:
- Full control over the components
- Better understanding of how components work
- Ability to customize without fighting against a library
- Experience with modern Tailwind CSS-based workflows

## Build for Production

```bash
npm run build
```

## Learn More

This project demonstrates modern React best practices:

- **React Query** for data fetching and caching
- **Zustand** for simple state management
- **Tailwind CSS** for utility-first styling
- **shadcn/ui pattern** for component architecture
- **React Hook Form** for efficient form handling
- **Radix UI** for accessible UI components
- **Component composition** for reusable UI
- **Custom hooks** for shared logic
- **MirageJS** for API mocking