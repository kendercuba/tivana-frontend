// src/hooks/useCart.js
import { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../context/UserContext";

function useCart() {
  const justUpdatedRef = useRef(false);
  const { user, cart, setCart, refreshCart } = useContext(UserContext);
  const [savedItems, setSavedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedKey = user ? `selected_items_${user.id}` : "selected_items";
  const skipRestoreRef = useRef(false);


  
  // 📦 useEffect para cargar carrito (logueado )
useEffect(() => {
  // Solo cargar cuando se sepa si el usuario está autenticado o no
  if (user === null && localStorage.getItem("token")) {
    // Esperar a que se cargue sesión desde UserContext
    return;
  }

  const fetchCart = async () => {
    if (user) {
      // ✅ Usuario logueado
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
          credentials: "include",
        });
        const data = await res.json();
        console.log("🛒 Cart en useCart (logueado):", data);

        const resolvedCart = await Promise.all(
        data.map(async (item) => {
          try {
            // 👇 Ya tenemos el ID real (item.product_id es el ID interno)
            const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${item.product_id}`);
            const product = await res.json();

            if (product?.id) {
              return {
                ...item,
                id: product.id, // ID interno
                title: product.title,
                image: product.image,
                price: product.price,
                sizes: Array.isArray(product.sizes)
                  ? product.sizes
                  : JSON.parse(product.sizes || "[]"),
              };
            }
          } catch (err) {
            console.error("❌ Error al enriquecer producto del carrito:", err);
          }
          return item;
        })
      );

        setCart(resolvedCart);
        // 🟢 Recuperar selección previa sin sobrescribirla

        } catch (err) {
        console.error("❌ Error cargando carrito logueado:", err);
        setError("Error al obtener el carrito");
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
            size: item.size || "", // ← Asegura que siempre tenga alguna talla
          };

          } catch (err) {
            console.error("❌ Error al enriquecer producto invitado:", err);
            return null;
          }
        })
      );

      setCart(enrichedCart.filter(Boolean));
      setLoading(false);
    }
  };

  fetchCart();
}, [user]);


// ✅ useEffect para mantener selección de productos al recargar
useEffect(() => {
  if (cart.length === 0) return;

  if (skipRestoreRef.current || justUpdatedRef.current) {
    console.log("⏩ Restauración omitida (banderas activadas)");
    skipRestoreRef.current = false;
    justUpdatedRef.current = false;
    return;
  }

  const keysEnriched = cart
    .filter(item => item && item.size)
    .map(item => `${item.id || item.product_id}-${item.size}`);

  const savedSelection = JSON.parse(localStorage.getItem(selectedKey) || "[]");
  const valid = savedSelection.filter(k => keysEnriched.includes(k));
  setSelectedItems(valid);
}, [cart, selectedKey]);



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
            credentials: 'include',
          });
          const data = await res.json();

          if (!data?.id || !item.size || !item.quantity) return null;

          return {
            ...item,
            id: data.id,
            title: data.title,
            image: data.image,
            price: data.price,
            size: item.size || '',
            quantity: item.quantity || 1,
            sizes: Array.isArray(data.sizes)
              ? data.sizes
              : typeof data.sizes === "string"
              ? JSON.parse(data.sizes || "[]")
              : [],
          };
        } catch (err) {
          console.error("❌ Error enriqueciendo producto:", err);
          return null;
        }
      })
    );

    const validCart = enrichedCart.filter(Boolean);

    // 🛡️ Establecer primero las banderas para evitar que el siguiente useEffect borre la selección
    skipRestoreRef.current = true;
    justUpdatedRef.current = true;

    setCart(validCart); // ← Solo ahora se actualiza el carrito, después de activar las flags

    // ⚙️ Refrescar carrito general si es necesario
    await new Promise(resolve => setTimeout(resolve, 10));
    refreshCart();

  } catch (err) {
    console.error("❌ Error actualizando carrito:", err);
    setCart([]);
  }
};

const aumentarCantidad = async (productId, size) => {
  const key = `${productId}-${size}`;

  setSelectedItems((prev) => {
    const nuevaSeleccion = prev.includes(key) ? prev : [...prev, key];
    localStorage.setItem(selectedKey, JSON.stringify(nuevaSeleccion));
    return nuevaSeleccion;
  });

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_id: productId, size, action: "increment" }),
    });

    if (!res.ok) throw new Error("Error al actualizar cantidad");

    // ✅ Actualización local sin parpadeo
    setCart(prevCart =>
      prevCart.map(item =>
        item.product_id === productId && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } catch (err) {
    console.error("❌ Error al aumentar cantidad:", err);
  }
};



const disminuirCantidad = async (productId, size) => {
  const key = `${productId}-${size}`;

  setSelectedItems((prev) => {
    const nuevaSeleccion = prev.includes(key) ? prev : [...prev, key];
    localStorage.setItem(selectedKey, JSON.stringify(nuevaSeleccion));
    return nuevaSeleccion;
  });

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_id: productId, size, action: "decrement" }),
    });

    if (!res.ok) throw new Error("Error al actualizar cantidad");

    // ✅ Actualización local sin parpadeo
    setCart(prevCart =>
      prevCart.map(item =>
        item.product_id === productId && item.size === size && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  } catch (err) {
    console.error("❌ Error al disminuir cantidad:", err);
  }
};


const eliminarProducto = async (productId, size) => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/cart/delete/${productId}/${size}`, {
      method: "DELETE",
      credentials: 'include',
    });

    skipRestoreRef.current = true; // ✅ evita que se pierda la selección al recargar
    await actualizarCarrito();
  } catch {
    console.error("❌ Error al eliminar producto del carrito");
  }
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

 
  // ✅ Funciones de selección
  const toggleItemSelection = (productId, size) => {
    const key = `${productId}-${size}`;
    const yaSeleccionado = selectedItems.includes(key);
    const actualizada = yaSeleccionado
      ? selectedItems.filter((k) => k !== key)
      : [...selectedItems, key];

    setSelectedItems(actualizada);
    localStorage.setItem(selectedKey, JSON.stringify(actualizada));
  };

  const toggleSeleccionarTodo = () => {
  const todas = cart
    .filter(item => item && item.size)
    .map(item => `${item.id || item.product_id}-${item.size}`);

  const todasSeleccionadas = todas.length > 0 && todas.every(key => selectedItems.includes(key));

  const nuevaSeleccion = todasSeleccionadas ? [] : todas;
  setSelectedItems(nuevaSeleccion);
  localStorage.setItem(selectedKey, JSON.stringify(nuevaSeleccion));
};



  const isSelected = (productId, size) =>
  selectedItems.includes(`${productId}-${size || ''}`);

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
      localStorage.setItem(selectedKey, JSON.stringify(actualizada));
      refreshCart();
    } catch (error) {
      console.error("❌ Error al guardar para más tarde", error);
    }
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
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    aumentarCantidadInvitado,
    disminuirCantidadInvitado,
    eliminarProductoInvitado,
  };
}

export default useCart;
