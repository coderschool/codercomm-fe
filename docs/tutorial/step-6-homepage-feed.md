# Step 6: Building the Home Page & Post Feed

With authentication and UI components ready, let's build the main content area for logged-in users: the Home page. This involves displaying the user's profile header, a form to create new posts, and the feed of **their own posts**.

## 1. Update Zustand Store for Posts & Comments

First, we need to add state and actions to our Zustand store (`src/lib/store.js`) to handle posts (specifically per-user) and comments.

Modify `src/lib/store.js`:

```javascript
// src/lib/store.js
// ... (imports and setSession remain the same)

const useStore = create(
  persist(
    (set, get) => ({
      // --- Authentication State (Keep existing) ---
      currentUser: null, isLoadingAuth: true, authError: null,

      // --- REMOVED: Main Post Feed State ---
      // posts: [], isLoadingPosts: false, postsError: null, totalPostPages: 1,

      // --- Comments State ---
      comments: {},

      // --- Friends, Requests, User Search State (Keep existing) ---
      friends: { /* ... */ },
      friendRequests: { /* ... */ },
      users: { /* ... */ },

      // --- User Profile & User Posts State (Keep existing) ---
      userProfiles: {},
      userPosts: {},

      // --- Actions ---
      // Auth Actions (Keep existing)
      initializeAuth: async () => { /* ... */ },
      login: async (credentials) => { /* ... */ },
      logout: () => { /* ... */ },

      // --- Post Actions (Simplified) ---
      createPost: async (postData) => {
        // ... (code as updated previously, updates userPosts cache) ...
         try {
           const newPost = await apiService.post('/posts', postData);
           toast.success('Post created successfully!');
           set((state) => {
             const authorId = newPost.author._id;
             const updatedUserPosts = { ...state.userPosts };
             if (updatedUserPosts[authorId]?.list) {
               updatedUserPosts[authorId] = { ...updatedUserPosts[authorId], list: [newPost, ...updatedUserPosts[authorId].list] };
             } else if (authorId === state.currentUser?._id) {
               updatedUserPosts[authorId] = { list: [newPost], isLoading: false, error: null, totalPages: 1 };
             }
             return { userPosts: updatedUserPosts };
           });
           return newPost;
         } catch (error) { /* ... error handling ... */ throw error; }
      },
      // REMOVED deletePost action
      reactToPost: async (postId, emoji) => {
        // ... (code as updated previously, updates userPosts cache) ...
      },

      // --- Comment Actions (Simplified) ---
      fetchComments: async (postId) => { /* ... */ },
      createComment: async (postId, commentData) => {
         // ... (code as updated previously, updates userPosts commentCount) ...
      },
      // REMOVED deleteComment action
      reactToComment: async (commentId, emoji) => { /* ... */ },

      // --- Friend Actions (Keep existing) ---
      fetchFriends: async (/*...*/) => { /* ... */ },
      fetchFriendRequests: async () => { /* ... */ },
      fetchUsers: async (/*...*/) => { /* ... */ },
      sendFriendRequest: async (/*...*/) => { /* ... */ },
      acceptFriendRequest: async (/*...*/) => { /* ... */ },
      rejectFriendRequest: async (/*...*/) => { /* ... */ },
      cancelFriendRequest: async (/*...*/) => { /* ... */ },
      removeFriend: async (/*...*/) => { /* ... */ },

      // --- User Profile Actions (Keep existing) ---
      fetchUserProfile: async (/*...*/) => { /* ... */ },
      updateUserProfile: async (/*...*/) => { /* ... */ },
      fetchUserPosts: async (/*...*/) => { /* ... */ },
    }),
    { name: 'codercomm-auth-storage', partialize: (state) => ({ currentUser: state.currentUser }) }
  )
);

export const useAppStore = useStore;
```
*Explanation:*
*   Removed the general `posts` state slice and its related `fetchPosts` action.
*   Removed the `deletePost` and `deleteComment` actions.
*   Ensured `createPost` adds the new post only to the relevant `userPosts` cache slice.
*   Ensured `reactToPost` and `createComment` update the state within the `userPosts` cache slice.

## 2. Simplify Feature Components

Remove the delete functionality from the UI.

