# Step 9: User Profile Page

Now that we have the core features like the feed, friends, and account settings, let's allow users to view the profiles of *other* users. This involves creating a new page that fetches and displays profile information based on a user ID in the URL.

## 1. Update Mock API Endpoints (`src/mockApi/server.js`)

Ensure the necessary endpoints exist and provide the required data.

a.  **`GET /api/posts/user/:userId`:** Make sure this endpoint filters posts by the author's `userId` and returns them (including `commentCount` and `reactions`).

    ```javascript
    // src/mockApi/server.js (inside routes())
    this.get('/posts/user/:userId', (schema, request) => {
      const userId = request.params.userId;
      let userPosts = currentPosts.filter(p => p.author._id === userId);
      userPosts = userPosts.map(post => ({ /* ... add counts/reactions ... */ }));
      userPosts.sort(/* ... newest first ... */);
      return { posts: userPosts, /* ... */ };
    });
    ```

b.  **`GET /api/users/:id`:** Ensure this endpoint returns the user profile *and* includes the `friendship` status relative to the logged-in user (`user1` in the mock).

    ```javascript
    // src/mockApi/server.js (inside routes())
    this.get('/users/:id', (schema, request) => {
       const id = request.params.id;
       const user = findUser(id);
       if (!user) { /* ... 404 ... */ }
       const postCount = /* ... calculate ... */ ;
       const friendCount = /* ... calculate ... */ ;
       const currentUser = 'user1';
       const rawFriendship = getFriendshipStatus(currentUser, id);
       const populatedFriendship = populateFriendshipUsers(rawFriendship);
       return { user: { ...user, postCount, friendCount, friendship: populatedFriendship } };
    });
    ```

## 2. Add State & Actions to Store (`src/lib/store.js`)

Add state slices and actions to handle fetching and caching individual user profiles and their posts.

```javascript
// src/lib/store.js
// ...
const useStore = create(
  persist(
    (set, get) => ({
      // ... (Existing State: currentUser, comments, friends, friendRequests, users)

      // --- User Profile & Posts State ---
      userProfiles: {}, // Cache: { userId: { data: {...}, isLoading, error } }
      userPosts: {},    // Cache: { userId: { list: [], isLoading, error, totalPages } }

      // --- Actions ---
      // ... (Existing Actions: Auth, Post (create/react), Comment (fetch/create/react), Friend)
      
      // --- User Profile & Posts Actions ---
      fetchUserProfile: async (userId) => {
        // ... (Fetch user from /users/:userId, update userProfiles[userId]) ...
      },
      // updateUserProfile: async (updatedData) => { /* ... */ }, // Keep if needed for AccountPage
      fetchUserPosts: async (userId, page = 1, limit = 10) => {
        // ... (Fetch posts from /posts/user/:userId, update userPosts[userId]) ...
      },
      
      // --- Ensure relevant actions update caches ---
      // E.g., reactToPost should update userPosts cache
      // E.g., sendFriendRequest should update relevant userProfiles cache
      // E.g., createComment/deleteComment should update commentCount in userPosts cache
       reactToPost: async (postId, emoji) => { /* ... (updated logic) ... */ },
       createComment: async (postId, commentData) => { /* ... (updated logic) ... */ },
       // REMOVED deleteComment action
       sendFriendRequest: async (targetUserId) => { /* ... (updated logic) ... */ },
       // TODO: Update accept/reject/cancel/remove friend actions too

    }),
    // ... (Persist config)
  )
);

export const useAppStore = useStore;
```
*Explanation:*
*   `userProfiles` and `userPosts` cache fetched data by user ID.
*   `fetchUserProfile` fetches profile data.
*   `fetchUserPosts` fetches posts for a specific user.
*   Relevant existing actions (like `reactToPost`, `createComment`, `sendFriendRequest`) are modified to update these new caches for data consistency.

## 3. Update Feature Components

