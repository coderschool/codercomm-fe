import React, { useState } from "react";
import { Send } from "lucide-react";

import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import useAuth from "@/hooks/useAuth";
import { useCreateComment } from "./commentHooks";

function CommentForm({ postId }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const createCommentMutation = useCreateComment();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createCommentMutation.mutate(
      { postId, content },
      {
        onSuccess: () => setContent("")
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <Input
        value={content}
        placeholder="Write a comment…"
        onChange={(event) => setContent(event.target.value)}
        className="flex-1"
        disabled={createCommentMutation.isPending}
      />
      
      <Button 
        type="submit" 
        size="icon" 
        variant="ghost"
        disabled={createCommentMutation.isPending || !content.trim()}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}

export default CommentForm;