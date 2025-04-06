import React from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Hooks & Services
import { useUpdateProfile } from "@/hooks/useUserQuery"; // The mutation hook

// ShadCN UI Components
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
}).required();

/**
 * Form component for editing the current user's profile information.
 * Uses React Hook Form for state management and Yup for validation.
 * Calls the `useUpdateProfile` mutation hook on submit.
 */
function ProfileEditForm({ user, onCancel, onSuccess }) {
  // Get the mutation function and its state from the custom hook
  const { mutate: updateProfileMutate, isPending: isUpdating, error: updateError } = useUpdateProfile();
  
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
      // Initialize other fields here
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    console.log("Form data submitted:", data);
    // Call the mutation function provided by useUpdateProfile
    // Pass the necessary variables (userId and the form data)
    updateProfileMutate(
      { userId: user._id, ...data }, 
      {
        // Optional: Add callbacks here if needed, though onSuccess/onError in the hook is usually preferred
        onSuccess: () => {
          console.log("Mutation succeeded from component");
          if (onSuccess) onSuccess(); // Call the prop callback to close the form
        },
        onError: (error) => {
           console.error("Mutation failed from component", error);
           // Error is already handled by the hook's onError and displayed below
        }
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display mutation errors */}
        {updateError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Update Failed</AlertTitle>
            <AlertDescription>
              {updateError.message || "Could not update profile. Please try again."}
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
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} // Call cancel callback from props
                disabled={isUpdating} // Disable while updating
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUpdating} // Disable while updating
              >
                {isUpdating ? "Saving..." : "Save Changes"}
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