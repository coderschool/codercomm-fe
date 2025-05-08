import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Hooks & Components
import { useAppStore } from "@/features/use-app-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Image, Send, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

// Utilities
import { getInitials } from "@/lib/getInitials";

/**
 * Yup validation schema for the new post form.
 */
const postSchema = yup
  .object({
    // Require content, allow optional image later
    content: yup.string().required("Post content cannot be empty.").trim(),
    // image: yup.string().url("Invalid image URL"), // Add later if implementing image uploads
  })
  .required();

/**
 * Form component for creating a new post.
 * Uses React Hook Form, Yup for validation, and useAppStore for submission.
 */
function PostForm() {
  const { user } = useAppStore();

  // Get the createPost action from the Zustand store
  const { createPost } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize React Hook Form
  const form = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: {
      content: "",
      // image: "",
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    console.log("Submitting post:", data);
    setIsSubmitting(true);
    try {
      // Call the Zustand store action
      await createPost(data);
      // Reset the form only after successful submission
      form.reset();
    } catch (error) {
      // Error is logged and toasted within the store action
      console.error("Error submitting post form:", error);
      // No need to toast again here unless more specific message needed
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user's first name for placeholder
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <Card className="mb-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              {user && (
                <Link to={`/user/${user._id}`} className="flex-shrink-0 mt-1">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Link>
              )}

              <div className="flex-1">
                {/* Content Textarea Field */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel className="sr-only">Post Content</FormLabel> */}
                      <FormControl>
                        <Textarea
                          placeholder={`What's on your mind, ${firstName}?`}
                          className="resize-none min-h-[80px] border-none focus-visible:ring-0 shadow-none p-2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="px-2 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t px-4 py-3">
            {/* Add Image Button (Placeholder) */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary p-2"
              onClick={() => toast.info("Image upload coming soon!")}
            >
              <Image className="h-5 w-5 mr-2" />
              <span className="text-xs">Add Image</span>
            </Button>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="px-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Post
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default PostForm;
