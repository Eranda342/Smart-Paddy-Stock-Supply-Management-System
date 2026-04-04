import React from "react";
import Navbar from "../../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
