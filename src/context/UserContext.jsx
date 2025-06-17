// src/context/UserContext.jsx
import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // ✅ Al iniciar, intenta validar el token si existe
  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('❌ Token vencido o incorrecto');
          return res.json();
        })
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            setUser(null);
            setToken('');
            localStorage.removeItem('token');
          }
        })
        .catch((err) => {
          console.warn('⚠️ Error validando token:', err.message);
          setUser(null);
          setToken('');
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }

    refreshCart();
  }, [token]);

  // 🔄 Refrescar el carrito
  const refreshCart = async () => {
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

  // ✅ Login
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('token', token);
    refreshCart();
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    refreshCart();
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, loading, cart, refreshCart }}>
      {children}
    </UserContext.Provider>
  );
}
