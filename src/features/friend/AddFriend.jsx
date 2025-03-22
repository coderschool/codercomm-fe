import React, { useState } from "react";
import { useGetUsers } from "./friendHooks";
import UserTable from "./UserTable";
import SearchInput from "@/components/SearchInput";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

function AddFriend() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useGetUsers(filterName, page + 1);
  
  // Extract data safely with proper defaults
  const users = data?.users || [];
  const totalUsers = data?.totalUsers || 0;

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (value) => {
    setRowsPerPage(parseInt(value, 10));
    setPage(0);
  };

  const handleSubmit = (searchQuery) => {
    setFilterName(searchQuery);
  };

  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  return (
    <div className="container mx-auto">
      <h4 className="text-2xl font-bold mb-6">Add Friends</h4>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <SearchInput handleSubmit={handleSubmit} />

            <p className="text-sm text-muted-foreground ml-1">
              {totalUsers > 1
                ? `${totalUsers} users found`
                : totalUsers === 1
                ? `${totalUsers} user found`
                : "No user found"}
            </p>

            <div className="flex-grow" />

            <div className="flex flex-row items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={handleChangeRowsPerPage}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder={rowsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalUsers > 0 ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, totalUsers)} of ${totalUsers}` : "0-0 of 0"}
                </span>
                
                <div className="flex">
                  <button
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                    className="p-2 rounded-l-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="p-2 rounded-r-md border border-gray-300 border-l-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <UserTable users={users} />
          )}
        </div>
      </Card>
    </div>
  );
}

export default AddFriend;
