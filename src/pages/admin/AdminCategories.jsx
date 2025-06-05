// src/pages/admin/AdminCategorias.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminCategorias() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/categorias`)
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("Error loading categories:", err));

    fetch(`${import.meta.env.VITE_API_URL}/admin/subcategorias`)
      .then((res) => res.json())
      .then(setSubcategories)
      .catch((err) => console.error("Error loading subcategories:", err));
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>
      <table className="w-full border mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Nombre</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="border px-2 py-1">{cat.id}</td>
              <td className="border px-2 py-1">{cat.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mb-2">Subcategorías</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Categoría</th>
          </tr>
        </thead>
        <tbody>
          {subcategories.map((sub) => (
            <tr key={sub.id}>
              <td className="border px-2 py-1">{sub.id}</td>
              <td className="border px-2 py-1">{sub.name}</td>
              <td className="border px-2 py-1">{sub.category_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
