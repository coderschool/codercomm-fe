import React from "react";

function LoadingScreen() {
  return (
    <div className="absolute inset-0 w-full h-full flex justify-center items-center">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
    </div>
  );
}

export default LoadingScreen;
