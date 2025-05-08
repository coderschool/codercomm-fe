import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./routes/App";

// Import Tailwind CSS
import "./index.css";

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
  const { browserServer } = await import("./mockApi/server");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return browserServer.start();
}

enableMocking().then(() => {
  renderApp();
});
