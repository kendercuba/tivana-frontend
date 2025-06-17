// src/pages/Cart.jsx
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function Cart() {
  const { user, refreshCart } = useContext(UserContext);
  const navigate = useNavigate();

  // 🛒 Estados principales
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initialized = useRef(false);

// 🔁 Guardar selección cada vez que cambie
useEffect(() => {
  if (initialized.current) {
    // ✅ Solo guardar si el carrito ya fue cargado y hay ítems válidos
    const keys = cart.map(item => `${item.id || item.product_id}-${item.size}`);
    const validSelected = selectedItems.filter(k => keys.includes(k));

    localStorage.setItem("selected_items", JSON.stringify(validSelected));
  }
}, [selectedItems, cart]);


  // 📦 useEffect para cargar carrito (logueado o invitado)
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
                  sizes: Array.isArray(data.sizes)
                    ? data.sizes
                    : typeof data.sizes === "string"
                    ? JSON.parse(data.sizes || "[]")
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

} catch {
  setError("❌ Error al obtener el carrito");
  setCart([]);
} finally {
  setLoading(false);
}
} else {
  // 🧑‍💻 Usuario invitado
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

  // ✅ Seleccionar todos los productos al cargar (invitado)
  setSelectedItems((prevSelected) => {
    if (prevSelected.length > 0) return prevSelected;
    return enrichedCart
      .filter(item => item.size)
      .map(item => `${item.id || item.product_id}-${item.size}`);
  });

  setLoading(false);
}

    };

    fetchCart(); 
  }, []);         // ← final del useEffect principal que carga el carrito

// ✅ useEffect separado para mantener las selecciones de productos al recargar
useEffect(() => {
  if (cart.length > 0 && !initialized.current) {
    const savedSelection = localStorage.getItem("selected_items");

    console.log("📌 Inicializando selección tras cargar carrito");
    const keysEnriched = cart
      .filter(item => item && item.size)
      .map(item => `${item.id || item.product_id}-${item.size}`);

    if (savedSelection !== null) {
      try {
        const parsed = JSON.parse(savedSelection);

        // ✅ Importante: respetar arreglo vacío también
        const validKeys = parsed.filter(k => keysEnriched.includes(k));
        setSelectedItems(validKeys);
      } catch (e) {
        console.warn("❌ Error al parsear selección guardada:", e);
        setSelectedItems([]);
        localStorage.setItem("selected_items", JSON.stringify([]));
      }
    } else {
      // ✅ Solo si es la PRIMERA VEZ (no hay nada guardado aún)
      setSelectedItems(keysEnriched);
      localStorage.setItem("selected_items", JSON.stringify(keysEnriched));
    }

    initialized.current = true;
  }
}, [cart]);


// ✅ Detectar productos nuevos y agregarlos seleccionados por defecto (sin interferir con clic manual)
useEffect(() => {
  if (!initialized.current) return;

  const keysInCart = cart
    .filter(item => item && item.size)
    .map(item => `${item.id || item.product_id}-${item.size}`);

  // Solo agregar claves nuevas, no reemplazar
  const savedSelection = localStorage.getItem("selected_items");
  let currentSelected = [];

  try {
    currentSelected = savedSelection ? JSON.parse(savedSelection) : [];
  } catch {
    currentSelected = [];
  }

  const newKeys = keysInCart.filter(k => !currentSelected.includes(k));

  if (newKeys.length > 0) {
    const updated = [...currentSelected, ...newKeys];
    setSelectedItems(updated);
    localStorage.setItem("selected_items", JSON.stringify(updated));
  }
}, [cart]); // 👈 importante: solo escucha cart



// ✅ seccion para Guardar para mas tarde
useEffect(() => {
  const fetchSavedItems = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSavedItems(data);
    } catch (err) {
      console.error("❌ Error al obtener productos guardados:", err);
    }
  };

  fetchSavedItems();
}, []);



  // 🔁 Actualizar carrito desde el backend
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
              sizes: Array.isArray(data.sizes)
                ? data.sizes
                : typeof data.sizes === "string"
                ? JSON.parse(data.sizes || "[]")
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

      // ✅ Seleccionar todos los productos al cargar
setSelectedItems((prevSelected) => {
  if (prevSelected.length > 0) return prevSelected;
  return enrichedCart.map(item => `${item.id || item.product_id}-${item.size}`);
});

      refreshCart();
    } catch {
      setCart([]);
      console.error("❌ Error actualizando carrito");
    }
  };

  // ➕ Aumentar cantidad (logueado)
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

  // ➖ Disminuir cantidad (logueado)
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

  // 🗑️ Eliminar producto (logueado)
  const eliminarProducto = async (productId, size) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_URL}/cart/delete/${productId}/${size}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    actualizarCarrito();
  };

  // 💾 Guardar carrito local (invitado)
  const guardarCarritoLocal = (carrito) => {
    localStorage.setItem("guest_cart", JSON.stringify(carrito));
    setCart(carrito);
    refreshCart();
  };

  // ➕➖ Funciones para invitados (aumentar, disminuir, eliminar)
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

  // 🎯 Cambiar talla
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

    // ✅ SELECCIÓN de productos (checkbox por producto)
