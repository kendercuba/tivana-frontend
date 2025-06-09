// src/pages/me/Cart.jsx
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom"; // ✅ para redirigir a la pagina checkout

export default function MeCart() {
  console.log("Carrito renderizado");
  const { user, refreshCart } = useContext(UserContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

// Actualizo Cart.jsx para corregir render de productos y demas cosas 
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setCart(Array.isArray(data) ? data : []);
        } catch {
          setError("❌ Error al obtener el carrito");
          setCart([]); // fallback vacío
        } finally {
          setLoading(false);
        }
      } else {
        const localCart = localStorage.getItem("guest_cart");
        const parsed = localCart ? JSON.parse(localCart) : [];

        const enrichedCart = await Promise.all(
          parsed.map(async (item) => {
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${item.id}`);
              const data = await res.json();
              const sizes = Array.isArray(data.sizes)
                ? data.sizes
                : JSON.parse(data.sizes || "[]");

              return { ...item, sizes };
            } catch {
              return item;
            }
          })
        );

        setCart(enrichedCart);
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const actualizarCarrito = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCart(Array.isArray(data) ? data : []);
    refreshCart();
  };

  const aumentarCantidad = async (productId, size) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );

    const token = localStorage.getItem("token");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, size, action: "increment" }),
      });
      refreshCart();
    } catch {
      console.error("❌ Error al aumentar cantidad");
    }
  };

  const disminuirCantidad = async (productId, size) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId && item.size === size && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

    const token = localStorage.getItem("token");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, size, action: "decrement" }),
      });
      refreshCart();
    } catch {
      console.error("❌ Error al disminuir cantidad");
    }
  };

  const eliminarProducto = async (productId, size) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_URL}/cart/delete/${productId}/${size}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    actualizarCarrito();
  };

  const guardarCarritoLocal = (carrito) => {
    localStorage.setItem("guest_cart", JSON.stringify(carrito));
    setCart(carrito);
    refreshCart();
  };

  const aumentarCantidadInvitado = (productId, size) => {
    const actualizado = cart.map((item) =>
      item.id === productId && item.size === size
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCart(actualizado);
    guardarCarritoLocal(actualizado);
  };

  const disminuirCantidadInvitado = (productId, size) => {
    const actualizado = cart.map((item) =>
      item.id === productId && item.size === size && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCart(actualizado);
    guardarCarritoLocal(actualizado);
  };

  const eliminarProductoInvitado = (productId, size) => {
    const carrito = cart.filter(
      (item) => !(item.id === productId && item.size === size)
    );
    guardarCarritoLocal(carrito);
  };

  const cambiarTalla = async (item, newSize) => {
    if (user) {
      const token = localStorage.getItem("token");

      await fetch(`${import.meta.env.VITE_API_URL}/cart/update-size`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: item.product_id,
          old_size: item.size,
          new_size: newSize,
        }),
      });

      actualizarCarrito();
    } else {
      const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");

      const nuevoCarrito = localCart.filter(
        (p) => !(p.id === item.id && p.size === item.size)
      );

      const existente = nuevoCarrito.find(
        (p) => p.id === item.id && p.size === newSize
      );

      if (existente) {
        existente.quantity += item.quantity;
      } else {
        nuevoCarrito.push({ ...item, size: newSize });
      }

      guardarCarritoLocal(nuevoCarrito);
    }
  };

  const calcularSubtotal = () => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="md:flex gap-8">
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4">carrito de compras</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : cart.length === 0 ? (
          <p>No hay productos en tu carrito.</p>
        ) : (
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={`${item.id}-${item.size}`}
                className="border rounded p-3 shadow flex items-center gap-4"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded cursor-pointer"
                  onClick={() => (window.location.href = `/product/${item.id}`)}
                />
                <div className="flex-1">
                  <p
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={() => (window.location.href = `/product/${item.id}`)}
                  >
                    {item.title}
                  </p>
                  <p className="text-gray-600">${item.price}</p>

                  {item.size && item.sizes ? (
                    <label className="text-sm text-gray-600 block mt-1">
                      Talla:
                      <select
                        value={item.size}
                        onChange={(e) => cambiarTalla(item, e.target.value)}
                        className="ml-2 border rounded px-2 py-1 text-sm"
                      >
                        {item.sizes.map((sizeOption) => (
                          <option key={sizeOption} value={sizeOption}>
                            {sizeOption}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : item.size ? (
                    <p className="text-sm text-gray-500">Talla: {item.size}</p>
                  ) : null}

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        user
                          ? disminuirCantidad(item.product_id, item.size)
                          : disminuirCantidadInvitado(item.id, item.size)
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        user
                          ? aumentarCantidad(item.product_id, item.size)
                          : aumentarCantidadInvitado(item.id, item.size)
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        user
                          ? eliminarProducto(item.product_id, item.size)
                          : eliminarProductoInvitado(item.id, item.size)
                      }
                      className="ml-4 text-sm text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && cart.length > 0 && (
        <div className="mt-8 md:mt-0 bg-white p-4 rounded shadow-md max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">no mas cambios porfavor</h3>

          <div className="flex justify-between mb-2">
            <span>Productos ({Array.isArray(cart) ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0}):</span>
            <span>${isNaN(calcularSubtotal()) ? "0.00" : calcularSubtotal().toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Subtotal:</span>
            <span>${isNaN(calcularSubtotal()) ? "0.00" : calcularSubtotal().toFixed(2)}</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            El envío y los impuestos se calcularán en el checkout.
          </p>

          <button
            className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded transition"
            onClick={() => navigate("/checkout")}
          >
            Proceder al pago
          </button>
        </div>
      )}
    </div>
  );
}
// al final del archivo
