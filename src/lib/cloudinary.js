import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
} from "./config";

export const uploadImage = async (imageUrl) => {
  const file = await fetch(imageUrl).then((res) => res.blob()); // reconstructs the file from the url

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  const url = data?.secure_url; // you can already use this url

  return url;

  // // (Optional) Returns a url to an image 400px wide, with quality and size optimized by Cloudinary
  // const tokens = url.split("/");
  // tokens.splice(-3, 0, "h_400,f_auto,q_auto");
  // return tokens.join("/");
};
