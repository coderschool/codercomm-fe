import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Linkedin, Twitter, Facebook, Instagram } from "lucide-react";

function ProfileSocialInfo({ profile }) {
  const { facebookLink, instagramLink, linkedinLink, twitterLink } = profile;

  const SOCIALS = [
    {
      name: "Linkedin",
      icon: <Linkedin className="w-5 h-5 text-[#006097]" />,
      href: linkedinLink,
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5 text-[#1C9CEA]" />,
      href: twitterLink,
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
      href: facebookLink,
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5 text-[#D7336D]" />,
      href: instagramLink,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h6 className="text-lg font-medium">Social</h6>
      </CardHeader>
      <CardContent className="space-y-4">
        {SOCIALS.map((link) => (
          <div key={link.name} className="flex items-center">
            <div className="w-5 h-5 mt-1 flex-shrink-0 mr-2">
              {link.icon}
            </div>
            <span className="text-sm truncate">
              {link.href}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ProfileSocialInfo;
