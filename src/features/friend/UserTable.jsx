import React from "react";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import FriendStatus from "./FriendStatus";
import ActionButton from "./ActionButton";

function UserTable({ users }) {
  const { user } = useAuth();
  const currentUserId = user._id;

  const getActionsAndStatus = (targetUser) => {
    const props = {
      currentUserId: currentUserId,
      targetUserId: targetUser._id,
      friendship: targetUser.friendship,
    };
    return {
      status: <FriendStatus {...props} />,
      action: <ActionButton {...props} />,
    };
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium w-1/4">
                Name
              </th>
              <th className="text-left py-3 px-4 font-medium hidden md:table-cell">
                Email
              </th>
              <th className="text-left py-3 px-4 font-medium hidden md:table-cell">
                Job Title
              </th>
              <th className="text-left py-3 px-4 font-medium hidden sm:table-cell w-1/5">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const { status, action } = getActionsAndStatus(user);
              return (
                <tr key={user._id} className="hover:bg-muted/50 border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center cursor-pointer">
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Link
                        className="font-semibold text-sm hover:underline"
                        to={`/user/${user._id}`}
                      >
                        {user.name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {user.jobTitle}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    {status}
                  </td>
                  <td className="py-3 px-4">
                    {action}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
