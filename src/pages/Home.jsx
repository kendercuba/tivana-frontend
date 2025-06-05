import Carousel from "../components/Carousel";
import FloatingCards from "../components/FloatingCards";

export default function Home() {
  return (
    <div>
      <div className="relative">
        <Carousel />
        <div className="absolute bottom-[-5rem] left-0 w-full">
          <FloatingCards />
        </div>
      </div>
    </div>
  );
}