a.  **`src/features/post/PostList.jsx`:** Remove the delete option (dropdown menu, icon, handler) from the post card.

    ```jsx
    // src/features/post/PostList.jsx
    // ... (imports - remove Trash2, DropdownMenu*)
    
    function PostList({ userId }) {
      // ... (state selection - remove deletePost)
      // ... (useEffect to fetch posts)
      // ... (local state - remove deletingPostId)
      // ... (handleReaction, toggleComments)
      // REMOVED handleDeleteClick handler
    
      // ... (Render logic - Loading, Error, Empty)
    
      return (
        <div className="space-y-4">
          {postsToDisplay.map((post) => {
            // ... (calculate isLiked, areCommentsExpanded, likeCount, commentCount, isPostAuthor)
            return (
              <Card key={post._id} /* ... */ >
                <CardHeader /* ... */ >
                   <div className="flex items-center justify-between ...">
                      {/* Author Info ... */}
                      {/* REMOVE Delete Dropdown Menu - maybe add placeholder div for spacing */}
                      {isPostAuthor && <div className="w-8 h-8"></div>}
                   </div>
                </CardHeader>
                {/* ... CardContent, CardFooter (Like/Comment buttons) ... */}
                {/* ... CommentList section ... */}
              </Card>
            );
          })}
          {/* ... Loading more spinner ... */}
        </div>
      );
    }
    // ... (PropTypes)
    export default PostList;
    ```

b.  **`src/features/comment/CommentItem.jsx`:** Remove the delete option (dropdown menu, icon, handler) from the comment item.

    ```jsx
    // src/features/comment/CommentItem.jsx
    // ... (imports - remove MoreVertical, Trash2, DropdownMenu*)
    
    function CommentItem({ comment }) {
      // ... (state selection - remove deleteComment)
      // ... (local state - remove isDeleting)
      // ... (handleReaction)
      // REMOVED handleDeleteClick handler
      // ... (calculate isLiked, isAuthor, likeCount)
    
      return (
        <div className="flex gap-2 ...">
          {/* ... Avatar ... */}
          <div className="flex-1">
            <div className="bg-muted ... relative ...">
              {/* REMOVE Delete Dropdown Menu */}
              {/* ... Author Link ... */}
              {/* ... Comment Content ... */}
            </div>
            {/* ... Actions (Like, Timestamp) ... */}
          </div>
        </div>
      );
    }
    // ... (PropTypes)
    export default CommentItem;
    ```

c.  **`src/features/post/Feed.jsx`:** This component should already be correct, rendering `PostForm` and `PostList` without passing a `userId` (so `PostList` fetches the current user's posts).

d.  **`src/pages/HomePage.jsx`:** This should also be correct from the previous step, rendering `UserProfileHeader` and `<PostList userId={currentUser._id} />`.

## 3. Simplify Mock API (`src/mockApi/server.js`)

Remove the unused `DELETE` endpoints for posts and comments.

```javascript
// src/mockApi/server.js (inside routes())

// ... (Other routes: Auth, Users, Posts GET/POST, Comments GET/POST, Reactions, Friends)

// REMOVE this handler:
// this.delete('/posts/:id', (/*...*/) => { /* ... */ });

// REMOVE this handler:
// this.delete('/comments/:commentId', (/*...*/) => { /* ... */ });

// ... (Passthrough)
```

## 4. Test Simplified Home Page

Restart your development server (`npm run dev`) and log in.

1.  **Home Page View:** Verify the Home page (`/`) shows your profile header (with the Actions dropdown) and your own posts below the post creation form.
2.  **Create Post:** Create a new post. It should appear immediately at the top of *your* post list on the Home page.
3.  **Post Actions:** Verify the delete option (three dots menu) is **gone** from your posts.
4.  **Comment Actions:** Verify the delete option is **gone** from your comments.
5.  **Profile Page:** Navigate to another user's profile page (e.g., `/user/user2`). Verify their posts load correctly and do *not* show delete options (unless you are viewing your own profile via the `/user/user1` route, which should behave identically to the home page now).

**Progress Check:** The core Home page is functional and simplified. Users see their own profile and posts, can create new posts, and interact with posts/comments via likes. Delete functionality has been removed to keep the tutorial focused. 