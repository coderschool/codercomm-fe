import React from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Hooks & Components
import useAuth from "@/hooks/useAuth";
import { useCreateComment } from "@/hooks/useCommentQuery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Send, Loader2 } from "lucide-react";

// Utilities
import { getInitials } from "@/utils/formatters";

/**
 * Yup validation schema for the comment form.
 */
const commentSchema = yup.object({
  content: yup.string().required("Comment cannot be empty").trim(),
}).required();

/**
 * Comment form for creating a new comment on a post
 * @param {Object} props - Component props
 * @param {string} props.postId - ID of the post to comment on
 */
function CommentForm({ postId }) {
  const { user } = useAuth();
  const { mutate: createCommentMutate, isPending: isCreatingComment } = useCreateComment();
  
  const form = useForm({
    resolver: yupResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const onSubmit = (data) => {
    console.log("Submitting comment:", data);
    createCommentMutate(
      { postId, content: data.content },
      { onSuccess: () => form.reset() } // Reset form on success
    );
  };

  if (!user) return null; // Don't show form if not logged in

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-3 py-2">
        {/* Current User Avatar */}
        <Avatar className="h-8 w-8 border mt-1 flex-shrink-0">
          <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        
        {/* Comment Input Field */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1 relative">
              {/* <FormLabel className="sr-only">Comment</FormLabel> */}
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Write a comment..."
                    className="pr-10 h-9 text-sm"
                    {...field}
                    disabled={isCreatingComment}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost"
                    disabled={isCreatingComment || !form.formState.isValid}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                  >
                    {isCreatingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Post comment</span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs absolute -bottom-4 left-0" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

CommentForm.propTypes = {
  postId: PropTypes.string.isRequired,
};

export default CommentForm;