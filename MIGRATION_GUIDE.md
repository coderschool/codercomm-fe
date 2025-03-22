# CoderComm Migration Guide

This guide explains how to migrate the CoderComm application from Create React App to Vite and from Redux to React Query + Zustand.

## Migration Steps

### 1. Project Setup

- Update `package.json` with new dependencies and scripts
- Create Vite configuration file (`vite.config.js`)
- Create new `index.html` in the root (required by Vite)
- Update environment variable names from `REACT_APP_` to `VITE_`

### 2. Migration from Redux to React Query + Zustand

#### State Management Principles

- **Zustand** is used for UI state and global application state (e.g., current user)
- **React Query** is used for server state (data fetching, caching, synchronization)

#### Converting a Redux Slice

For each Redux slice (e.g., postSlice, userSlice), follow these steps:

1. Create a hooks file (e.g., `postHooks.js`) with React Query hooks:
   ```js
   // Example: Converting a Redux thunk to React Query hook
   export const useGetPosts = (page = 1) => {
     return useQuery({
       queryKey: ['posts', 'feed', page],
       queryFn: async () => {
         // Fetch logic here
         return response;
       },
     });
   };
   ```

2. Update components to use the new hooks:
   ```js
   // Before (Redux)
   const { posts, isLoading } = useSelector(state => state.post);
   const dispatch = useDispatch();
   useEffect(() => {
     dispatch(getPosts(page));
   }, [page, dispatch]);

   // After (React Query)
   const { data, isLoading } = useGetPosts(page);
   const posts = data?.posts || [];
   ```

### 3. Zustand Store

The central Zustand store (`store.js`) replaces Redux's store configuration:

```js
const useStore = create(
  devtools((set) => ({
    // State and actions grouped by feature
    user: { /* state */ },
    setCurrentUser: (user) => set((state) => ({
      user: { ...state.user, currentUser: user }
    })),
    // other state and actions...
  }))
);
```

#### Using Zustand Store in Components

```js
// Accessing state
const currentUser = useStore(state => state.user.currentUser);

// Using actions
const setCurrentUser = useStore(state => state.setCurrentUser);
setCurrentUser(user);
```

### 4. React 18 Updates

- Update ReactDOM rendering with `createRoot` API
- Enable React Strict Mode for better development experience
- Update any deprecated React 17 patterns

### 5. API Service Adjustments

- Update Axios interceptors if needed
- Ensure API responses are properly handled in React Query

### 6. Environment Variables

Update all environment variable references:

```js
// Before
process.env.REACT_APP_API_URL

// After
import.meta.env.VITE_API_URL
```

## Testing the Migration

1. Run the development server:
   ```
   npm run dev
   ```

2. Verify each feature works correctly:
   - Authentication (login/register)
   - Profile viewing and editing
   - Post creation, editing, deletion
   - Comments and reactions
   - Friend requests

## Benefits of the Migration

- **Performance**: Vite offers faster development and build times
- **Developer Experience**: React Query simplifies data fetching and caching
- **Code Simplicity**: Zustand reduces boilerplate compared to Redux
- **Modern Practices**: Aligns with current React ecosystem standards
- **Future-Proof**: Better positioned for future React updates