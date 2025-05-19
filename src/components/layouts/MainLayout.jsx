import React from "react";
import { Outlet } from "react-router";
import MainHeader from "./MainHeader";

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />

      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
