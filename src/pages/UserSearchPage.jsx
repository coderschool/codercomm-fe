import React, { useState, useEffect } from "react";
import { useSearchUsers } from "@/hooks/useFriendQuery";
import UserCard from "@/features/friend/UserCard";
import SearchInput from "@/components/SearchInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";

function UserSearchPage() {
  const [filterName, setFilterName] = useState("");
  
  // Use infinite query for searching users
  const { 
      data,
      fetchNextPage,
      hasNextPage,
      isLoading,
      isFetchingNextPage,
      isError,
      error 
  } = useSearchUsers(filterName);

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
      if (inView && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
      }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (query) => {
    // Resetting pagination is handled by React Query when queryKey changes
    setFilterName(query);
  };

  // Flatten pages for display
  const users = data?.pages.flatMap(page => page.users) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Find Users</h1>

      <Card>
        <CardHeader>
           <SearchInput 
            placeholder="Search for users by name..." 
            handleSubmit={handleSearch} 
            initialValue={filterName}
            // Add a debounce here in a real app if needed
          />
        </CardHeader>
        <CardContent>
          {/* Initial Loading or No Search Term */} 
          {isLoading && !isFetchingNextPage && !filterName && (
            <div className="flex justify-center items-center py-10">
              <p className="text-muted-foreground">Enter a name to start searching.</p>
            </div>
          )}
           {isLoading && !isFetchingNextPage && filterName && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!filterName && !isLoading && (
              <p className="text-muted-foreground text-center py-10">
                  Enter a name to search for users.
                </p>
          )}
          
          {/* Error State */}
          {isError && filterName && (
            <p className="text-destructive text-center py-10">
              Error searching users: {error.message}
            </p>
          )}

          {/* Results Area */} 
          {filterName && !isLoading && !isError && (
            <>
              {users.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">
                  No users found matching "{filterName}".
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <UserCard 
                      key={user._id} 
                      profile={user} 
                      friendshipContext="search" // Pass context
                    />
                  ))}
                </div>
              )}
              
              {/* Load More Trigger/Indicator */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center pt-6">
                  {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Scroll down to load more</span>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder SearchInput:
const SearchInput = ({ handleSubmit, placeholder, initialValue }) => {
    const [query, setQuery] = useState(initialValue || '');
    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(query);
    }
    return (
        <form onSubmit={onSubmit} className="flex gap-2">
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder || "Search..."} 
                className="border p-2 rounded w-full" 
            />
            <button type="submit" className="bg-primary text-primary-foreground p-2 rounded">Search</button>
        </form>
    );
};

export default UserSearchPage; 