// src/pages/Home.jsx
import Carousel from "../components/Carousel";
import FloatingCards from "../components/FloatingCards";

export default function Home() {
  return (
    <div>
      {/* 🟢 Carrusel con margen inferior suficiente */}
      <div className="border-4 border-green-500 mb-[-3rem] z-0 relative">
        <Carousel />
      </div>

      {/* 🟡 FloatingCards que se sube visualmente */}
      <div className="border-4 border-yellow-500 -mt-48 z-10 relative">
        <FloatingCards />
      </div>
    </div>
  );
}
