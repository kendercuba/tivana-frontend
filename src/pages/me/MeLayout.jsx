// src/pages/me/MeLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function MeLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Menú lateral */}
      <aside className="w-60 bg-gray-100 p-4 space-y-4 border-r">
        <h2 className="text-xl font-bold mb-2">Mi cuenta</h2>
        <nav className="space-y-2">
          <NavLink to="/me/profile" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'text-gray-700'}>Perfil</NavLink>
          <NavLink to="/me/addresses" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'text-gray-700'}>Direcciones</NavLink>
          <NavLink to="/me/payments" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'text-gray-700'}>Pagos</NavLink>
          <NavLink to="/me/orders" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'text-gray-700'}>Pedidos</NavLink>
          <NavLink to="/me/archived-orders" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'text-gray-700'}>Pedidos archivados</NavLink>
          <NavLink to="/me/messages" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'text-gray-700'}>Mensajes</NavLink>
          <NavLink to="/me/support" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'text-gray-700'}>Servicio al cliente</NavLink>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
