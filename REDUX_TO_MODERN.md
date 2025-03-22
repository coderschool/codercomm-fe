# Redux to React Query + Zustand Migration Map

This document provides a detailed mapping of how Redux patterns in the original CoderComm project translate to modern React Query and Zustand patterns.

## Redux Pattern vs Modern Pattern

| Redux Pattern | Modern Pattern | Benefits |
|---------------|---------------|----------|
| Store Configuration | Zustand Store | Less boilerplate, simpler API |
| Action Types | Not needed | Reduced code |
| Action Creators | Zustand actions | More intuitive, less code |
| Reducers | Zustand state setters | Simpler immutable updates |
| Thunks | React Query hooks | Automatic caching, refetching, status tracking |
| Selectors | Zustand selectors | Simpler, direct state access |
| Middleware | Zustand middleware | Optional when needed |

## Detailed Examples

### Redux Store → Zustand Store

**Before (Redux):**
```js
// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import postReducer from "../features/post/postSlice";
import userReducer from "../features/user/userSlice";

const rootReducer = combineReducers({
  post: postReducer,
  user: userReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
```

**After (Zustand):**
```js
// store.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools((set) => ({
    // Post slice
    post: {
      posts: [],
      totalPages: 0,
      loading: false,
      error: null,
    },
    
    // User slice  
    user: {
      currentUser: null,
      loading: false,
      error: null,
    },
    
    // Actions
    setPosts: (posts, totalPages) => set((state) => ({
      post: { ...state.post, posts, totalPages }
    })),
    
    setCurrentUser: (user) => set((state) => ({
      user: { ...state.user, currentUser: user }
    })),
  }))
);

export default useStore;
```

### Redux Slice → React Query Hooks + Zustand Actions

**Before (Redux Slice):**
```js
// postSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";

const initialState = {
  isLoading: false,
  error: null,
  postsById: {},
  currentPagePosts: [],
};

const slice = createSlice({
  name: "post",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    getPostsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      
      const { posts, count } = action.payload;
      posts.forEach((post) => {
        state.postsById[post._id] = post;
      });
      state.currentPagePosts = posts.map((post) => post._id);
      state.totalPosts = count;
    },
  },
});

export const getPosts = ({ userId, page = 1, limit = 5 }) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = { page, limit };
    const response = await apiService.get(`/posts/user/${userId}`, { params });
    dispatch(slice.actions.getPostsSuccess(response.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export default slice.reducer;
```

**After (React Query Hooks + Zustand Actions):**
```js
// postHooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import useStore from "../../app/store";

export const useGetPosts = (userId, page = 1, limit = 5) => {
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);
  
  return useQuery({
    queryKey: ['posts', userId, page],
    queryFn: async () => {
      setLoading('post', true);
      try {
        const params = { page, limit };
        const response = await apiService.get(`/posts/user/${userId}`, { params });
        return response;
      } catch (error) {
        setError('post', error.message);
        toast.error(error.message);
        throw error;
      } finally {
        setLoading('post', false);
      }
    },
    select: (data) => ({
      posts: data.posts,
      totalPosts: data.count,
    }),
  });
};
```

### Using Redux vs Modern Pattern in Components

**Before (Redux Component):**
```jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPosts } from "./postSlice";

function PostList({ userId }) {
  const { isLoading, error, currentPagePosts, postsById } = useSelector(
    (state) => state.post
  );
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getPosts({ userId }));
  }, [userId, dispatch]);
  
  const posts = currentPagePosts.map(id => postsById[id]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div>
      {posts.map(post => (
        <div key={post._id}>{post.content}</div>
      ))}
    </div>
  );
}
```

**After (React Query + Zustand Component):**
```jsx
import React from "react";
import { useGetPosts } from "./postHooks";

function PostList({ userId }) {
  const { data, isLoading, error } = useGetPosts(userId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  
  const { posts } = data || { posts: [] };
  
  return (
    <div>
      {posts.map(post => (
        <div key={post._id}>{post.content}</div>
      ))}
    </div>
  );
}
```

## Key Differences and Benefits

### 1. Declarative vs Imperative Data Fetching

- **Redux**: Imperative approach with explicit dispatch of actions
  ```js
  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);
  ```

- **React Query**: Declarative approach where the hook handles the fetching
  ```js
  const { data, isLoading } = useGetData();
  ```

### 2. State Management

- **Redux**: Global state for everything (UI state, server state, etc.)
- **Modern**: Separates concerns
  - **React Query**: Server state (data fetching, caching, synchronization)
  - **Zustand**: UI state and application state

### 3. Boilerplate Reduction

- **Redux**: Requires actions, reducers, selectors, etc.
- **Modern**: Minimal boilerplate
  - **React Query**: Handles loading, error, and data states automatically
  - **Zustand**: Simple state updates with direct setters

### 4. Performance Optimization

- **Redux**: Requires careful memoization to prevent unnecessary renders
- **Modern**: 
  - **React Query**: Built-in request deduplication, caching, and background updates
  - **Zustand**: Fine-grained subscriptions to prevent unnecessary re-renders

## Migration Tips

1. **Start with data fetching**: Convert Redux thunks to React Query hooks first
2. **Gradually replace Redux state**: Move global UI state to Zustand
3. **Use the DevTools**: Both React Query and Zustand have dev tools for debugging
4. **Test thoroughly**: Ensure behavior remains consistent after migration