import React from "react";
import { Toaster } from "sonner";
import Router from "./Router";

function App() {
  return (
    <>
      <Router />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}

export default App;
