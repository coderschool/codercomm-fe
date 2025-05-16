import { ThumbsUp, Heart, Laugh, Angry, Frown } from "lucide-react";

// Client-side secrets
export const API_URL = import.meta.env.VITE_API_URL;

// Server secrets (Mocking purpose only)
export const MOCK_JWT_SECRET = new TextEncoder().encode("coderschool");

// Constants
export const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dmwjwtpbk/image/upload/v1711065857/cld-sample.jpg";
export const DEFAULT_COVER =
  "https://res.cloudinary.com/dmwjwtpbk/image/upload/v1711065859/sample.jpg";

export const REACTION_EMOJIS = [
  {
    emoji: "LIKE",
    icon: ThumbsUp,
    textColor: "text-green-500",
    borderColor: "border-green-500",
  },
  {
    emoji: "LOVE",
    icon: Heart,
    textColor: "text-pink-300",
    borderColor: "border-pink-300",
  },
  {
    emoji: "HAHA",
    icon: Laugh,
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500",
  },
  {
    emoji: "SAD",
    icon: Frown,
    textColor: "text-blue-500",
    borderColor: "border-blue-500",
  },
  {
    emoji: "ANGRY",
    icon: Angry,
    textColor: "text-red-500",
    borderColor: "border-red-500",
  },
];
