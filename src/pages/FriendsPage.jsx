import React, { useState } from "react";
import { useGetFriends } from "@/hooks/useFriendQuery";
import UserCard from "@/features/friend/UserCard";
import SearchInput from "@/components/SearchInput"; // Assuming you have this component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import PaginationControls from "@/components/PaginationControls"; // Assuming you have this

function FriendsPage() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);

  // Fetch friends data using the hook
  const { data, isLoading, isError, error } = useGetFriends(filterName, page);
  
  // Safely extract data
  const friends = data?.users || [];
  const totalFriends = data?.count || 0;
  const totalPages = data?.totalPages || 1;

  // Handler for search submission
  const handleSearch = (query) => {
    setFilterName(query);
    setPage(1); // Reset to first page on new search
  };

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
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {isError && (
            <p className="text-destructive text-center py-10">
              Error loading friends: {error.message}
            </p>
          )}
          {!isLoading && !isError && (
            <>
              {friends.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">
                  You haven't added any friends yet{filterName ? ' matching your search' : ''}.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <UserCard 
                      key={friend._id} 
                      profile={friend} 
                      friendshipContext="friend_list" // Pass context
                    />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                 <PaginationControls 
                   currentPage={page} 
                   totalPages={totalPages} 
                   onPageChange={setPage} 
                 />
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
// Placeholder PaginationControls:
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center gap-1 mt-6">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button 
                key={page} 
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
                {page}
            </button>
        ))}
    </div>
);

export default FriendsPage; 