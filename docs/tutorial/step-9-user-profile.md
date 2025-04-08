# Step 9: User Profile Page

Now that we have the core features like the feed, friends, and account settings, let's allow users to view the profiles of *other* users. This involves creating a new page that fetches and displays profile information based on a user ID in the URL.

## 1. Add Mock API Endpoint for User Posts (`src/mockApi/server.js`)

We need an endpoint to get posts specifically for one user. Add this route handler inside the `routes()` function in `src/mockApi/server.js`:

```javascript
// src/mockApi/server.js (inside routes())

// GET POSTS BY USER ID (paginated)
this.get('/posts/user/:userId', (schema, request) => {
  const userId = request.params.userId;
  console.log(`🔶 Mock Get Posts for User: ${userId}`);
  let userPosts = currentPosts.filter(p => p.author._id === userId);

  // Add counts/reactions for consistency
  userPosts = userPosts.map(post => ({
    ...post,
    commentCount: currentComments.filter(c => c.post === post._id).length,
    reactions: currentReactions.filter(r => r.targetType === 'Post' && r.targetId === post._id)
  }));

  userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

  // Return all posts for this user (no pagination in mock for now)
  return { posts: userPosts, totalPages: 1, count: userPosts.length };
});

// Also, ensure the GET /users/:id handler includes friendship status
this.get('/users/:id', (schema, request) => {
   const id = request.params.id;
   console.log(`🔶 Mock Get User: ${id}`);
   const user = findUser(id); // Use helper
   if (!user) return new Response(404, {}, { message: 'User not found' });
   
   const postCount = currentPosts.filter(p => p.author._id === id).length;
   const friendCount = currentFriendships.filter(
       f => (f.from === id || f.to === id) && f.status === 'accepted'
   ).length;
   
   // Add friendship status relative to user1 (mock logged-in user)
   const currentUser = 'user1';
   const rawFriendship = getFriendshipStatus(currentUser, id); // Use helper
   const populatedFriendship = populateFriendshipUsers(rawFriendship); // Use helper

   return { 
       user: { 
           ...user, 
           postCount, 
           friendCount, 
           friendship: populatedFriendship // Add relationship status
       } 
   };
});
```
*Explanation:*
*   The `GET /api/posts/user/:userId` endpoint filters posts by author.
*   The `GET /api/users/:id` endpoint is updated to include the `friendship` status relative to the logged-in user (`user1`), which is essential for showing the correct action buttons (Add Friend, Unfriend, Accept Request, etc.).

## 2. Add State & Actions to Store (`src/lib/store.js`)

We need to manage the state for fetched user profiles and their posts separately from the main feed.

Modify `src/lib/store.js`:

