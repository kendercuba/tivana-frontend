// src/pages/admin/AdminPrepararProductos.jsx
import { useState, useEffect } from "react";

export default function AdminPrepararProductos() {
  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    // Más adelante: llamar al backend para cargar estado de archivos
    setArchivos([
      {
        nombre: "productos_shein_hogar_cocina.json",
        total: 3128,
        clasificados: 2494,
        sinClasificar: 634
      }
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4"> Preparar Productos</h1>
      <table className="min-w-full bg-white border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Archivo</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Clasificados</th>
            <th className="px-4 py-2">Sin clasificar</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {archivos.map((archivo, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{archivo.nombre}</td>
              <td className="px-4 py-2">{archivo.total}</td>
              <td className="px-4 py-2">{archivo.clasificados}</td>
              <td className="px-4 py-2">{archivo.sinClasificar}</td>
              <td className="px-4 py-2 space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                  Traducir
                </button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded">
                  Mapear
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                  Insertar
                </button>
                <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded">
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
