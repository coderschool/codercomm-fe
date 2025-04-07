import React, { useState, useEffect } from "react";
// import { useGetFriends } from "@/hooks/useFriendQuery"; // Removed
import { useAppStore } from "@/lib/store"; // Added
import FriendCard from "@/features/friend/FriendCard";
import SearchInput from "@/components/SearchInput"; // Assuming you have this component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
// import useAuth from "@/hooks/useAuth"; // Removed

function FriendsPage() {
  const [filterName, setFilterName] = useState("");
  // Get friend state and actions from store
  const { friendsState, fetchFriends } = useAppStore((state) => ({
    friendsState: state.friends,
    fetchFriends: state.fetchFriends,
  }));

  // Fetch friends when component mounts or filter changes
  useEffect(() => {
    // Assuming fetchFriends action can take filter/query params
    // If not, fetch all and filter client-side
    fetchFriends(1, 10, filterName); // Fetch page 1, limit 10, with filter
  }, [filterName, fetchFriends]);

  // Handler for search submission
  const handleSearch = (query) => {
    setFilterName(query);
  };

  // Extract state for easier use
  const friends = friendsState.list ?? [];
  const isLoading = friendsState.isLoading;
  const error = friendsState.error;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Friends</h1>

      <Card>
        <CardHeader>
          <SearchInput
            placeholder="Search friends..."
            handleSubmit={handleSearch}
            initialValue={filterName}
          />
        </CardHeader>
        <CardContent>
          {isLoading && friends.length === 0 && ( // Show loader only on initial load or if list is empty during load
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <p className="text-destructive text-center py-10">
              Error loading friends: {error}
            </p>
          )}
          {!isLoading && !error && (
            <>
              {friends.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">
                  You haven't added any friends yet{filterName ? ' matching your search' : ''}.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend._id} // Ensure friend object has _id
                      friendship={friend} // Pass the friend data
                    />
                  ))}
                  {/* TODO: Add pagination if friendsState.totalPages > 1 */}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FriendsPage; 