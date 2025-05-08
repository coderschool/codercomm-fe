import { LoaderCircle } from "lucide-react";
import React from "react";

/**
 * Standard loading screen component
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - Loading message to display
 * @param {boolean} [props.fullScreen=true] - Whether to take up full screen
 * @returns {JSX.Element} Loading indicator
 */
function LoadingCircle({ fullScreen = true }) {
  const containerClass = fullScreen
    ? "absolute inset-0 w-full h-full flex justify-center items-center"
    : "w-full py-8 flex justify-center items-center";

  return (
    <div className={containerClass}>
      <LoaderCircle className="w-12 h-12 animate-spin" />
    </div>
  );
}

export default LoadingCircle;
