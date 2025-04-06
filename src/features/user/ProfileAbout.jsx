import React from "react";
import PropTypes from 'prop-types';
import { Mail, MapPin, Briefcase, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Displays the read-only "About" section of a user's profile.
 */
function ProfileAbout({ user }) {
  if (!user) return null; // Handle case where user data might not be loaded yet

  return (
    <Card>
      <CardHeader>
        <CardTitle>About {user.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* About Me Text */}
        {user.aboutMe && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{user.aboutMe}</p>
          </div>
        )}

        {/* Details List */}
        <div className="space-y-3">
          {user.jobTitle && (
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              <span>{user.jobTitle}{user.company && ` at ${user.company}`}</span>
            </div>
          )}
           {(user.city || user.country) && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              <span>Lives in {user.city}{user.city && user.country && ", "}{user.country}</span>
            </div>
          )}
           {user.email && ( // Consider privacy implications of showing email publicly
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              {/* Use mailto link for email */}
              <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
            </div>
          )}
          {/* Add other fields like website, social links if available in your data */}
          {user.website && (
            <div className="flex items-center text-sm">
              <LinkIcon className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              <a 
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {user.website}
              </a>
            </div>
          )}
        </div>
         {!user.aboutMe && !user.jobTitle && !user.city && !user.country && !user.email && (
             <p className="text-sm text-muted-foreground italic">No additional information provided.</p>
         )}
      </CardContent>
    </Card>
  );
}

ProfileAbout.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatarUrl: PropTypes.string,
    coverUrl: PropTypes.string,
    aboutMe: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    company: PropTypes.string,
    jobTitle: PropTypes.string,
    website: PropTypes.string,
    // Add other expected fields
  }),
};

export default ProfileAbout;
