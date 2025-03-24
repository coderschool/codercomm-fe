import React from "react";

/**
 * Standard loading screen component
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - Loading message to display
 * @param {boolean} [props.fullScreen=true] - Whether to take up full screen
 * @returns {JSX.Element} Loading indicator
 */
function LoadingScreen({ message = "Loading...", fullScreen = true }) {
  const containerClass = fullScreen 
    ? "absolute inset-0 w-full h-full flex justify-center items-center" 
    : "w-full py-8 flex justify-center items-center";

  return (
    <div className={containerClass}>
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      <span className="ml-3 text-lg">{message}</span>
    </div>
  );
}

export default LoadingScreen;