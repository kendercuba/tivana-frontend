// src/hooks/useCart.js
import { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../context/UserContext";

function useCart() {
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

const savedSelection = JSON.parse(localStorage.getItem(selectedKey) || "[]");
setSelectedItems(savedSelection);


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

  const keysEnriched = cart
    .filter(item => item && item.size)
    .map(item => `${item.id || item.product_id}-${item.size}`);

  const savedSelection = JSON.parse(localStorage.getItem(selectedKey) || "[]");

  // 🔒 Restaurar solo si selectedItems NO coincide con lo que hay en localStorage
  setSelectedItems((prev) => {
    const prevSet = new Set(prev);
    const savedSet = new Set(savedSelection.filter(k => keysEnriched.includes(k)));

    const iguales = prevSet.size === savedSet.size && [...prevSet].every(v => savedSet.has(v));
    if (iguales) return prev; // no tocar si ya están iguales
    return [...savedSet];
  });
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

// ✅ Restaurar selección *después* de setCart con nuevas claves
const keysEnriched = enrichedCart
  .filter(item => item && item.size)
  .map(item => `${item.id || item.product_id}-${item.size}`);

// 🟡 Restaurar desde localStorage SOLO si selectedItems está vacío
const saved = JSON.parse(localStorage.getItem(selectedKey) || "[]");
const valid = saved.filter(k => keysEnriched.includes(k));
setSelectedItems(valid);


    refreshCart();

  } catch {
    setCart([]);
    console.error("❌ Error actualizando carrito");
  }
};

  // ➕ Funciones para logueado
  const aumentarCantidad = async (productId, size) => {
  skipRestoreRef.current = true;
  setCart((prev) =>
    prev.map((item) =>
      item.product_id === productId && item.size === size
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );

  const key = `${productId}-${size}`;
  setSelectedItems((prev) => {
  const nuevaSeleccion = prev.includes(key) ? prev : [...prev, key];
  localStorage.setItem(selectedKey, JSON.stringify(nuevaSeleccion)); // guardamos ANTES
  return nuevaSeleccion;
});


  try {
    await fetch(`${import.meta.env.VITE_API_URL}/cart/update`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, size, action: "increment" }),
    });
    await actualizarCarrito(); // usamos la versión que respeta `selectedItems`
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

  // ✅ Asegurar que el producto sigue seleccionado
  const key = `${productId}-${size}`;
  setSelectedItems((prev) => {
    const nuevaSeleccion = prev.includes(key) ? prev : [...prev, key];
    localStorage.setItem(selectedKey, JSON.stringify(nuevaSeleccion));
    return nuevaSeleccion;
  });

  try {
    await fetch(`${import.meta.env.VITE_API_URL}/cart/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_id: productId, size, action: "decrement" }),
    });
    await actualizarCarrito(); // ✅ esta versión respeta la selección
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