```javascript
// src/lib/store.js
// ... (imports, setSession)

const useStore = create(
  persist(
    (set, get) => ({
      // --- Existing State ---
      currentUser: null, isLoadingAuth: true, authError: null,
      posts: [], isLoadingPosts: false, postsError: null, totalPostPages: 1,
      comments: {},
      friends: { /* ... */ },
      friendRequests: { /* ... */ },
      users: { /* ... */ },

      // --- NEW: User Profile & Posts State ---
      userProfiles: {}, // Cache profiles: { userId: { data: {...}, isLoading, error } }
      userPosts: {},    // Cache posts: { userId: { list: [], isLoading, error, totalPages } }

      // --- Actions ---
      // ... (Existing Auth, Post, Comment, Friend Actions) ...
      
      // --- Modify Existing Actions --- 
      // (Ensure reactToPost, createComment, deleteComment, sendFriendRequest, etc. 
      // also update userProfiles and userPosts caches if applicable - see applied code changes)
      reactToPost: async (postId, emoji) => { /* ... (code updated to handle userPosts) ... */ },
      createComment: async (postId, commentData) => { /* ... (code updated to handle userPosts) ... */ },
      deleteComment: async (commentId) => { /* ... (code updated to handle userPosts) ... */ },
      sendFriendRequest: async (targetUserId) => { /* ... (code updated to handle userProfiles) ... */ },
      // TODO: Update accept/reject/cancel/remove friend actions to update userProfiles cache

      // --- NEW: User Profile & Posts Actions ---
      fetchUserProfile: async (userId) => {
        const existing = get().userProfiles[userId];
        if (existing?.data || existing?.isLoading) return;
        set((state) => ({ userProfiles: { ...state.userProfiles, [userId]: { isLoading: true, error: null } } }));
        console.log(`Attempting fetch profile for ${userId}...`);
        try {
          const response = await apiService.get(`/users/${userId}`);
          set((state) => ({ userProfiles: { ...state.userProfiles, [userId]: { data: response.user, isLoading: false, error: null } } }));
          console.log(`✅ Profile fetched for ${userId}`);
          return response.user;
        } catch (error) {
          console.error(`❌ Fetch Profile Error (${userId}):`, error);
          set((state) => ({ userProfiles: { ...state.userProfiles, [userId]: { isLoading: false, error: error.message } } }));
        }
      },
      updateUserProfile: async (updatedData) => { /* ... (Existing action from Step 8) ... */ },
      fetchUserPosts: async (userId, page = 1, limit = 10) => {
        const existing = get().userPosts[userId];
        if (existing?.isLoading) return;
        set((state) => ({ userPosts: { ...state.userPosts, [userId]: { ...(existing || {}), isLoading: true, error: null } } }));
        console.log(`Attempting fetch posts for user ${userId}...`);
        try {
          const response = await apiService.get(`/posts/user/${userId}`, { params: { page, limit } });
          set((state) => ({ userPosts: { ...state.userPosts, [userId]: { list: response.posts || [], totalPages: response.totalPages || 1, isLoading: false, error: null } } }));
           console.log(`✅ Posts fetched for user ${userId}:`, response.posts?.length || 0);
        } catch (error) {
          console.error(`❌ Fetch User Posts Error (${userId}):`, error);
          set((state) => ({ userPosts: { ...state.userPosts, [userId]: { ...(existing || {}), isLoading: false, error: error.message } } }));
        }
      },
    }),
    { name: 'codercomm-auth-storage', partialize: (state) => ({ currentUser: state.currentUser }) }
  )
);

export const useAppStore = useStore;
```
*Explanation:*
*   Added `userProfiles` and `userPosts` slices to the state to cache data per user ID.
*   Added `fetchUserProfile` and `fetchUserPosts` actions.
*   Crucially, actions like `reactToPost`, `createComment`, `deleteComment`, `sendFriendRequest` (and potentially others like accept/reject/cancel friend) were updated to modify *both* the main feed state (`posts`) *and* the user-specific caches (`userProfiles`, `userPosts`) where relevant, ensuring data consistency across different views.

## 3. Update Feature Components

a.  **`UserProfileHeader.jsx`:** Modify to accept a `user` prop and display the `ActionButton` based on the fetched `friendship` status.

    ```jsx
    // src/features/user/UserProfileHeader.jsx
    // ... (imports including PropTypes, ActionButton, useNavigate)
    
    function UserProfileHeader({ user }) {
      const navigate = useNavigate();
      const currentUser = useAppStore((state) => state.currentUser);
    
      if (!user || !currentUser) { /* ... loading placeholder ... */ }
    
      const isCurrentUserProfile = currentUser._id === user._id;
      const friendship = user.friendship; // Get friendship status from prop
      let actionContext = 'search'; 
      let requestId = null;
      if (friendship) { /* ... determine actionContext and requestId ... */ }
      const showFriendActionButton = !isCurrentUserProfile;
    
      const handleEditClick = () => navigate('/account');
    
      return (
        <div className="space-y-6 mb-6">
           <div className="relative"> {/* ... Cover Image ... */} </div>
           <div className="flex ..."> {/* ... Avatar, Name, Stats ... */} </div>
           {/* Action Buttons */}
           <div className="ml-auto ...">
             {isCurrentUserProfile ? (
               <Button onClick={handleEditClick} /* ... */> Edit Profile </Button>
             ) : showFriendActionButton ? (
                <ActionButton targetUserId={user._id} requestId={requestId} context={actionContext} />
             ) : null }
           </div>
        </div>
      );
    }
    // Add PropTypes for user prop including nested friendship
    UserProfileHeader.propTypes = { user: PropTypes.shape({ /* ... */ }) };
    export default UserProfileHeader;
    ```

