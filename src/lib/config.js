export const API_URL = import.meta.env.VITE_API_URL;
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Pagination settings
export const POSTS_PER_PAGE = 5;
export const COMMENTS_PER_POST = 3;
export const USERS_PER_PAGE = 12;

// Default avatar if user doesn't have one
export const DEFAULT_AVATAR = "https://res.cloudinary.com/dmwjwtpbk/image/upload/v1711065857/cld-sample.jpg";

// Default cover photo
export const DEFAULT_COVER = "https://res.cloudinary.com/dmwjwtpbk/image/upload/v1711065859/sample.jpg";