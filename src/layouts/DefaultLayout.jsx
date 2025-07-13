// src/layouts/DefaultLayout.jsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function DefaultLayout() {
  return (
    <>
      <Header />
      <main className="pt-0 mt-0 border-4 border-red-500 overflow-x-hidden">

        <div className="max-w-screen-2xl mx-auto px-4 border-4 border-blue-500">

          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}
