import productosOriginales from '../data/productos_tivana.json';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const productos = productosOriginales.map(producto => ({
  ...producto,
  product_id: String(producto.product_id)
}));

const titulos = ['Más vendidos', 'Ofertas del día', 'Seguir comprando', 'Tus pedidos'];
const bloques = [
  productos.slice(0, 4),
  productos.slice(4, 8),
  productos.slice(8, 12),
  productos.slice(12, 16)
];

export default function FloatingCards() {
  const navigate = useNavigate();

  const manejarClick = async (product_id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/resolver-id/${product_id}`);
      const data = await res.json();

      if (res.ok && data.id) {
        navigate(`/product/${data.id}`);
      } else {
        alert('Producto no encontrado en la base de datos.');
      }
    } catch (err) {
      console.error('❌ Error al resolver ID:', err);
      alert('Ocurrió un error al cargar el producto.');
    }
  };

  return (
    <div className="flex justify-center gap-6 px-4 flex-wrap">
      {bloques.map((bloque, i) => (
        <div
          key={i}
          className="rounded-full bg-white shadow-lg p-4 flex flex-col items-center overflow-hidden hover:shadow-xl transition-all
                     w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96"
        >
          <h2 className="text-base font-bold text-center mb-2">{titulos[i]}</h2>

          <div className="grid grid-cols-2 gap-3 w-full px-2">
            {bloque.map((product) => (
              <button
                key={product.product_id}
                onClick={() => manejarClick(product.product_id)}
                className="flex justify-center items-center w-full h-full"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={product.main_image}
                    alt=""
                    className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-full"
                  />
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded shadow">
                    {product.sale_price?.usd_amount_with_symbol}
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