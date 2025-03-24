# User Profile Feature

In this step, we'll build the user profile feature, which includes viewing and editing profile information.

## Create User Profile Hooks

First, let's create hooks for fetching and updating user profiles. Create or update `src/features/user/userHooks.js`:

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiService from '../../lib/apiService';
import useStore from '../../lib/store';

/**
 * Get current user profile
 * @returns {Object} Query result with current user
 */
export const useGetCurrentUserProfile = () => {
  const queryClient = useQueryClient();
  const setCurrentUser = useStore(state => state.setCurrentUser);
  
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const response = await apiService.get('/users/me');
      setCurrentUser(response);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Object} Query result with user profile
 */
export const useGetUserProfile = (userId) => {
  const setSelectedUser = useStore(state => state.setSelectedUser);
  
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiService.get(`/users/${userId}`);
      setSelectedUser(response);
      return response;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
  });
};

/**
 * Update user profile
 * @returns {Object} Mutation result
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      name,
      avatarUrl,
      coverUrl,
      aboutMe,
      city,
      country,
      company,
      jobTitle,
      facebookLink,
      instagramLink,
      linkedinLink,
      twitterLink,
      phoneNumber,
      address,
    }) => {
      const data = {
        name,
        avatarUrl,
        coverUrl,
        aboutMe,
        city,
        country,
        company,
        jobTitle,
        facebookLink,
        instagramLink,
        linkedinLink,
        twitterLink,
        phoneNumber,
        address,
      };
      
      const response = await apiService.put(`/users/${userId}`, data);
      return response;
    },
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users', data._id] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};
```

## Create Profile Components

Now let's create components for displaying and editing user profiles.

### Create ProfileCover Component

Create `src/features/user/ProfileCover.jsx`:

```jsx
import React from "react";
import { DEFAULT_AVATAR, DEFAULT_COVER } from "../../lib/config";

function ProfileCover({ user }) {
  return (
    <div className="relative h-48 rounded-t-xl overflow-hidden">
      <img
        src={user?.coverUrl || DEFAULT_COVER}
        alt="cover"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 transform translate-y-1/2 ml-4">
        <div className="rounded-full border-4 border-white w-24 h-24 overflow-hidden">
          <img
            src={user?.avatarUrl || DEFAULT_AVATAR}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileCover;
```

### Create ProfileScorecard Component

Create `src/features/user/ProfileScorecard.jsx`:

```jsx
import React from "react";

function ProfileScorecard({ user }) {
  return (
    <div className="flex items-center justify-around bg-gray-50 rounded-lg p-4 shadow-sm">
      <div className="text-center">
        <p className="text-xl font-bold text-gray-800">{user?.postCount || 0}</p>
        <p className="text-sm text-gray-500">Posts</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-gray-800">{user?.friendCount || 0}</p>
        <p className="text-sm text-gray-500">Friends</p>
      </div>
    </div>
  );
}

export default ProfileScorecard;
```

### Create ProfileAbout Component

Create `src/features/user/ProfileAbout.jsx`:

```jsx
import React from "react";

function ProfileAbout({ user }) {
  const renderSocialLink = (link, platform) => {
    if (!link) return null;
    
    return (
      <a 
        href={link.startsWith('http') ? link : `https://${link}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-blue-500 hover:underline mr-4"
      >
        {platform}
      </a>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold mb-4">About {user?.name}</h3>
      
      {user?.aboutMe && (
        <div className="mb-4">
          <p className="text-gray-700">{user.aboutMe}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {user?.company && (
          <div>
            <p className="text-gray-500 text-sm">Company</p>
            <p className="text-gray-700">{user.company}</p>
          </div>
        )}
        
        {user?.jobTitle && (
          <div>
            <p className="text-gray-500 text-sm">Job Title</p>
            <p className="text-gray-700">{user.jobTitle}</p>
          </div>
        )}
        
        {user?.city && (
          <div>
            <p className="text-gray-500 text-sm">City</p>
            <p className="text-gray-700">{user.city}</p>
          </div>
        )}
        
        {user?.country && (
          <div>
            <p className="text-gray-500 text-sm">Country</p>
            <p className="text-gray-700">{user.country}</p>
          </div>
        )}
        
        {user?.phoneNumber && (
          <div>
            <p className="text-gray-500 text-sm">Phone</p>
            <p className="text-gray-700">{user.phoneNumber}</p>
          </div>
        )}
        
        {user?.address && (
          <div>
            <p className="text-gray-500 text-sm">Address</p>
            <p className="text-gray-700">{user.address}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-gray-500 text-sm mb-2">Social Media</p>
        <div className="flex flex-wrap">
          {renderSocialLink(user?.facebookLink, "Facebook")}
          {renderSocialLink(user?.instagramLink, "Instagram")}
          {renderSocialLink(user?.linkedinLink, "LinkedIn")}
          {renderSocialLink(user?.twitterLink, "Twitter")}
        </div>
      </div>
    </div>
  );
}

export default ProfileAbout;
```

### Create ProfileSocialInfo Component

Create `src/features/user/ProfileSocialInfo.jsx`:

```jsx
import React from "react";

function ProfileSocialInfo({ user }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold mb-4">Social Media</h3>
      
      <div className="space-y-3">
        {user?.facebookLink && (
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">
              <i className="fab fa-facebook"></i>
            </span>
            <a 
              href={`https://${user.facebookLink}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {user.facebookLink}
            </a>
          </div>
        )}
        
        {user?.instagramLink && (
          <div className="flex items-center">
            <span className="text-pink-600 mr-2">
              <i className="fab fa-instagram"></i>
            </span>
            <a 
              href={`https://${user.instagramLink}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {user.instagramLink}
            </a>
          </div>
        )}
        
        {user?.linkedinLink && (
          <div className="flex items-center">
            <span className="text-blue-800 mr-2">
              <i className="fab fa-linkedin"></i>
            </span>
            <a 
              href={`https://${user.linkedinLink}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {user.linkedinLink}
            </a>
          </div>
        )}
        
        {user?.twitterLink && (
          <div className="flex items-center">
            <span className="text-blue-400 mr-2">
              <i className="fab fa-twitter"></i>
            </span>
            <a 
              href={`https://${user.twitterLink}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {user.twitterLink}
            </a>
          </div>
        )}
        
        {!user?.facebookLink && !user?.instagramLink && !user?.linkedinLink && !user?.twitterLink && (
          <p className="text-gray-500">No social media links provided.</p>
        )}
      </div>
    </div>
  );
}

export default ProfileSocialInfo;
```

### Create Main Profile Component

Create `src/features/user/Profile.jsx`:

```jsx
import React from "react";
import { Tab } from '@headlessui/react';
import { useParams } from "react-router-dom";
import { useGetUserProfile } from "./userHooks";
import LoadingScreen from "../../components/LoadingScreen";
import ProfileCover from "./ProfileCover";
import ProfileScorecard from "./ProfileScorecard";
import ProfileAbout from "./ProfileAbout";
import ProfileSocialInfo from "./ProfileSocialInfo";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Profile() {
  const { userId } = useParams();
  const { data: user, isLoading, error } = useGetUserProfile(userId);
  
  if (isLoading) {
    return <LoadingScreen message="Loading profile..." fullScreen={false} />;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
        Error: {error.message}
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-4">
        User not found.
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <ProfileCover user={user} />
      
      <div className="p-4 sm:p-6 pt-16">
        <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
        {user.jobTitle && (
          <p className="text-gray-500 mb-4">{user.jobTitle} {user.company ? `at ${user.company}` : ''}</p>
        )}
        
        <div className="mb-6">
          <ProfileScorecard user={user} />
        </div>
        
        <Tab.Group>
          <Tab.List className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              About
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              Social
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <ProfileAbout user={user} />
            </Tab.Panel>
            <Tab.Panel>
              <ProfileSocialInfo user={user} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

export default Profile;
```

## Create Account Settings Components

Now let's create components for account settings.

### Create AccountGeneral Component

Create `src/features/user/AccountGeneral.jsx`:

```jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUpdateUserProfile } from "./userHooks";
import useAuth from "../../hooks/useAuth";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  avatarUrl: yup.string().url("Must be a valid URL").nullable(),
  coverUrl: yup.string().url("Must be a valid URL").nullable(),
  aboutMe: yup.string().nullable(),
  city: yup.string().nullable(),
  country: yup.string().nullable(),
  company: yup.string().nullable(),
  jobTitle: yup.string().nullable(),
  phoneNumber: yup.string().nullable(),
  address: yup.string().nullable(),
});

function AccountGeneral() {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateUserProfile();
  
  const defaultValues = {
    name: user?.name || "",
    email: user?.email || "",
    avatarUrl: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
    aboutMe: user?.aboutMe || "",
    city: user?.city || "",
    country: user?.country || "",
    company: user?.company || "",
    jobTitle: user?.jobTitle || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  
  const onSubmit = (data) => {
    updateProfileMutation.mutate({
      userId: user.id,
      ...data,
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">General Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <input
              type="text"
              {...register("avatarUrl")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.avatarUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.avatarUrl.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Cover URL</label>
            <input
              type="text"
              {...register("coverUrl")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.coverUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.coverUrl.message}</p>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">About</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">About Me</label>
          <textarea
            {...register("aboutMe")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Work</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              {...register("company")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <input
              type="text"
              {...register("jobTitle")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              {...register("city")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              {...register("country")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              {...register("phoneNumber")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              {...register("address")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default AccountGeneral;
```

### Create AccountSocialLinks Component

Create `src/features/user/AccountSocialLinks.jsx`:

```jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUpdateUserProfile } from "./userHooks";
import useAuth from "../../hooks/useAuth";

const schema = yup.object().shape({
  facebookLink: yup.string().nullable(),
  instagramLink: yup.string().nullable(),
  linkedinLink: yup.string().nullable(),
  twitterLink: yup.string().nullable(),
});

function AccountSocialLinks() {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateUserProfile();
  
  const defaultValues = {
    facebookLink: user?.facebookLink || "",
    instagramLink: user?.instagramLink || "",
    linkedinLink: user?.linkedinLink || "",
    twitterLink: user?.twitterLink || "",
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  
  const onSubmit = (data) => {
    // We need to include the user ID and all other fields that are required
    updateProfileMutation.mutate({
      userId: user.id,
      name: user.name, // Include required fields
      ...data,
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Social Media Links</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Facebook</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                facebook.com/
              </span>
              <input
                type="text"
                {...register("facebookLink")}
                className="w-full pl-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="username"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                instagram.com/
              </span>
              <input
                type="text"
                {...register("instagramLink")}
                className="w-full pl-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="username"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                linkedin.com/in/
              </span>
              <input
                type="text"
                {...register("linkedinLink")}
                className="w-full pl-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="username"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Twitter</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                twitter.com/
              </span>
              <input
                type="text"
                {...register("twitterLink")}
                className="w-full pl-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="username"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default AccountSocialLinks;
```

## Create Profile Pages

Now let's create pages to display and edit user profiles.

### Create UserProfilePage

Create `src/pages/UserProfilePage.jsx`:

```jsx
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Profile from "../features/user/Profile";
import { useGetUserProfile } from "../features/user/userHooks";
import LoadingScreen from "../components/LoadingScreen";
import useAuth from "../hooks/useAuth";

function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading } = useGetUserProfile(userId);
  
  const isCurrentUser = currentUser && userId === currentUser.id;
  
  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }
  
  return (
    <>
      <Helmet>
        <title>{user?.name || "User"} | CoderComm</title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto">
        <Profile />
        
        {/* In later steps, we'll add PostList component here */}
      </div>
    </>
  );
}

