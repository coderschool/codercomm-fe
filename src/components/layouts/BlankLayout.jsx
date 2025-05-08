import React from "react";
import { Outlet } from "react-router";
import Logo from "../Logo";

/**
 * BlankLayout - A simple layout component that centers its content with a logo
 * Used for pages like login and registration where we want minimal UI elements
 */
function BlankLayout() {
  return (
    <main className="min-h-screen flex flex-col justify-center">
      <div className="flex gap-5 items-center justify-center">
        <Logo className="w-16 h-16 mx-auto" />
        <h1 className="text-2xl font-bold">CoderComm</h1>
      </div>
      <Outlet />
    </main>
  );
}

export default BlankLayout;
