import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Briefcase } from "lucide-react";

function ProfileAbout({ profile }) {
  const { aboutMe, city, country, email, company } = profile;

  return (
    <Card>
      <CardHeader>
        <h6 className="text-lg font-medium">About</h6>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm">{aboutMe}</p>

        <div className="flex flex-row">
          <div className="w-5 h-5 mt-1 flex-shrink-0 mr-2">
            <MapPin className="w-full h-full" />
          </div>
          <p className="text-sm">
            <span className="font-medium">
              {city} {country}
            </span>
          </p>
        </div>

        <div className="flex flex-row">
          <div className="w-5 h-5 mt-1 flex-shrink-0 mr-2">
            <Mail className="w-full h-full" />
          </div>
          <p className="text-sm">{email}</p>
        </div>

        <div className="flex flex-row">
          <div className="w-5 h-5 mt-1 flex-shrink-0 mr-2">
            <Briefcase className="w-full h-full" />
          </div>
          <p className="text-sm">
            <span className="font-medium">{company}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileAbout;
