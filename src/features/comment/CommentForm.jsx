import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Send, Loader2 } from "lucide-react";

import { getInitials } from "@/utils/get-initials";
import { useAuthState } from "@/lib/auth/useAuth";
import { useCommentAction } from "./CommentStoreProvider";
import { Textarea } from "@/components/ui/textarea";

const commentSchema = yup
  .object({
    content: yup.string().required("Comment cannot be empty").trim(),
  })
  .required();

function CommentForm() {
  const { currentUser } = useAuthState();
  const { createComment } = useCommentAction();
  const { avatarUrl, name } = currentUser;

  const form = useForm({
    resolver: yupResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form;

  const onSubmit = async (data) => {
    try {
      const { content } = data;
      await createComment(content);
      form.reset();
    } catch (error) {
      console.error("Error submitting comment form:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-start gap-3 py-2"
      >
        <Avatar className="h-8 w-8 border mt-1 flex-shrink-0">
          <AvatarImage src={avatarUrl || ""} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>

        <FormField
          control={control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1 relative">
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Write a comment..."
                    className="pr-10 text-sm"
                    {...field}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    disabled={isSubmitting || !isValid}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                  >
                    {isSubmitting ? (
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

export default CommentForm;
