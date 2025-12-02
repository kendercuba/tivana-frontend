import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold">Tivana Admin</h2>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/admin" className="hover:underline">Panel Administrativo</Link>
          <Link to="/admin/users" className="hover:underline">Usuarios</Link>
          <Link to="/admin/orders" className="hover:underline">Ordenes</Link>
          <Link to="/admin/search-logs" className="hover:underline">Busquedas</Link>
          <Link to="/admin/products" className="hover:underline">Productos</Link>
          <Link to="/admin/categories" className="hover:underline">Categories</Link>
          <Link to="/admin/preparar-productos" className="text-white hover:text-gray-200">Preparar Productos</Link>
          <Link to="/admin/products/import" className="hover:underline text-blue-300">Cargar Productos</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
