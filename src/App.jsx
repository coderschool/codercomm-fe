import { useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import Router from "./pages/router";
import { Toaster } from "sonner";

function App() {
  const { init } = useAuth((state) => state.actions);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <Router />
      <Toaster position="bottom-right" closeButton />
    </>
  );
}

export default App;
