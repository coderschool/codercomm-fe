import { Outlet } from "react-router-dom";
import Logo from "../components/Logo";
import { Stack } from "../components/ui";

/**
 * BlankLayout - A simple layout component that centers its content with a logo
 * Used for pages like login and registration where we want minimal UI elements
 */
function BlankLayout() {
  return (
    <Stack className="min-h-screen justify-center items-center">
      <Logo className="w-24 h-24 mb-12" />
      <Outlet />
    </Stack>
  );
}

export default BlankLayout;