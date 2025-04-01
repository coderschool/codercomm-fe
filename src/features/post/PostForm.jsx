import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "@/features/post/postHooks";

/**
 * Form for creating a new post
 * Displays a textarea for post content and submit button
 */
function PostForm() {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const createPostMutation = useCreatePost();
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (!e.target.value.trim()) {
      setError("Content is required");
    } else {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    
    createPostMutation.mutate({ content }, {
      onSuccess: () => setContent("")
    });
  };

  const isLoading = createPostMutation.isPending;

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Share what you are thinking here..."
              className="resize-none min-h-[120px]"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm font-medium text-destructive mt-1">
                {error}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PostForm;