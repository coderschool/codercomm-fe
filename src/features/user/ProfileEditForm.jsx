import React, { useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Hooks & Services
import { useAppStore } from "@/lib/store";

// ShadCN UI Components
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Yup validation schema for the profile edit form.
 */
const profileSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name is too short"),
  aboutMe: yup.string().max(500, "About me cannot exceed 500 characters"),
  // Allow empty strings or valid URLs
  avatarUrl: yup.string().url("Must be a valid URL (e.g., https://...)").nullable().transform(value => value || null),
  coverUrl: yup.string().url("Must be a valid URL (e.g., https://...)").nullable().transform(value => value || null),
  // Add other editable fields here (city, country, jobTitle, company, etc.)
  city: yup.string().max(50, "City name too long"),
  country: yup.string().max(50, "Country name too long"),
  company: yup.string().max(100, "Company name too long"),
  jobTitle: yup.string().max(100, "Job title too long"),
  // Social Links (Optional, must be valid URLs if provided)
  facebookLink: yup.string().url("Must be a valid URL").nullable().transform(value => value || null),
  instagramLink: yup.string().url("Must be a valid URL").nullable().transform(value => value || null),
  linkedinLink: yup.string().url("Must be a valid URL").nullable().transform(value => value || null),
  twitterLink: yup.string().url("Must be a valid URL").nullable().transform(value => value || null),
}).required();

/**
 * Form component for editing the current user's profile information.
 * Uses React Hook Form for state management and Yup for validation.
 * Calls the `useUpdateProfile` mutation hook on submit.
 */
function ProfileEditForm({ user, onCancel, onSuccess }) {
  // Get the mutation action from the Zustand store
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Initialize React Hook Form
  const form = useForm({
    resolver: yupResolver(profileSchema),
    // Set default values from the user prop
    defaultValues: {
      name: user?.name || "",
      aboutMe: user?.aboutMe || "",
      avatarUrl: user?.avatarUrl || "",
      coverUrl: user?.coverUrl || "",
      city: user?.city || "",
      country: user?.country || "",
      company: user?.company || "",
      jobTitle: user?.jobTitle || "",
      // Social links default values
      facebookLink: user?.facebookLink || "",
      instagramLink: user?.instagramLink || "",
      linkedinLink: user?.linkedinLink || "",
      twitterLink: user?.twitterLink || "",
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    console.log("Form data submitted:", data);
    setIsSubmitting(true);
    setSubmitError(null); // Clear previous errors
    try {
      await updateUserProfile(data); // Call store action (userId inferred as current user)
      if (onSuccess) onSuccess(); // Call success callback from props
    } catch (error) {
      console.error("Profile update failed in form:", error);
      setSubmitError(error.message || "Could not update profile. Please try again.");
      // Optional: Call onError prop if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display submission errors */}
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Update Failed</AlertTitle>
            <AlertDescription>
              {submitError}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* About Me Field */}
            <FormField
              control={form.control}
              name="aboutMe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Me</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a little bit about yourself" 
                      className="resize-none min-h-[100px]" // Allow vertical resize
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of yourself. Max 500 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Title & Company */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="jobTitle"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Job Title</FormLabel>
                     <FormControl><Input placeholder="e.g., Software Engineer" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="company"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Company</FormLabel>
                     <FormControl><Input placeholder="e.g., CoderSchool" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>

            {/* City & Country */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="city"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>City</FormLabel>
                     <FormControl><Input placeholder="e.g., Ho Chi Minh City" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="country"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Country</FormLabel>
                     <FormControl><Input placeholder="e.g., Vietnam" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
            
            {/* Avatar URL Field */}
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/avatar.png" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>
                    Link to your profile picture (must be a valid URL).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Cover URL Field */}
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Photo URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/cover.jpg" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>
                    Link to your cover photo (must be a valid URL).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* --- Social Links --- */}
            <h3 className="text-md font-medium pt-4 border-t">Social Links</h3>
            <FormField
              control={form.control}
              name="facebookLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Facebook className="h-4 w-4"/> Facebook</FormLabel>
                  <FormControl><Input type="url" placeholder="https://facebook.com/yourprofile" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagramLink"
              render={({ field }) => (
                <FormItem>
                   <FormLabel className="flex items-center gap-2"><Instagram className="h-4 w-4"/> Instagram</FormLabel>
                   <FormControl><Input type="url" placeholder="https://instagram.com/yourprofile" {...field} value={field.value ?? ''} /></FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedinLink"
              render={({ field }) => (
                <FormItem>
                   <FormLabel className="flex items-center gap-2"><Linkedin className="h-4 w-4"/> LinkedIn</FormLabel>
                   <FormControl><Input type="url" placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value ?? ''} /></FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="twitterLink"
              render={({ field }) => (
                <FormItem>
                   <FormLabel className="flex items-center gap-2"><Twitter className="h-4 w-4"/> Twitter (X)</FormLabel>
                   <FormControl><Input type="url" placeholder="https://twitter.com/yourprofile" {...field} value={field.value ?? ''} /></FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} // Call cancel callback from props
                disabled={isSubmitting} // Use local state
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting} // Use local state
              >
                {isSubmitting ? "Saving..." : "Save Changes"} // Use local state
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

ProfileEditForm.propTypes = {
  user: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ProfileEditForm; 