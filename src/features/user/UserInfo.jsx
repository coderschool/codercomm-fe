import React from "react";
import { useUserState } from "./UserStoreProvider";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router";
import UserInfoFallback from "./UserInfoFallback";

function UserInfo() {
  const { user, isLoading } = useUserState();

  if (isLoading) {
    return <UserInfoFallback />;
  }

  const {
    aboutMe,
    city,
    country,
    company,
    jobTitle,
    facebookLink,
    instagramLink,
    linkedinLink,
    twitterLink,
  } = user;

  const hasInfo = aboutMe || city || country || company || jobTitle;
  const hasSocials =
    facebookLink || instagramLink || linkedinLink || twitterLink;

  return (
    <div className="container max-w-sm rounded-md bg-slate-100 flex flex-col gap-4 p-6 h-fit">
      {!hasInfo && (
        <div className="flex flex-col">
          <h4 className="text-lg font-bold">No info</h4>
          <p className="text-sm text-gray-500">
            This user has not added any information yet.
          </p>
        </div>
      )}
      {aboutMe && (
        <div className="flex flex-col">
          <h4 className="text-lg font-bold">About me</h4>
          <p className="text-sm text-gray-500">{aboutMe}</p>
        </div>
      )}
      {(city || country) && (
        <div className="flex flex-col">
          <h4 className="text-lg font-bold">Location</h4>
          <p className="text-sm text-gray-500">
            {city && `${city}`}
            {city && country && `, `}
            {country && `${country}`}
          </p>
        </div>
      )}
      {(company || jobTitle) && (
        <div className="flex flex-col">
          <h4 className="text-lg font-bold">Work</h4>
          <p className="text-sm text-gray-500 truncate">
            {company && `${company}`}
            {company && jobTitle && ` - `}
            {jobTitle && `${jobTitle}`}
          </p>
        </div>
      )}

      {hasSocials && (
        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-bold">Socials</h4>
          <div className="flex flex-col gap-2 -ml-0.5">
            {facebookLink && (
              <Link
                to={facebookLink}
                className="text-sm text-gray-500 flex gap-2 items-center line-clamp-1 text-ellipsis"
              >
                <Facebook size={20} className="shrink-0" />
                <p className="text-sm text-gray-500 truncate">{facebookLink}</p>
              </Link>
            )}
            {instagramLink && (
              <Link
                to={instagramLink}
                className="text-sm text-gray-500 flex gap-2 items-center line-clamp-1 text-ellipsis"
              >
                <Instagram size={20} className="shrink-0" />
                <p className="text-sm text-gray-500 truncate">
                  {instagramLink}
                </p>
              </Link>
            )}
            {linkedinLink && (
              <Link
                to={linkedinLink}
                className="text-sm text-gray-500 flex gap-2 items-center line-clamp-1 text-ellipsis"
              >
                <Linkedin size={20} className="shrink-0" />
                <p className="text-sm text-gray-500 truncate">{linkedinLink}</p>
              </Link>
            )}
            {twitterLink && (
              <Link
                to={twitterLink}
                className="text-sm text-gray-500 flex gap-2 items-center line-clamp-1 text-ellipsis"
              >
                <Twitter size={20} className="shrink-0" />
                <p className="text-sm text-gray-500 truncate">{twitterLink}</p>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserInfo;
