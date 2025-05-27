import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/utils/get-initials";
import { yupResolver } from "@hookform/resolvers/yup";
import { ImageUp, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as y from "yup";
import useMutateCurrentUser from "./useMutateCurrentUser";
import { toast } from "sonner";
import { useAuthState } from "@/lib/auth/useAuth";
import { uploadImage } from "@/lib/cloudinary";

const formSchema = y.object({
  name: y.string().min(2, "Name must be at least 2 characters"),
  avatarUrl: y.string().optional(),
  city: y.string().optional(),
  country: y.string().optional(),
  company: y.string().optional(),
  jobTitle: y.string().optional(),
  aboutMe: y
    .string()
    .max(500, "About me must be less than 500 characters")
    .optional(),
});

function PersonalDetailForm() {
  const { currentUser } = useAuthState();
  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      avatarUrl: currentUser?.avatarUrl || "",
      name: currentUser?.name || "",
      city: currentUser?.city || "",
      country: currentUser?.country || "",
      company: currentUser?.company || "",
      jobTitle: currentUser?.jobTitle || "",
      aboutMe: currentUser?.aboutMe || "",
    },
  });

  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  const { mutate, error } = useMutateCurrentUser();
  const avatarUrl = watch("avatarUrl");
  const name = watch("name");

  const onSubmit = async (data) => {
    const { avatarUrl, ...rest } = data;
    let imageUrl;
    if (avatarUrl) {
      imageUrl = await uploadImage(avatarUrl);
    }
    await mutate({ ...rest, avatarUrl: imageUrl });
    if (error) {
      toast.error("Failed to update personal details");
    } else {
      toast.success("Personal details updated successfully");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-center gap-4">
          <FormField
            control={control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FormLabel className="flex items-center gap-2 p-2 cursor-pointer rounded-md">
                    <Avatar className="h-16 w-16 border relative group">
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 h-16 w-16 rounded-full">
                        <ImageUp className="h-5 w-5 text-white" />
                      </div>
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback className="text-xl">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                  </FormLabel>
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

          <div className="flex-1">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Your city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Your country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Work Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Your company" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Your job title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* About Me */}
        <FormField
          control={form.control}
          name="aboutMe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Me</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default PersonalDetailForm;
