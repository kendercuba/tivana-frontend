import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Cargar datos del usuario y del carrito al iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    refreshCart(); // Cargar el carrito automáticamente
  }, []);

  // 🔄 Refrescar el carrito
  const refreshCart = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCart(data);
      } catch (err) {
        console.error('❌ Error cargando carrito:', err);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      setCart(localCart);
    }
  };

  // Iniciar sesión y cargar el usuario
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    refreshCart();
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    refreshCart(); // Volver a cargar carrito como invitado
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading, cart, refreshCart }}>
      {children}
    </UserContext.Provider>
  );
}
