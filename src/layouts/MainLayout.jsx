import React from 'react';
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader";

/**
 * MainLayout - Main layout component for authenticated pages
 * Includes header, content area, and footer
 */
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />

      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Add a Footer component here later if needed */}
    </div>
  );
}

export default MainLayout;