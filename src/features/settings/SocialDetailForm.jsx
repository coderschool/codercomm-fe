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

import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as y from "yup";
import useMutateCurrentUser from "./useMutateCurrentUser";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/useAuth";

const formSchema = y.object({
  facebookLink: y.string().optional(),
  instagramLink: y.string().optional(),
  linkedinLink: y.string().optional(),
  twitterLink: y.string().optional(),
});

function SocialDetailForm() {
  const currentUser = useAuth((state) => state.currentUser);
  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      facebookLink: currentUser?.facebookLink || "",
      instagramLink: currentUser?.instagramLink || "",
      linkedinLink: currentUser?.linkedinLink || "",
      twitterLink: currentUser?.twitterLink || "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  const { mutate, error } = useMutateCurrentUser();

  const onSubmit = async (data) => {
    await mutate(data);
    if (error) {
      toast.error("Failed to update social links");
      form.reset();
    } else {
      toast.success("Social links updated successfully");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="facebookLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="instagramLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="linkedinLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="twitterLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter Link</FormLabel>
              <FormControl>
                <Input {...field} />
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

export default SocialDetailForm;
