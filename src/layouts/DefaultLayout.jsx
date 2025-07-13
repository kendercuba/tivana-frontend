// src/layouts/DefaultLayout.jsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function DefaultLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white"> {/* ✅ Contenedor raíz */}
      <Header />
      <main className="flex-grow pt-0 mt-0 border-4 border-red-500 overflow-visible">
        <div className="max-w-screen-2xl mx-auto px-4 border-4 border-blue-500">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
