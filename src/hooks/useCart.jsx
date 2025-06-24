// src/hooks/useCart.js
import { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../context/UserContext";

function useCart() {
  const { user, refreshCart } = useContext(UserContext);
  const [cart, setCart] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initialized = useRef(false);

  // 📦 useEffect para cargar carrito (logueado o invitado)
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
     // ✅ 🧑‍💻 MODO USUARIO LOGUEADO
try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
    credentials: "include",
  });
  const data = await res.json();
  console.log("🛒 Cart en useCart:", data); // 👈 AÑADE ESTO

  const resolvedCart = await Promise.all(
  data.map(async (item) => {
    try {
      const res = await fetch( `${import.meta.env.VITE_API_URL}/products/resolver-id/${item.product_id}`)
      const resolved = await res.json();

      if (resolved?.id) {
        return {
          ...item,
          product_id: item.product_id,
          id: resolved.id,
          title: resolved.title,
          image: resolved.image,
          price: resolved.price,
          sizes: Array.isArray(resolved.sizes)
            ? resolved.sizes
            : JSON.parse(resolved.sizes || "[]"),
        };
      }
    } catch (err) {
      console.error("❌ Error resolviendo ID:", item.product_id);
    }
    return item;
  })
);

  setCart(resolvedCart);
} catch {
  setError("❌ Error al obtener el carrito");
  setCart([]);
} finally {
  setLoading(false);
}

      } else {
       // 🧑‍💻 Invitado
const localCart = localStorage.getItem("guest_cart");
const parsed = localCart ? JSON.parse(localCart) : [];

const enrichedCart = await Promise.all(
  parsed.map(async (item) => {
    try {
      // Ya que item.id es el ID real de PostgreSQL, usamos directamente la ruta normal
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${item.id}`);
      const data = await res.json();

      const sizes = Array.isArray(data.sizes)
        ? data.sizes
        : JSON.parse(data.sizes || "[]");

      return {
        ...item,
        sizes,
        title: data.title,
        image: data.image,
        price: data.price,
        id: data.id,
        realId: data.id,
      };
    } catch (err) {
      console.error("❌ Error al enriquecer producto invitado:", err);
      return null;
    }
  })
);

        setCart(enrichedCart.filter(Boolean));
        setLoading(false); // ✅ Agrega esta línea aquí
      }
    };

    
    fetchCart();
  }, []);

  // ✅ useEffect para mantener selección de productos al recargar
  useEffect(() => {
    if (cart.length > 0 && !initialized.current) {
      const savedSelection = localStorage.getItem("selected_items");

      const keysEnriched = cart
        .filter(item => item && item.size)
        .map(item => `${item.id || item.product_id}-${item.size}`);

      if (savedSelection !== null) {
        try {
          const parsed = JSON.parse(savedSelection);
          const validKeys = parsed.filter(k => keysEnriched.includes(k));
          setSelectedItems(validKeys);
        } catch {
          setSelectedItems([]);
          localStorage.setItem("selected_items", JSON.stringify([]));
        }
      } else {
        setSelectedItems(keysEnriched);
        localStorage.setItem("selected_items", JSON.stringify(keysEnriched));
      }

      initialized.current = true;
    }
  }, [cart]);

  // ✅ Cargar productos guardados (solo logueado)
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/saved`, {
          credentials: 'include',
        });
        const data = await res.json();
        setSavedItems(data);
      } catch (err) {
        console.error("❌ Error al obtener productos guardados:", err);
      }
    };

    fetchSavedItems();
  }, [user]);

  // 🔄 Actualizar carrito logueado
  const actualizarCarrito = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        credentials: 'include',
      });
      const data = await res.json();

      const enrichedCart = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (item) => {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/products/resolver-id/${item.product_id}`, {
            credentials: 'include'
          });
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
      refreshCart();
    } catch {
      setCart([]);
      console.error("❌ Error actualizando carrito");
    }
  };

  // ➕ Funciones para logueado
  const aumentarCantidad = async (productId, size) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/cart/update`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
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
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/cart/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId, size, action: "decrement" }),
      });
      refreshCart();
    } catch {
      console.error("❌ Error al disminuir cantidad");
    }
  };

  const eliminarProducto = async (productId, size) => {
    await fetch(`${import.meta.env.VITE_API_URL}/cart/delete/${productId}/${size}`, {
      method: "DELETE",
      credentials: 'include',
    });
    actualizarCarrito();
  };

  // ➕➖ Funciones para invitados
  const guardarCarritoLocal = (carrito) => {
    if (carrito.length === 0) {
      localStorage.removeItem("guest_cart");
    } else {
      localStorage.setItem("guest_cart", JSON.stringify(carrito));
    }
    setCart(carrito);
    refreshCart();
  };

  const aumentarCantidadInvitado = (productId, size) => {
    const actualizado = cart.map((item) =>
      item.id === productId && item.size === size
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    guardarCarritoLocal(actualizado);
  };

  const disminuirCantidadInvitado = (productId, size) => {
    const actualizado = cart.map((item) =>
      item.id === productId && item.size === size && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    guardarCarritoLocal(actualizado);
  };

  const eliminarProductoInvitado = (productId, size) => {
    const nuevoCarrito = cart.filter(
      (item) => !(item.id === productId && item.size === size)
    );
    setCart(nuevoCarrito);
    guardarCarritoLocal(nuevoCarrito);
  };

  // 🎯 Cambiar talla
  const cambiarTalla = async (item, newSize) => {
    if (user) {
      await fetch(`${import.meta.env.VITE_API_URL}/cart/update-size`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
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

  // ✅ Funciones de selección
  const toggleItemSelection = (productId, size) => {
    const key = `${productId}-${size}`;
    const yaSeleccionado = selectedItems.includes(key);
    const actualizada = yaSeleccionado
      ? selectedItems.filter((k) => k !== key)
      : [...selectedItems, key];

    setSelectedItems(actualizada);
    localStorage.setItem("selected_items", JSON.stringify(actualizada));
  };

  const toggleSeleccionarTodo = () => {
    const todas = cart.map((item) => `${item.id || item.product_id}-${item.size}`);
    if (selectedItems.length === todas.length) {
      setSelectedItems([]);
      localStorage.setItem("selected_items", JSON.stringify([]));
    } else {
      setSelectedItems(todas);
      localStorage.setItem("selected_items", JSON.stringify(todas));
    }
  };

  const isSelected = (productId, size) =>
    selectedItems.includes(`${productId}-${size}`);

  const calcularSubtotalSeleccionados = () => {
    return cart.reduce((total, item) => {
      const key = `${item.id || item.product_id}-${item.size}`;
      if (selectedItems.includes(key)) {
        return total + item.price * item.quantity;
      }
      return total;
    }, 0);
  };

  const compartirProducto = () => {
    const seleccionados = cart.filter((item) =>
      selectedItems.includes(`${item.id || item.product_id}-${item.size}`)
    );

    if (seleccionados.length === 0) return;

    const mensaje = seleccionados
      .map(
        (item) =>
          `🛒 ${item.title} - Talla ${item.size} - Cantidad: ${item.quantity}`
      )
      .join("\n");

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const guardarParaMasTarde = async (item) => {
    if (!user) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/saved`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(item),
      });

      const key = `${item.id || item.product_id}-${item.size}`;
      const actualizada = selectedItems.filter((k) => k !== key);
      setSelectedItems(actualizada);
      localStorage.setItem("selected_items", JSON.stringify(actualizada));
      refreshCart();
    } catch (error) {
      console.error("❌ Error al guardar para más tarde", error);
    }
  };

  const ToggleSeleccionarTodo = () => {
    const todas = cart.map((item) => `${item.id || item.product_id}-${item.size}`);
    setSelectedItems(todas);
    localStorage.setItem("selected_items", JSON.stringify(todas));
  };

  return {
    cart,
    savedItems,
    loading,
    error,
    isSelected,
    toggleItemSelection,
    toggleSeleccionarTodo,
    calcularSubtotalSeleccionados,
    compartirProducto,
    guardarParaMasTarde,
    ToggleSeleccionarTodo,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    aumentarCantidadInvitado,
    disminuirCantidadInvitado,
    eliminarProductoInvitado,
    cambiarTalla,
  };
}

export default useCart;
