// src/pages/Cart.jsx
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { user, refreshCart } = useContext(UserContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const enrichedCart = await Promise.all(
  (Array.isArray(data) ? data : []).map(async (item) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${item.product_id}`);
      const data = await res.json();
      return {
        ...item,
        title: data.title,
        image: data.image,
        sizes:
  Array.isArray(data.sizes)
    ? data.sizes
    : typeof data.sizes === 'string'
      ? JSON.parse(data.sizes || '[]')
      : [],

        price: data.price,
        id: data.id, // id interno real
      };
    } catch {
      return item;
    }
  })
);
setCart(enrichedCart);

    console.log("🧪 Carrito con realId:", enrichedCart);
  } catch {
    setError("❌ Error al obtener el carrito");
    setCart([]);
  } finally {
    setLoading(false);
  }
}
     
      else {
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
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const enrichedCart = await Promise.all(
      (Array.isArray(data) ? data : []).map(async (item) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${item.product_id}`);
          const data = await res.json();
          return {
            ...item,
            title: data.title,
            image: data.image,
            sizes:
              Array.isArray(data.sizes)
                ? data.sizes
                : typeof data.sizes === 'string'
                ? JSON.parse(data.sizes || '[]')
                : [],
            price: data.price,
            id: data.id,
          };
        } catch {
          return item;
        }
      })
    );

    setCart(enrichedCart);
    refreshCart();
  } catch {
    setCart([]);
    console.error("❌ Error actualizando carrito");
  }
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

  const nuevoCarrito = localCart.map((p) => {
    if (p.id === item.id && p.size === item.size) {
      return { ...p, size: newSize, sizes: p.sizes || item.sizes };
    }
    return p;
  });

  guardarCarritoLocal(nuevoCarrito);
}

  };

  const calcularSubtotal = () => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Carrito de compras</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : cart.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío.</p>
          ) : (
            <ul className="space-y-6">
  {cart.map((item, index) => (
    <li
      key={index} // 🔑 usamos el índice como clave para mantener orden visual estable
      className="flex items-start gap-4 border-b pb-4"
    >
      <img
        src={item.image}
        alt={item.title}
        className="w-24 h-24 object-cover rounded cursor-pointer"
        onClick={() => navigate(`/product/${item.realId || item.id || item.product_id}`)}
      />
      <div className="flex-1">
        <p
          className="font-semibold text-lg cursor-pointer hover:underline"
          onClick={() => navigate(`/product/${item.realId || item.id || item.product_id}`)}
        >
          {item.title}
        </p>
        <p className="text-gray-600 font-medium">${item.price}</p>

        {item.size && Array.isArray(item.sizes) ? (
        <label className="block text-sm mt-2">
          Talla:
          <select
            value={item.size}
            onChange={(e) => cambiarTalla(item, e.target.value)}
            className="ml-2 border rounded px-2 py-1"
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


        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() =>
              user
                ? disminuirCantidad(item.product_id, item.size)
                : disminuirCantidadInvitado(item.id, item.size)
            }
            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="px-2 font-semibold">{item.quantity}</span>
          <button
            onClick={() =>
              user
                ? aumentarCantidad(item.product_id, item.size)
                : aumentarCantidadInvitado(item.id, item.size)
            }
            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
          <button
            onClick={() =>
              user
                ? eliminarProducto(item.product_id, item.size)
                : eliminarProductoInvitado(item.id, item.size)
            }
            className="ml-4 text-red-500 text-sm hover:underline"
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
          <div className="md:w-80 bg-white rounded shadow p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen</h3>
            <div className="flex justify-between mb-2">
              <span>Productos:</span>
              <span>{Array.isArray(cart) ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${isNaN(calcularSubtotal()) ? "0.00" : calcularSubtotal().toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              El envío y los impuestos se calcularán en el checkout.
            </p>
            <button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded"
              onClick={() => navigate("/checkout")}
            >
              Proceder al pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
}