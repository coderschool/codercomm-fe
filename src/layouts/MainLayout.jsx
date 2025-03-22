import { Outlet } from "react-router-dom";
import { Stack } from "../components/ui";
import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";
import AlertMsg from "../components/AlertMsg";

/**
 * MainLayout - Main layout component for authenticated pages
 * Includes header, alert messages, content area, and footer
 */
function MainLayout() {
  return (
    <Stack className="min-h-screen">
      <MainHeader />
      <AlertMsg />

      <Outlet />

      <div className="flex-grow" />

      <MainFooter />
    </Stack>
  );
}

export default MainLayout;