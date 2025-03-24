# Finalization and Deployment

In this final step, we'll optimize our application, add error handling, and prepare it for deployment.

## Create ProfileCard Component

Let's create a reusable ProfileCard component for quick user profile access:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_AVATAR } from "@/lib/config";

function ProfileCard({ user, showActions = false }) {
  if (!user) return null;
  
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-24 bg-gradient-to-r from-blue-400 to-primary"
        style={{ 
          backgroundImage: user.coverUrl ? `url(${user.coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      
      <CardContent className="pt-0 relative">
        <div className="flex justify-center">
          <div className="absolute -top-12 ring-4 ring-white rounded-full overflow-hidden">
            <img
              src={user.avatarUrl || DEFAULT_AVATAR}
              alt={user.name}
              className="h-24 w-24 object-cover"
            />
          </div>
        </div>
        
        <div className="mt-14 text-center">
          <Link to={`/user/${user.id}`} className="block">
            <h3 className="text-xl font-semibold hover:text-primary">
              {user.name}
            </h3>
          </Link>
          
          {user.jobTitle && (
            <p className="text-gray-500">
              {user.jobTitle}{user.company ? ` at ${user.company}` : ''}
            </p>
          )}
          
          <div className="mt-2 flex justify-center space-x-4 text-sm text-gray-500">
            <div>
              <span className="font-semibold text-gray-900">{user.postCount || 0}</span> posts
            </div>
            <div>
              <span className="font-semibold text-gray-900">{user.friendCount || 0}</span> friends
            </div>
          </div>
          
          {showActions && (
            <div className="mt-4">
              <Link 
                to={`/user/${user.id}`}
                className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
              >
                View Profile
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileCard;
```

## Add Error Handling Component

Create a reusable error component in `src/components/ErrorDisplay.jsx`:

```jsx
import React from "react";

function ErrorDisplay({ error, onRetry }) {
  return (
    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
      <div className="flex items-start">
        <svg 
          className="w-5 h-5 mr-2 mt-0.5 text-red-500 flex-shrink-0" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
        
        <div>
          <h3 className="text-lg font-semibold">An error occurred</h3>
          <p className="mt-1">{error.message || "Something went wrong. Please try again."}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium px-4 py-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
```

## Optimize Loading Screens for All Components

Let's ensure our loading screens are consistent. Update any remaining loading indicators to use our LoadingScreen component.

## Create A Proper 404 Page

Update `src/pages/NotFoundPage.jsx` with a better 404 page:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | CoderComm</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        
        <div className="-mt-16 relative">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                to="/"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Back to Home
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFoundPage;
```

## Prepare for Production Build

Update your `vite.config.js` for production:

```javascript
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
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: true,
    chunkSizeWarningLimit: 1600,
  },
})
```

## Update README.md

Let's create a proper README for our project:

```markdown
# CoderComm

CoderComm is a social media platform for developers, built with React, Zustand, React Query, and Tailwind CSS.

## Features

- User authentication (login/register)
- User profiles
- Posts and comments
- Reactions to posts and comments
- Friend management (requests, accepting, canceling)
- Real-time notifications
- User search

## Technology Stack

- **Frontend**:
  - React 18
  - Vite
  - React Router for routing
  - React Query for data fetching and caching
  - Zustand for state management
  - Tailwind CSS for styling
  - React Hook Form for form handling
  - Shadcn UI for UI components

## Prerequisites

- Node.js 16.x or newer
- npm or yarn

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/codercomm-fe.git
   cd codercomm-fe
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Configuration

By default, the application uses a mock API for development. To connect to a real backend:

1. Create a `.env` file in the project root
2. Add the following:
   ```
   VITE_API_URL=https://your-api-url.com
   ```

## Build for Production

To build the application for production:

```
npm run build
```

The built files will be in the `build` directory.

## Deploy to Firebase

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase:
   ```
   firebase init hosting
   ```

4. Select your Firebase project
5. Set the public directory to `build`
6. Configure as a single-page app
7. Deploy:
   ```
   firebase deploy
   ```

## Learn More

To learn more about the technologies used:

- [React Documentation](https://reactjs.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
```

## Create a Firebase Configuration for Deployment

If you want to deploy to Firebase, create `firebase.json` in your project root:

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

And a deploy script `deploy.sh`:

```bash
#!/bin/bash
echo "Building for production..."
npm run build

echo "Deploying to Firebase..."
firebase deploy --only hosting

echo "Deployment complete!"
```

Make the script executable:

```bash
chmod +x deploy.sh
```

## Build and Deploy Your Application

Now, build your application:

```bash
npm run build
```

You can serve the built version locally to test it:

```bash
npm install -g serve
serve -s build
```

For deployment, you can use Firebase Hosting, Netlify, Vercel, or any other static hosting service.

To deploy to Firebase:

```bash
./deploy.sh
```

## Final Testing

Before considering the project complete, do a final round of testing to ensure all features work correctly:

1. **Authentication**:
   - Registration
   - Login
   - Logout
   - Token refresh

2. **User Profile**:
   - View profile
   - Edit profile
   - Update profile picture
   - Update social links

3. **Posts**:
   - Create posts
   - Like/react to posts
   - Pagination/infinite scroll

4. **Comments**:
   - Create comments
   - Like/react to comments
   - Delete comments

5. **Friends**:
   - Send friend requests
   - Accept friend requests
   - Decline friend requests
   - Remove friends
   - View friends list

6. **Navigation**:
   - All links working
   - Protected routes functioning
   - Redirects working

7. **Error Handling**:
   - API error handling
   - Loading states
   - Empty states
   - 404 page

## Conclusion

Congratulations! You've built a complete social media platform for developers using modern React practices. This project covers many important concepts in frontend development:

- Modern React with hooks
- Data fetching and caching with React Query
- State management with Zustand
- Styling with Tailwind CSS
- Form handling with React Hook Form
- Authentication and authorization
- Routing with React Router
- Component design and composition
- Error handling and loading states

You now have a solid foundation for building more complex applications with React. Feel free to extend this project with additional features or use it as a reference for future projects.