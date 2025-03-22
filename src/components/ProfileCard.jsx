import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, FileText } from 'lucide-react';
import { DEFAULT_AVATAR } from '../lib/config';

/**
 * A card displaying a user's profile information
 */
function ProfileCard({ profile }) {
  if (!profile) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col items-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full border border-gray-200 mb-4 overflow-hidden">
          <img 
            src={profile.avatarUrl || DEFAULT_AVATAR}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Name */}
        <h2 className="text-xl font-semibold mb-1">
          {profile.name}
        </h2>
        
        {/* Email */}
        <p className="text-sm text-gray-500 mb-4">
          {profile.email}
        </p>
        
        {/* Stats */}
        <div className="w-full space-y-2">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-500" />
            <span className="text-sm">
              {profile.friendCount || 0} {profile.friendCount === 1 ? 'friend' : 'friends'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm">
              {profile.postCount || 0} {profile.postCount === 1 ? 'post' : 'posts'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <span className="text-sm">
              {profile.email}
            </span>
          </div>
        </div>
        
        {/* Link to profile */}
        <div className="mt-4 w-full">
          <Link
            to={`/user/${profile._id}`}
            className="block text-center text-blue-500 hover:text-blue-700 hover:underline font-medium"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;