const toggleItemSelection = (item) => {
  const key = `${item.id || item.product_id}-${item.size}`;
  setSelectedItems((prev) => {
    const updated = prev.includes(key)
      ? prev.filter((k) => k !== key)
      : [...prev, key];
    localStorage.setItem("selected_items", JSON.stringify(updated));
    return updated;
  });
};


  const isSelected = (item) =>
    selectedItems.includes(`${item.id || item.product_id}-${item.size}`);

// ✅ SELECCIONAR TODO con persistencia
const toggleSeleccionarTodo = () => {
  if (selectedItems.length === cart.length) {
    setSelectedItems([]);
    localStorage.setItem("selected_items", JSON.stringify([]));
  } else {
    const allKeys = cart.map(
      (item) => `${item.id || item.product_id}-${item.size}`
    );
    setSelectedItems(allKeys);
    localStorage.setItem("selected_items", JSON.stringify(allKeys));
  }
};

// ✅ Saber si están todos seleccionados
const seleccionarTodoActivo = selectedItems.length === cart.length;


  // ✅ SUBTOTAL dinámico basado en seleccionados
  const calcularSubtotalSeleccionados = () => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => {
      const key = `${item.id || item.product_id}-${item.size}`;
      return selectedItems.includes(key)
        ? total + item.price * item.quantity
        : total;
    }, 0);
  };

  // ✅ COMPARTIR por WhatsApp
  const compartirProducto = (item) => {
    const url = `https://tivana.me/product/${item.id || item.realId || item.product_id}`;
    const mensaje = `¡Mira este producto en Tivana! ${item.title} - ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, "_blank");
  };

// ✅ GUARDAR PARA MÁS TARDE desde carrito (guardado en base de datos)
const guardarParaMasTarde = async (item) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para guardar productos");
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: item.product_id || item.id,
        size: item.size,
      }),
    });

    if (!res.ok) throw new Error("No se pudo guardar");

    // ✅ Eliminar del carrito después de guardar
    await eliminarProducto(item.product_id, item.size);

    // ✅ Refrescar el carrito
    actualizarCarrito();
  } catch (error) {
    console.error("❌ Error al guardar producto para más tarde:", error);
    alert("No se pudo guardar el producto para más tarde.");
  }
};

    return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-12">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 🛒 Panel del carrito */}
        <div className="flex-1 bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Carrito de compras</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : cart.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío.</p>
          ) : (
            <>
              {/* 🔘 Seleccionar todo */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={seleccionarTodoActivo}
                  onChange={toggleSeleccionarTodo}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                {seleccionarTodoActivo ? "Anular selección" : "Seleccionar todo"}
              </label>

              </div>

              <ul className="space-y-6">
                {cart.map((item, index) => (
                  <li key={index} className="flex items-start gap-4 border-b pb-4">
                    {/* ⬜️ Checkbox individual */}
                    <input
                      type="checkbox"
                      checked={isSelected(item)}
                      onChange={() => toggleItemSelection(item)}
                      className="mt-2"
                    />

                    {/* 📸 Imagen */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded cursor-pointer"
                      onClick={() =>
                        navigate(`/product/${item.realId || item.id || item.product_id}`)
                      }
                    />

                    {/* 📋 Info del producto */}
                    <div className="flex-1">
                      <p
                        className="font-semibold text-lg cursor-pointer hover:underline"
                        onClick={() =>
                          navigate(`/product/${item.realId || item.id || item.product_id}`)
                        }
                      >
                        {item.title}
                      </p>
                      <p className="text-gray-600 font-medium">${item.price}</p>

                      {/* 🎯 Tallas */}
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

                      {/* ➕➖ Cantidad + eliminar */}
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

                      {/* 💾 Guardar / 📤 Compartir */}
                      <div className="flex gap-4 mt-3 text-sm">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => guardarParaMasTarde(item)}
                        >
                          Guardar para más tarde
                        </button>
                        <button
                          className="text-green-600 hover:underline"
                          onClick={() => compartirProducto(item)}
                        >
                          Compartir
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

        </div>

        {/* 🧾 Resumen del carrito */}
        {!loading && cart.length > 0 && (
          <div className="md:w-80 bg-white rounded shadow p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen</h3>

            <div className="flex justify-between mb-2">
              <span>Productos seleccionados:</span>
              <span>{selectedItems.length}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>
                $
                {isNaN(calcularSubtotalSeleccionados())
                  ? "0.00"
                  : calcularSubtotalSeleccionados().toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              El envío y los impuestos se calcularán en el checkout.
            </p>

            <button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded"
              onClick={() => {
              const productosSeleccionados = cart.filter(item =>
                selectedItems.includes(`${item.id || item.product_id}-${item.size}`)
              );
              localStorage.setItem("checkout_items", JSON.stringify(productosSeleccionados));
              navigate("/checkout");
            }}

              disabled={selectedItems.length === 0}
            >
              Proceder al pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
