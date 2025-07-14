// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Globe } from "lucide-react";
import SearchBar from './SearchBar';
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from '../context/UserContext';

export default function Header() {
  const { user, logout, cart, loading } = useContext(UserContext);
  const [ubicacion, setUbicacion] = useState("Venezuela");
  const navigate = useNavigate();
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarMenuMovil, setMostrarMenuMovil] = useState(false);
  const menuRef = useRef(null);

  const totalItems = Array.isArray(cart)
    ? cart.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const ciudad = data.city;
        const pais = data.country_name;
        setUbicacion(`${ciudad}, ${pais}`);
      })
      .catch(() => setUbicacion("Venezuela"));
  }, []);

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMostrarMenu(false);
        setMostrarMenuMovil(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !cart) return null;

  return (
    <header className="bg-black shadow-md sticky top-0 z-50 w-full  border-blue-500">
   <div className="w-full px-4 py-2 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-y-4 border-4 border-purple-500">

  {/* 🔵 Logo + Ubicación */}
  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
    <Link
      to="/"
      className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 px-4 py-2 rounded-full hover:bg-blue-800 hover:text-white transition duration-200"
    >
      Tivana
    </Link>
    <span className="text-base text-white hidden sm:inline-block">{ubicacion}</span>
  </div>

  {/* 🔎 Barra de búsqueda */}
  <div className="hidden sm:flex justify-center">
    <div className="w-full max-w-[600px] md:max-w-[800px] lg:max-w-[1100px] px-2">
      <SearchBar />
    </div>
  </div>

  {/* 🔴 Menú derecho */}
  <div className="hidden sm:flex items-center gap-4 text-sm relative">
    {/* 🌍 Idioma */}
    <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full text-white hover:bg-blue-800 cursor-pointer transition">
      <Globe className="h-4 w-4" /> ES
    </div>

    {/* 👤 Sesión */}
    {user ? (
      <UserDropdown user={user} handleLogout={handleLogout} menuRef={menuRef} mostrarMenu={mostrarMenu} setMostrarMenu={setMostrarMenu} />
    ) : (
      <GuestDropdown menuRef={menuRef} mostrarMenu={mostrarMenu} setMostrarMenu={setMostrarMenu} />
    )}

    {/* 🛒 Carrito */}
    <div className="relative">
      <Link to="/cart" className="flex items-center px-3 py-1 rounded-full hover:bg-blue-800 transition relative">
        <ShoppingCart className="h-5 w-5 text-white" />
        {!loading && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Link>
    </div>
  </div>


        {/* 📱 Menú hamburguesa móvil */}
        <div className="flex sm:hidden ml-auto">
          <button
            onClick={() => setMostrarMenuMovil((prev) => !prev)}
            className="text-white px-3 py-1 rounded-full hover:bg-blue-800 transition"
          >
            ☰
          </button>

          {mostrarMenuMovil && (
            <div className="absolute top-full right-4 mt-2 bg-white text-black border rounded shadow-lg z-50 w-[240px] p-4 space-y-2">
              {!user ? (
                <>
                  <Link to="/login" className="block py-2 border-b hover:underline">Iniciar sesión</Link>
                  <Link to="/register" className="block py-2 border-b hover:underline">Registrarse</Link>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold mb-2">Hola, {user.nombre?.toLowerCase()}</p>
                  <Link to="/account/profile" className="block py-2 border-b hover:underline">Perfil</Link>
                  <Link to="/account/pedidos" className="block py-2 border-b hover:underline">Pedidos</Link>
                  <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 hover:underline">Cerrar sesión</button>
                </>
              )}
              <Link to="/cart" className="block py-2 hover:underline">Carrito ({totalItems})</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function GuestDropdown({ menuRef, mostrarMenu, setMostrarMenu }) {
  return (
    <div className="relative" ref={menuRef}>
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-blue-800 transition duration-200 cursor-pointer"
        onClick={() => setMostrarMenu((prev) => !prev)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
        </svg>
        <span className="text-sm font-semibold text-white">Iniciar sesión</span>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {mostrarMenu && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white text-black border rounded shadow-lg z-50">
          <div className="p-3 border-b">
            <Link to="/login" className="block bg-yellow-400 text-center text-black font-semibold py-2 rounded hover:bg-yellow-300" onClick={() => setMostrarMenu(false)}>Iniciar sesión</Link>
            <p className="text-xs text-center mt-2">¿Eres nuevo? <Link to="/register" className="text-blue-600 hover:underline" onClick={() => setMostrarMenu(false)}>Regístrate aquí</Link></p>
          </div>
        </div>
      )}
    </div>
  );
}

function UserDropdown({ user, handleLogout, menuRef, mostrarMenu, setMostrarMenu }) {
  return (
    <div className="relative" ref={menuRef}>
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-blue-800 transition duration-200 cursor-pointer"
        onClick={() => setMostrarMenu((prev) => !prev)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
        </svg>
        <span className="text-sm font-semibold text-white">Hola, {user.nombre?.toLowerCase()}</span>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {mostrarMenu && (
        <div className="absolute top-full right-0 mt-2 bg-white text-black border rounded shadow-lg z-50 w-[320px]">
          <div className="p-4 border-b">
            <p className="text-sm mb-2">¿Quién está usando la cuenta?</p>
            <Link to="/account/profile" className="text-sm text-blue-600 hover:underline font-medium" onClick={() => setMostrarMenu(false)}>Administrar perfil</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Tus listas</h4>
              <ul className="space-y-1">
                <li><Link to="/account/wishlist" onClick={() => setMostrarMenu(false)} className="hover:underline block">Lista de deseos</Link></li>
                <li><Link to="/account/favoritos" onClick={() => setMostrarMenu(false)} className="hover:underline block">Favoritos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tu cuenta</h4>
              <ul className="space-y-1">
                <li><Link to="/account/profile" onClick={() => setMostrarMenu(false)} className="hover:underline block">Perfil</Link></li>
                <li><Link to="/account/pedidos" onClick={() => setMostrarMenu(false)} className="hover:underline block">Pedidos</Link></li>
                <li><Link to="/account/carrito" onClick={() => setMostrarMenu(false)} className="hover:underline block">Carrito</Link></li>
                <li><Link to="/account/seguridad" onClick={() => setMostrarMenu(false)} className="hover:underline block">Seguridad</Link></li>
                <li><Link to="/account/soporte" onClick={() => setMostrarMenu(false)} className="hover:underline block">Soporte</Link></li>
                <li>
                  <button onClick={() => { handleLogout(); setMostrarMenu(false); }} className="w-full text-left text-red-600 hover:underline">Cerrar sesión</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
