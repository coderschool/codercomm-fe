import { Outlet } from "react-router-dom";
import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";

/**
 * MainLayout - Main layout component for authenticated pages
 * Includes header, content area, and footer
 */
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />

      <main className="flex-grow mt-2">
        <Outlet />
      </main>

      <MainFooter />
    </div>
  );
}

export default MainLayout;