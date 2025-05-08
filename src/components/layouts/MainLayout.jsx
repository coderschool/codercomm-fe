import React from "react";
import { Outlet } from "react-router";
import MainHeader from "./MainHeader";

/**
 * MainLayout - Main layout component for authenticated pages
 * Includes header and content area.
 */
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer was not present in the target commit's MainLayout structure */}
    </div>
  );
}

export default MainLayout;
