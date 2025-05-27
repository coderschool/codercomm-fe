import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import "./index.css";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
};

async function enableMocking() {
  const { browserServer } = await import("./lib/mock-api/server");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return browserServer.start();
}

enableMocking().then(() => {
  renderApp();
});
