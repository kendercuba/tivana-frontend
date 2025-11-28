// src/pages/admin/AdminPrepararProductos.jsx
import { useState, useEffect } from "react";

export default function AdminPrepararProductos() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [archivos, setArchivos] = useState([]);

  const cargarArchivos = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/preparar/listar`);
      const data = await res.json();
      setArchivos(data);
    } catch (err) {
      console.error("Error cargando archivos:", err);
    }
  };

  useEffect(() => {
    cargarArchivos();
  }, []);

  const ejecutarAccion = async (accion, archivo) => {
    try {
      let url = `${API_URL}/admin/preparar/${accion}?archivo=${archivo}`;
      let method = "GET";
      let body = null;

      if (accion === "insertar") {
        method = "POST";
        url = `${API_URL}/admin/preparar/insertar`;
        body = JSON.stringify({ archivo });
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();
      alert(data.message || data.error);

      cargarArchivos();

    } catch (err) {
      console.error(err);
      alert("Error ejecutando acción");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Preparar Productos</h1>

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
          {archivos.map((a, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{a.archivo}</td>
              <td className="px-4 py-2">{a.total}</td>
              <td className="px-4 py-2">{a.clasificados}</td>
              <td className="px-4 py-2">{a.no_clasificados}</td>

              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => ejecutarAccion("traducir", a.archivo)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Traducir
                </button>

                <button
                  onClick={() => ejecutarAccion("mapear", a.archivo)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                >
                  Mapear
                </button>

                <button
                  onClick={() => ejecutarAccion("insertar", a.archivo)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Insertar
                </button>

                <button
                  onClick={() => ejecutarAccion("ver", a.archivo)}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded"
                >
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