a.  **`UserProfileHeader.jsx`:** Modify to accept a `user` prop and show the `ActionButton` based on the fetched `friendship` status.

    ```jsx
    // src/features/user/UserProfileHeader.jsx
    // ... (imports including ActionButton, useNavigate, Link, DropdownMenu*)
    
    function UserProfileHeader({ user }) {
      // ... (get currentUser)
      // ... (handle loading/null user)
      const isCurrentUserProfile = currentUser._id === user._id;
      const friendship = user.friendship;
      // ... (determine actionContext, requestId)
      const showFriendActionButton = !isCurrentUserProfile;
    
      return (
        <div /* ... */ >
           {/* ... Cover, Avatar, Name, Stats ... */}
           <div className="ml-auto ...">
             {isCurrentUserProfile ? (
               <DropdownMenu> { /* Actions Dropdown for Self */ }
                  <DropdownMenuTrigger asChild><Button>...</Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuItem asChild><Link to="/account">...</Link></DropdownMenuItem>
                     <DropdownMenuItem asChild><Link to="/friends">...</Link></DropdownMenuItem>
                     <DropdownMenuItem asChild><Link to="/requests">...</Link></DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
             ) : showFriendActionButton ? (
                <ActionButton /* ... props ... */ />
             ) : null }
           </div>
        </div>
      );
    }
    // ... (PropTypes including nested friendship)
    export default UserProfileHeader;
    ```

b.  **`PostList.jsx`:** Modify to accept `userId` prop and fetch/display user-specific posts.

    ```jsx
    // src/features/post/PostList.jsx
    // ... (imports)
    
    function PostList({ userId }) {
      const isUserProfileFeed = !!userId;
      // ... (Select state based on isUserProfileFeed - userPosts[userId] or null)
      // ... (useEffect to call fetchUserPosts(userId) if userId exists, otherwise do nothing here)
      // ... (Get postsToDisplay, isLoading, error from the correct state slice)
      // ... (Action handlers - REMOVE delete handler/UI)
      // ... (Render logic: Loading, Error, Empty)
      return (
        <div /* ... */ >
          {postsToDisplay.map((post) => { 
              // ... Post Card JSX - REMOVE delete option 
          })}
        </div>
      );
    }
    // ... (PropTypes - userId is optional)
    export default PostList;
    ```

## 4. Create User Profile Page (`src/pages/UserProfilePage.jsx`)

Create the page component.

```jsx
// src/pages/UserProfilePage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import UserProfileHeader from '@/features/user/UserProfileHeader';
import PostList from '@/features/post/PostList';
import { Loader2 } from 'lucide-react';
import { Alert, /* ... */ } from "@/components/ui/alert";

function UserProfilePage() {
  const { userId } = useParams();
  const { profileState, fetchUserProfile } = useAppStore(/* ... selector ... */);

  useEffect(() => { if (userId) { fetchUserProfile(userId); } }, [/* ... */]);

  const profile = profileState?.data;
  const isLoadingProfile = profileState?.isLoading ?? true;
  const profileError = profileState?.error;

  if (isLoadingProfile) { /* ... Loading ... */ }
  if (profileError) { /* ... Error Alert ... */ }
  if (!profile) { /* ... Not Found Alert ... */ }

  return (
    <div className="space-y-6">
       <UserProfileHeader user={profile} />
       <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
             <h2 className="text-xl font-semibold mb-4">Posts by {profile.name}</h2>
             <PostList userId={userId} /> { /* Pass userId */ }
          </div>
       </div>
    </div>
  );
}
export default UserProfilePage;
```

## 5. Add Profile Route (`src/routes/index.jsx`)

Add the route definition.

```jsx
// src/routes/index.jsx
// ... imports ...
const UserProfilePage = React.lazy(() => import("../pages/UserProfilePage"));

function Router() {
  return (
    <React.Suspense fallback={/* ... */}>
      <Routes>
        <Route path="/" element={<AuthRequire><MainLayout /></AuthRequire>}>
          {/* ... index, account routes ... */}
          <Route path="user/:userId" element={<UserProfilePage />} /> {/* ADD THIS */}
          {/* ... friends, requests routes ... */}
        </Route>
        {/* ... other routes ... */}
      </Routes>
    </React.Suspense>
  );
}
export default Router;
```

## 6. Update Links

Ensure links in `PostList`, `CommentItem`, `FriendCard` point to `/user/:userId`.

## 7. Test

1.  Log in.
2.  Click another user's name/avatar.
3.  Verify navigation to `/user/USER_ID`.
4.  Verify header shows correct user info and friend action button.
5.  Verify only that user's posts appear.
6.  Test friend action buttons.

**Progress Check:** The public user profile page is implemented. Delete functionality has been removed for simplicity. 