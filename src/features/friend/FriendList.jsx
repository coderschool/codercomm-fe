import React, { useState } from "react";
import { useGetFriends } from "./friendHooks";
import UserCard from "./UserCard";
import SearchInput from "@/components/SearchInput";
import { Card } from "@/components/ui/card";

function FriendList() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetFriends(filterName, page);
  
  // Extract data safely with proper defaults
  const users = data?.users || [];
  const totalUsers = data?.totalUsers || 0;
  const totalPages = data?.totalPages || 1;

  const handleSubmit = (searchQuery) => {
    setFilterName(searchQuery);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <SearchInput handleSubmit={handleSubmit} />
          
          <div className="flex-grow" />
          
          <p className="text-sm text-muted-foreground ml-1">
            {totalUsers > 1
              ? `${totalUsers} friends found`
              : totalUsers === 1
              ? `${totalUsers} friend found`
              : "No friend found"}
          </p>
          
          <div className="flex justify-center">
            <nav aria-label="Pagination" className="inline-flex -space-x-px text-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`${
                    pageNum === page
                      ? "bg-primary text-white"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  } px-3 py-2 border border-gray-300 first:rounded-l-md last:rounded-r-md`}
                >
                  {pageNum}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
        {isLoading ? (
          <p className="text-center col-span-3">Loading...</p>
        ) : (
          users.map((user) => (
            <div key={user._id}>
              <UserCard profile={user} />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default FriendList;
