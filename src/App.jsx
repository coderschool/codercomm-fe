import { useEffect } from "react";
import { useAuthAction } from "@/lib/auth/useAuth";
import Router from "./pages/router";
import { Toaster } from "sonner";

function App() {
  const { init } = useAuthAction();

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
