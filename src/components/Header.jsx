// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Globe } from "lucide-react";
import SearchBar from './SearchBar';
import { useEffect, useState, useContext } from "react";
import { UserContext } from '../context/UserContext';

export default function Header() {
  const context = useContext(UserContext);
  const user = context?.user;
  const logout = context?.logout;
  const cart = context?.cart || [];

  const [ubicacion, setUbicacion] = useState("Venezuela");
  const navigate = useNavigate();
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

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

  return (
    <header className="bg-black shadow-md sticky top-0 z-50 py-2">
      <div className="flex items-center justify-between w-full px-4">
        {/* Logo + Ubicación */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-blue-600">Tivana</Link>
          <span className="text-base text-white hidden sm:inline">{ubicacion}</span>
        </div>

        {/* Barra de búsqueda */}
        <SearchBar />

        {/* Idioma + sesión + carrito */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-white">
            <Globe className="h-4 w-4" />
            ES
          </div>

          {!user ? (
            <div
              className="relative"
              onMouseEnter={() => setMostrarMenu(true)}
              onMouseLeave={() => setMostrarMenu(false)}
            >
              <Link to="/login" className="text-base font-bold text-white hover:underline">
                Iniciar sesión
              </Link>
              {mostrarMenu && (
                <div className="absolute left-0 top-full bg-white text-black rounded shadow-md p-2 z-50 w-32">
                  <Link to="/register" className="block hover:underline">Registrarse</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-white">
              <span className="font-semibold">👤 {user.nombre}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </div>
          )}

          {/* Icono carrito */}
          <div className="relative">
            <Link to="/me/cart">
              <ShoppingCart className="h-5 w-5 text-white hover:text-blue-400 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
