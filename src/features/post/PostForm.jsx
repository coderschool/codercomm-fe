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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Image, Send, Loader2, Trash } from "lucide-react";
import { Link } from "react-router";

import { getInitials } from "@/lib/getInitials";
import { useAuth } from "../auth/authStore";
import { usePosts } from "./postStore";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/cloudinary";

const postSchema = yup
  .object({
    content: yup.string().required("Post content cannot be empty.").trim(),
    image: yup.string().optional(),
  })
  .required();

function PostForm() {
  const { currentUser } = useAuth();
  const { createPost } = usePosts();

  const form = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: {
      content: "",
      image: "",
    },
  });

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data) => {
    try {
      const { image, content } = data;
      let imageUrl;
      if (image) {
        imageUrl = await uploadImage(image);
      }
      await createPost({ content, image: imageUrl });
      form.reset();
    } catch (error) {
      console.error("Error submitting post form:", error);
    }
  };

  const firstName = currentUser?.name?.split(" ")[0] || "User";
  const imageUrl = watch("image");

  return (
    <Card className="mb-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {currentUser && (
                <Link
                  to={`/users/${currentUser._id}`}
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
                          className="resize-none min-h-[70px] border-none focus-visible:ring-0 shadow-none px-0"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Display image if it exists */}
                {imageUrl && (
                  <div className="rounded-md overflow-hidden h-[400px]">
                    <img
                      src={imageUrl}
                      alt="post image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t px-6 py-3">
            <FormField
              control={control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FormLabel className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted rounded-md">
                      <Image className="h-5 w-5" />
                      <span className="text-xs">
                        {imageUrl ? "Change Image" : "Add Image"}
                      </span>
                    </FormLabel>

                    {imageUrl && (
                      <button
                        type="button"
                        className="hover:bg-muted flex items-center gap-2 rounded-md p-2"
                        onClick={() => setValue("image", "")}
                      >
                        <Trash className="h-5 w-5" />
                        <span className="text-xs">Remove Image</span>
                      </button>
                    )}
                  </div>

                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const objectUrl = URL.createObjectURL(file);
                          field.onChange(objectUrl);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
