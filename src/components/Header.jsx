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
  const menuRef = useRef(null);

  const totalItems = Array.isArray(cart)
  ? cart.reduce((acc, item) => acc + item.quantity, 0)
  : 0;
 

  // Detectar ubicación del usuario por IP
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

  // Cerrar sesión
  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMostrarMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


if (loading || !cart) return null;

  return (
    <header className="bg-black shadow-md sticky top-0 z-50 py-2">
      <div className="flex items-center justify-between w-full px-4">

        {/* Logo + Ubicación */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 px-3 py-1 rounded-full hover:bg-blue-800 hover:text-white transition duration-200"
          >
            Tivana
          </Link>
          <span className="text-base text-white hidden sm:inline">{ubicacion}</span>
        </div>

        {/* Barra de búsqueda */}
        <SearchBar />

        {/* Idioma + sesión + carrito */}
        <div className="flex items-center gap-4 text-sm relative">

          {/* Idioma */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-white hover:bg-blue-800 cursor-pointer transition">
            <Globe className="h-4 w-4" />
            ES
          </div>


          {/* Sesión */}
                    {!user ? (
            <div className="relative" ref={menuRef}>
              {/* Botón de invitado tipo Walmart */}
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-blue-800 transition duration-200 cursor-pointer"
                onClick={() => setMostrarMenu((prev) => !prev)} // ✅ Activar menú por clic
              >
                {/* Icono de usuario */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
                </svg>
                <span className="text-sm font-semibold text-white">
                  Iniciar sesión
                </span>
                {/* Flecha (viñeta) */}
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Menú emergente (igual que Amazon) */}
              {mostrarMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white text-black border rounded shadow-lg z-50">
                  <div className="p-3 border-b">
                    <Link
                      to="/login"
                      className="block bg-yellow-400 text-center text-black font-semibold py-2 rounded hover:bg-yellow-300"
                      onClick={() => setMostrarMenu(false)}
                    >
                      Iniciar sesión
                    </Link>
                    <p className="text-xs text-center mt-2">
                      ¿Eres nuevo?{" "}
                      <Link
                        to="/register"
                        className="text-blue-600 hover:underline"
                        onClick={() => setMostrarMenu(false)}
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">Tus listas</h4>
                      <ul>
                        <li className="hover:underline cursor-pointer">Lista de deseos</li>
                        <li className="hover:underline cursor-pointer">Favoritos</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Tu cuenta</h4>
                      <ul>
                        <li className="hover:underline cursor-pointer">Pedidos</li>
                        <li className="hover:underline cursor-pointer">Soporte</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

                      ) : (
            <div className="relative" ref={menuRef}>
              {/* Botón clickeable estilo Walmart */}
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-blue-800 transition duration-200 cursor-pointer"
                onClick={() => setMostrarMenu(prev => !prev)} // ✅ Toggle al hacer clic
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
                </svg>
                <span className="text-sm font-semibold text-white">
                  Hola, {user.nombre?.toLowerCase()}
                </span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Menú emergente estable */}
              {mostrarMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white text-black border rounded shadow-lg z-50 w-[320px]">
                  <div className="p-4 border-b">
                    <p className="text-sm mb-2">¿Quién está usando la cuenta?</p>
                    <Link
                      to="/account/profile"
                      className="text-sm text-blue-600 hover:underline font-medium"
                      onClick={() => setMostrarMenu(false)}
                    >
                      Administrar perfil
                    </Link>
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
                          <button
                            onClick={() => {
                              handleLogout();
                              setMostrarMenu(false);
                            }}
                            className="w-full text-left text-red-600 hover:underline"
                          >
                            Cerrar sesión
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>



          )}

          {/* Icono carrito */}
          <div className="relative">
            <Link
              to="/cart"
              className="flex items-center px-3 py-1 rounded-full hover:bg-blue-800 transition relative"
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              {!loading && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
