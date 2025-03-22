import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Instagram, Facebook, Twitter } from "lucide-react";

import { useForm } from "react-hook-form";
import useAuth from "@/hooks/useAuth";
import { useUpdateUserProfile } from "./userHooks";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const SOCIAL_LINKS = [
  {
    value: "facebookLink",
    icon: <Facebook className="w-6 h-6 text-[#1877F2]" />,
    label: "Facebook"
  },
  {
    value: "instagramLink",
    icon: <Instagram className="w-6 h-6 text-[#D7336D]" />,
    label: "Instagram"
  },
  {
    value: "linkedinLink",
    icon: <Linkedin className="w-6 h-6 text-[#006097]" />,
    label: "LinkedIn"
  },
  {
    value: "twitterLink",
    icon: <Twitter className="w-6 h-6 text-[#1C9CEA]" />,
    label: "Twitter"
  },
];

function AccountSocialLinks() {
  const { user } = useAuth();
  const updateUserProfileMutation = useUpdateUserProfile();

  const defaultValues = {
    facebookLink: user?.facebookLink || "",
    instagramLink: user?.instagramLink || "",
    linkedinLink: user?.linkedinLink || "",
    twitterLink: user?.twitterLink || "",
  };

  const form = useForm({
    defaultValues,
  });
  
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data) => {
    updateUserProfileMutation.mutate({ 
      userId: user._id, 
      ...data 
    });
  };

  const isLoading = updateUserProfileMutation.isPending;

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {SOCIAL_LINKS.map((link) => (
            <FormField
              key={link.value}
              control={form.control}
              name={link.value}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center">
                      <div className="mr-2">{link.icon}</div>
                      <Input {...field} placeholder={`${link.label} URL`} />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          ))}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

export default AccountSocialLinks;