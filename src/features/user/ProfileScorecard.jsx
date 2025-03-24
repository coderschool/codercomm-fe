import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fNumber } from "@/utils/numberFormat";

function ProfileScorecard({ profile }) {
  const { postCount = 0, friendCount = 0 } = profile || {};

  return (
    <Card className="py-6">
      <div className="flex flex-row">
        <div className="flex-1 text-center">
          <p className="text-2xl font-bold">{fNumber(friendCount)}</p>
          <p className="text-sm text-muted-foreground">Friends</p>
        </div>
        
        <Separator orientation="vertical" className="mx-2 h-auto" />
        
        <div className="flex-1 text-center">
          <p className="text-2xl font-bold">{fNumber(postCount)}</p>
          <p className="text-sm text-muted-foreground">Posts</p>
        </div>
      </div>
    </Card>
  );
}

export default ProfileScorecard;
