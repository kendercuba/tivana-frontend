import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FloatingCards() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
        const data = await res.json();
         console.log("🛒 Productos recibidos:", data); // ✅ Agrega esto
        if (Array.isArray(data)) setProductos(data);
      } catch (err) {
        console.error('❌ Error cargando productos:', err);
      }
    };

    fetchProductos();
  }, []);

  const bloques = [
    productos.slice(0, 4),
    productos.slice(4, 8),
    productos.slice(8, 12),
    productos.slice(12, 16)
  ];

  const manejarClick = (id) => {
    navigate(`/product/${id}`);
  };

   return (
  <div className="w-full max-w-screen-2xl mx-auto flex justify-center gap-6 px-4 flex-nowrap">

    {bloques.map((bloque, i) => (
      <div
        key={i}
        className="rounded-full bg-white shadow-lg p-4 flex flex-col items-center overflow-hidden hover:shadow-xl transition-all
                   w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 px-4 h-full place-content-center">
          {bloque.map((product) => (
  <button
  key={product.id}
  onClick={() => manejarClick(product.id)}
  className="flex justify-center items-center w-full h-full"
>
    <div className="relative w-full h-full flex items-center justify-center">
    <img
      src={product.image || ''}
      alt={product.title || ''}
      className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-full"
    />
    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded shadow">
      ${product.price}
    </span>
  </div>
</button>

))}

        </div>
      </div>
    ))}
  </div>
);

}