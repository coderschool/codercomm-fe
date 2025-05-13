// Client-side secrets
export const API_URL = import.meta.env.VITE_API_URL;

// Server secrets (Mocking purpose only)
export const MOCK_JWT_SECRET = new TextEncoder().encode("coderschool");

// Constants
export const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dmwjwtpbk/image/upload/v1711065857/cld-sample.jpg";
export const DEFAULT_COVER =
  "https://res.cloudinary.com/dmwjwtpbk/image/upload/v1711065859/sample.jpg";