export default UserProfilePage;
```

### Create AccountPage

Create `src/pages/AccountPage.jsx`:

```jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Tab } from '@headlessui/react';
import AccountGeneral from "../features/user/AccountGeneral";
import AccountSocialLinks from "../features/user/AccountSocialLinks";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function AccountPage() {
  return (
    <>
      <Helmet>
        <title>Account Settings | CoderComm</title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Tab.Group>
            <Tab.List className="flex p-1 bg-gray-100">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full py-3 text-sm font-medium',
                    'focus:outline-none',
                    selected
                      ? 'bg-white shadow'
                      : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
                  )
                }
              >
                General
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full py-3 text-sm font-medium',
                    'focus:outline-none',
                    selected
                      ? 'bg-white shadow'
                      : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-800'
                  )
                }
              >
                Social Links
              </Tab>
            </Tab.List>
            <Tab.Panels className="p-6">
              <Tab.Panel>
                <AccountGeneral />
              </Tab.Panel>
              <Tab.Panel>
                <AccountSocialLinks />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </>
  );
}

export default AccountPage;
```

## Update Routes

Now, update `src/routes/index.jsx` to include the profile pages:

```jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import UserProfilePage from "../pages/UserProfilePage";
import AccountPage from "../pages/AccountPage";
import NotFoundPage from "../pages/NotFoundPage";

function Router() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthRequire>
            <MainLayout />
          </AuthRequire>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="user/:userId" element={<UserProfilePage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>

      <Route element={<BlankLayout />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default Router;
```

## Update MainHeader to Include Account Link

Update `src/layouts/MainHeader.jsx` to include a link to the account page:

```jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import useAuth from "../hooks/useAuth";

function MainHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          
          <div className="flex items-center">
            {user && (
              <div className="flex items-center">
                <Link
                  to="/account"
                  className="mr-4 text-gray-700 hover:text-primary"
                >
                  Account
                </Link>
                <Link
                  to={`/user/${user.id}`}
                  className="flex items-center mr-4 hover:text-primary"
                >
                  <img
                    className="h-8 w-8 rounded-full mr-2"
                    src={user.avatarUrl || "https://via.placeholder.com/150"}
                    alt={user.name}
                  />
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
```

## Test the User Profile Feature

Run your application and test the user profile feature:

```bash
npm run dev
```

You should be able to:
- View your profile at `/user/[your-user-id]`
- Update your general information at `/account`
- Update your social links

In the next step, we'll build the posts and comments features so users can interact with each other.