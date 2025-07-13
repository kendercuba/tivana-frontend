// src/pages/Home.jsx
import Carousel from "../components/Carousel";
import FloatingCards from "../components/FloatingCards";

export default function Home() {
  return (
    <div>
      {/* 🟢 Carrusel con margen inferior suficiente */}
      <div className="border-4 border-green-500 mb-[-3rem] z-0 relative overflow-hidden">
        <Carousel />
      </div>

       {/* 🟡 FloatingCards: solo visible en md+ */}
      <div className="hidden md:block md:mt-[-5rem] border-4 border-yellow-500 z-10 relative">

        <FloatingCards />
      </div>
    </div>
  );
}