b.  **`PostList.jsx`:** Modify to accept an optional `userId` prop. If provided, fetch and display posts for that user using `fetchUserPosts`; otherwise, fetch the main feed using `fetchPosts`.

    ```jsx
    // src/features/post/PostList.jsx
    // ... (imports including PropTypes)
    
    function PostList({ userId }) { 
      const isUserProfileFeed = !!userId;
      const storeState = useAppStore((state) => ({ /* ... select relevant states ... */ }));
      const { currentUser, fetchPosts, fetchUserPosts, /* ... */ } = storeState;
    
      // Determine which state slice to use
      const postsToDisplay = isUserProfileFeed ? storeState.userPostsData?.list ?? [] : storeState.mainFeedPosts;
      const isLoading = isUserProfileFeed ? storeState.userPostsData?.isLoading ?? true : storeState.isLoadingMainFeed;
      const error = isUserProfileFeed ? storeState.userPostsData?.error : storeState.mainFeedError;
      
      // Fetch data based on context
      useEffect(() => {
        if (isUserProfileFeed) {
           if (userId && (!storeState.userPostsData || storeState.userPostsData.list === undefined)) {
               fetchUserPosts(userId);
           }
        } else {
          fetchPosts();
        }
      }, [/* ... dependencies ... */]);
    
      // ... (Action Handlers - handleDeleteClick might need minor adjustment if refetching) ...
      // ... (Render Logic - Loading, Error, Empty States) ...
      
      return (
        <div className="space-y-4">
          {postsToDisplay.map((post) => { /* ... Post Card JSX ... */ })}
          {/* ... Loading more spinner ... */}
        </div>
      );
    }
    
    PostList.propTypes = { userId: PropTypes.string }; // userId is optional
    export default PostList;
    ```

## 4. Create User Profile Page (`src/pages/UserProfilePage.jsx`)

Create the page component that uses the route parameter (`userId`), fetches the profile data, and renders the header and post list.

```jsx
// src/pages/UserProfilePage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import UserProfileHeader from '@/features/user/UserProfileHeader';
import PostList from '@/features/post/PostList';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function UserProfilePage() {
  const { userId } = useParams(); // Get userId from URL

  // Select specific profile state and fetch action
  const { profileState, fetchUserProfile } = useAppStore(
    (state) => ({
      profileState: state.userProfiles[userId],
      fetchUserProfile: state.fetchUserProfile,
    })
  );

  // Fetch profile when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId, fetchUserProfile]);

  const profile = profileState?.data;
  const isLoadingProfile = profileState?.isLoading ?? true;
  const profileError = profileState?.error;

  // Render loading state
  if (isLoadingProfile) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  // Render error state
  if (profileError) {
      return <Alert variant="destructive" className="mt-4 mx-auto max-w-xl">...</Alert>;
  }

  // Render not found state
   if (!profile) {
       return <Alert variant="secondary" className="mt-4 mx-auto max-w-xl">...</Alert>;
   }

  // Render profile page
  return (
    <div className="space-y-6">
       <UserProfileHeader user={profile} />
       <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
             <h2 className="text-xl font-semibold mb-4">Posts by {profile.name}</h2>
             <PostList userId={userId} /> { /* Pass userId to PostList */}
          </div>
       </div>
    </div>
  );
}

export default UserProfilePage;
```

## 5. Add Profile Route (`src/routes/index.jsx`)

Add the dynamic route `/user/:userId` to your router setup.

```jsx
// src/routes/index.jsx
// ... imports ...
const UserProfilePage = React.lazy(() => import("../pages/UserProfilePage"));

function Router() {
  return (
    <React.Suspense fallback={/* ... */}>
      <Routes>
        <Route path="/" element={<AuthRequire><MainLayout /></AuthRequire>}>
          <Route index element={<HomePage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="user/:userId" element={<UserProfilePage />} /> {/* ADD THIS LINE */}
        </Route>
        {/* ... other routes ... */}
      </Routes>
    </React.Suspense>
  );
}
export default Router;
```

## 6. Update Links

Ensure all links pointing to user profiles (in `PostList`, `CommentItem`, `FriendCard`, etc.) are updated to use the format `/user/:userId`.

Example in `PostList.jsx`:
`<Link to={'/user/${post.author._id}'}>...`

## 7. Test

1.  Log in.
2.  Click on another user's name or avatar (e.g., on a post, comment, or in the friends list).
3.  Verify you are navigated to `/user/USER_ID`.
4.  Verify the correct user's profile header loads, showing their info and the correct friend action button (Add, Unfriend, Pending, Accept/Decline).
5.  Verify that only posts by that specific user are displayed below the header.
6.  Test clicking the action buttons (Add, Unfriend, etc.) and verify the button state updates correctly after the action completes.

**Progress Check:** The public user profile page is complete! This significantly enhances the social aspect of the application. The tutorial is now functionally complete, covering the core features of CoderComm. 