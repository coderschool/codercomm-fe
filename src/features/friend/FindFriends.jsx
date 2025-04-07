import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import UserCard from "./UserCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchInput from "@/components/SearchInput";
import { Loader2 } from "lucide-react";

function FindFriends() {
  const [filterQuery, setFilterQuery] = useState("");
  const { usersState, fetchUsers } = useAppStore((state) => ({
    usersState: state.users,
    fetchUsers: state.fetchUsers,
  }));

  useEffect(() => {
    fetchUsers(filterQuery);
  }, [filterQuery, fetchUsers]);

  const handleSearch = (query) => {
    setFilterQuery(query);
  };

  const users = usersState.list ?? [];
  const isLoading = usersState.isLoading;
  const error = usersState.error;

  return (
    <Card className="p-0">
      <CardHeader>
        <CardTitle className="text-lg font-medium mb-4">Find Friends</CardTitle>
        <SearchInput
          placeholder="Search users..."
          handleSubmit={handleSearch}
          initialValue={filterQuery}
        />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {isLoading && users.length === 0 && (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          )}
          {error && <p className="text-destructive text-center py-4">Error loading users: {error}</p>}
          {!isLoading && !error && (
            <>
              {users.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">
                  {filterQuery ? 'No users found matching your search.' : 'Enter a name to search for users.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {users.map((user) => {
                    return (
                       <UserCard
                          key={user._id}
                          profile={user}
                          friendshipContext={"search"}
                          friendshipObj={null}
                       />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FindFriends;
