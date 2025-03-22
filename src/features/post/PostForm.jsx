import React from "react";
import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardFooter,
  Button,
  Textarea
} from "@/components/ui";
import { useCreatePost } from "./postHooks";

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