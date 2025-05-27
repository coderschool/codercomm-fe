import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

function UserHeaderFallback() {
  return (
    <>
      <div className="h-48 md:h-80 w-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-primary/50 to-secondary/50 animate-pulse" />
      </div>

      {/* Avatar and Info */}
      <div className="flex flex-col gap-4 sm:flex-row items-center sm:items-end px-4 sm:px-6 z-10 translate-y-[-50%]">
        <Avatar className="h-32 w-32 sm:h-48 sm:w-48 border-4 border-background bg-background">
          <AvatarFallback className="text-4xl">
            <Skeleton className="h-full w-full rounded-full" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center sm:items-start h-full sm:translate-y-[-40%]">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-muted-foreground mt-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </>
  );
}

export default UserHeaderFallback;
