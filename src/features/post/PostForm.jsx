import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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

import { getInitials } from "@/lib/getInitials";
import { useAuth } from "../auth/authSlice";
import { usePost } from "./postSlice";

const postSchema = yup
  .object({
    // Require content, allow optional image later
    content: yup.string().required("Post content cannot be empty.").trim(),
    // image: yup.string().url("Invalid image URL"), // Add later if implementing image uploads
  })
  .required();

function PostForm() {
  const { currentUser } = useAuth();
  const { createPost } = usePost();

  const form = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: {
      content: "",
      // image: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data) => {
    console.log("Submitting post:", data);
    try {
      await createPost(data);
      form.reset();
    } catch (error) {
      console.error("Error submitting post form:", error);
    }
  };

  const firstName = currentUser?.name?.split(" ")[0] || "User";

  return (
    <Card className="mb-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              {currentUser && (
                <Link
                  to={`/user/${currentUser._id}`}
                  className="flex-shrink-0 mt-1"
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={currentUser.avatarUrl || ""}
                      alt={currentUser.name}
                    />
                    <AvatarFallback>
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}

              <div className="flex-1">
                <FormField
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
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
