import { ThumbsUp, Heart, Laugh, Angry, Frown } from "lucide-react";

// Client-side secrets
export const API_URL = import.meta.env.VITE_API_URL;
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env
  .VITE_CLOUDINARY_UPLOAD_PRESET;

// Constants

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

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
