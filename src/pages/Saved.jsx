// src/pages/Saved.jsx
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Saved() {
  const { user, refreshCart } = useContext(UserContext);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Obtener productos guardados al cargar
  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/saved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSavedItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error al cargar productos guardados", err);
        setSavedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  // 🔄 Mover al carrito
  const moverAlCarrito = async (item) => {
    try {
      const token = localStorage.getItem("token");

      // 1. Agregar al carrito
      await fetch(`${import.meta.env.VITE_API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: item.product_id,
          size: item.size,
          quantity: item.quantity || 1,
        }),
      });

      // 2. Eliminar del guardado
      await fetch(`${import.meta.env.VITE_API_URL}/saved/${item.product_id}/${item.size}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // 3. Actualizar vista
      setSavedItems((prev) =>
        prev.filter((i) => !(i.product_id === item.product_id && i.size === item.size))
      );
      refreshCart();
    } catch (err) {
      console.error("❌ Error al mover al carrito", err);
    }
  };

  // 🗑️ Eliminar producto guardado
  const eliminarGuardado = async (item) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL}/saved/${item.product_id}/${item.size}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setSavedItems((prev) =>
        prev.filter((i) => !(i.product_id === item.product_id && i.size === item.size))
      );
    } catch (err) {
      console.error("❌ Error al eliminar guardado", err);
    }
  };

    return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Guardado para más tarde</h2>

      {savedItems.length === 0 ? (
        <p className="text-gray-500">No tienes productos guardados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item, index) => (
            <div key={index} className="bg-white shadow rounded p-4 flex flex-col">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover rounded mb-4 cursor-pointer"
                onClick={() =>
                  navigate(`/product/${item.realId || item.id || item.product_id}`)
                }
              />
              <h3
                className="text-lg font-semibold text-gray-800 mb-1 cursor-pointer hover:underline"
                onClick={() =>
                  navigate(`/product/${item.realId || item.id || item.product_id}`)
                }
              >
                {item.title}
              </h3>
              <p className="text-gray-600 font-medium mb-2">${item.price}</p>
              <p className="text-sm text-gray-500 mb-4">Talla: {item.size}</p>

              <div className="mt-auto flex justify-between">
                <button
                  onClick={() => moverAlCarrito(item)}
                  className="text-green-600 hover:underline text-sm"
                >
                  Mover al carrito
                </button>
                <button
                  onClick={() => eliminarGuardado(item)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
