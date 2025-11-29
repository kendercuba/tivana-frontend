import { useEffect, useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function AdminCategoryTree() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [activeItem, setActiveItem] = useState({ type: null, id: null });

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: null,
    id: null,
    parentId: null,
    title: "",
    value: "",
  });

 // 🔄 Reload data
const reloadData = async () => {
  const [catsRes, subsRes, subsubRes] = await Promise.all([
    fetch(`${API_URL}/admin/categories/with-count`, { credentials: "include" }),
    fetch(`${API_URL}/admin/subcategories/with-count`, { credentials: "include" }),
    fetch(`${API_URL}/admin/subsubcategories/with-count`, { credentials: "include" }),
  ]);

  const cats = await catsRes.json();
  const subs = await subsRes.json();
  const subsubs = await subsubRes.json();

  // 🔥 ENSAMBLAR ESTRUCTURA JERÁRQUICA
  cats.forEach(cat => {
    // Subcategorías que pertenecen a la categoría
    cat.subcategories = subs.filter(s => s.category_id === cat.id);

    // 🔥 Número de subcategorías dentro de la categoría
    cat.total_items = Number(cat.total_items);

    cat.subcategories.forEach(sub => {
      // Sub-subcategorías dentro de esta subcategoría
      sub.subsubcategories = subsubs.filter(ss => ss.subcategory_id === sub.id);

      // 🔥 Número de sub-subcategorías dentro de esta subcategoría
      sub.total_items = Number(sub.total_items);

      sub.subsubcategories.forEach(ss => {
        // 🔥 Número de productos dentro de esta sub-subcategoría
        ss.total_items = Number(ss.total_items);
      });
    });
  });

  setCategories(cats);
};


  useEffect(() => {
    reloadData();
  }, []);

  // 🔽 Toggle category
  const toggleCategory = async (categoryId) => {
    const isOpen = expandedCategories[categoryId];
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !isOpen,
    }));

    if (!isOpen) {
      const res = await fetch(`${API_URL}/admin/subcategories`);
      const allSub = await res.json();

      const updated = categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: allSub.filter((s) => s.category_id === cat.id),
            }
          : cat
      );

      setCategories(updated);
    }
  };

  // 🔽 Toggle subcategory
  const toggleSubcategory = async (categoryId, subcategoryId) => {
    const isOpen = expandedSubcategories[subcategoryId];

    setExpandedSubcategories((prev) => ({
      ...prev,
      [subcategoryId]: !isOpen,
    }));

    if (!isOpen) {
      const res = await fetch(`${API_URL}/admin/subsubcategories`);
      const allSubSub = await res.json();

      const updated = categories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        return {
          ...cat,
          subcategories: cat.subcategories.map((sub) =>
            sub.id === subcategoryId
              ? {
                  ...sub,
                  subsubcategories: allSubSub.filter(
                    (ss) => ss.subcategory_id === sub.id
                  ),
                }
              : sub
          ),
        };
      });

      setCategories(updated);
    }
  };

  // 🟦 MODALES
  const openModalRename = (type, id, oldName) => {
    setModal({
      open: true,
      type,
      id,
      parentId: null,
      title: `Editar ${type}`,
      value: oldName,
    });
  };

  const openModalAdd = (type, parentId) => {
    setModal({
      open: true,
      type,
      id: null,
      parentId,
      title:
        type === "subcategory"
          ? "Nueva Subcategoría"
          : "Nueva Sub-Subcategoría",
      value: "",
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      id: null,
      parentId: null,
      title: "",
      value: "",
    });
  };

  // 💾 SAVE MODAL
  const saveModal = async () => {
    if (!modal.value.trim()) return;

    const endpoints = {
      category: "admin/categories",
      subcategory: "admin/subcategories",
      subsubcategories: "admin/subsubcategories",
    };

    let body = {};

    // EDIT
    if (modal.id) {
      body =
        modal.type === "subsubcategories"
          ? { subsub_name: modal.value }
          : { name: modal.value };

      await fetch(`${API_URL}/${endpoints[modal.type]}/${modal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    // ADD
    else {
      if (modal.type === "category") {
        body = { name: modal.value };
      }

      if (modal.type === "subcategory") {
        body = {
          name: modal.value,
          category_id: modal.parentId,
        };
      }

      if (modal.type === "subsubcategories") {
  body = {
    name: modal.value,
    subcategory_id: modal.parentId,
  };
}


      await fetch(`${API_URL}/${endpoints[modal.type]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    closeModal();
    reloadData();
  };

  // 🗑 DELETE
  const handleDelete = async (type, id) => {
    if (!confirm("¿Seguro que deseas eliminar?")) return;

    const endpoints = {
      category: "admin/categories",
      subcategory: "admin/subcategories",
      subsubcategories: "admin/subsubcategories",
    };

    await fetch(`${API_URL}/${endpoints[type]}/${id}`, {
      method: "DELETE",
    });

    reloadData();
  };

  // 🔼 MOVER
  const handleMove = async (type, id, direction) => {
    const endpoints = {
      category: "admin/categories",
      subcategory: "admin/subcategories",
      subsubcategories: "admin/subsubcategories",
    };

    await fetch(`${API_URL}/${endpoints[type]}/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });

    reloadData();
  };

  // 🔍 SEARCH
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
  <h1 className="text-xl font-bold">Categorías</h1>

  <div className="flex items-center gap-2">
    <button
      onClick={() =>
        setModal({
          open: true,
          type: "category",
          id: null,
          parentId: null,
          title: "Nueva Categoría",
          value: "",
        })
      }
      className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
    >
      <PlusIcon className="h-4" /> Agregar Categoría
    </button>

    <button
      onClick={async () => {
        try {
          console.log("👉 Ordenando categorías...");

          const response = await fetch(`${API_URL}/admin/sort/all`, {
            method: "POST",
            credentials: "include",
          });

          const data = await response.json();
          console.log("Respuesta del backend:", data);

          setTimeout(() => {
          reloadData();
          alert("Categorías ordenadas A-Z correctamente");
        }, 300);

        } catch (error) {
          console.error("❌ Error al ordenar desde el frontend:", error);
        }
      }}
      className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 text-sm"
    >
      Ordenar A-Z
    </button>
  </div>
</div>


      {/* SEARCH */}
      <div className="relative mb-3">
        <MagnifyingGlassIcon className="h-4 absolute left-3 top-2 text-gray-400" />
        <input
          type="text"
          className="w-full border pl-8 pr-3 py-1.5 rounded text-sm"
          placeholder="Buscar categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CATEGORY LIST */}
      <div className="space-y-1">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="border rounded bg-white p-2 group">
            <div className="flex items-center gap-2">

              <button
                onClick={() => toggleCategory(cat.id)}
                className="mr-2 text-gray-600 hover:text-gray-900"
              >
                {expandedCategories[cat.id] ? (
                  <ChevronDownIcon className="h-4" />
                ) : (
                  <ChevronRightIcon className="h-4" />
                )}
              </button>

              <span className="font-semibold flex-1">
              {cat.name} ({cat.total_items})    
            </span>


              <div className="opacity-0 group-hover:opacity-100 transition flex gap-2 text-xs">
                <PencilIcon
                  onClick={() =>
                    openModalRename("category", cat.id, cat.name)
                  }
                  className="h-4 text-blue-600 cursor-pointer"
                />
                <TrashIcon
                  onClick={() => handleDelete("category", cat.id)}
                  className="h-4 text-red-600 cursor-pointer"
                />
                
                <PlusIcon
                  onClick={() => openModalAdd("subcategory", cat.id)}
                  className="h-4 text-green-700 cursor-pointer"
                />
              </div>
            </div>

            {/* SUBCATEGORIES */}
            {expandedCategories[cat.id] && (
              <div className="ml-6 border-l pl-3 mt-1 space-y-1">
                {cat.subcategories?.map((sub) => (
                  <div key={sub.id} className="flex flex-col group">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleSubcategory(cat.id, sub.id)}
                        className="mr-2 text-gray-600 hover:text-gray-900"
                      >
                        {expandedSubcategories[sub.id] ? (
                          <ChevronDownIcon className="h-4" />
                        ) : (
                          <ChevronRightIcon className="h-4" />
                        )}
                      </button>

                      <span className="flex-1 text-sm text-gray-700">
                        {sub.name} ({sub.total_items})                        
                      </span>


                      <div className="opacity-0 group-hover:opacity-100 transition flex gap-2 text-xs">
                        <PencilIcon
                          onClick={() =>
                            openModalRename(
                              "subcategory",
                              sub.id,
                              sub.name
                            )
                          }
                          className="h-4 text-blue-600 cursor-pointer"
                        />
                        <TrashIcon
                          onClick={() =>
                            handleDelete("subcategory", sub.id)
                          }
                          className="h-4 text-red-600 cursor-pointer"
                        />
                        
                        <PlusIcon
                          onClick={() =>
                            openModalAdd("subsubcategories", sub.id)
                          }
                          className="h-4 text-green-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* SUBSUBCATEGORIES **/}
                    {expandedSubcategories[sub.id] && (
                      <div className="ml-6 border-l pl-3 mt-1 space-y-1">
                        {sub.subsubcategories?.map((ss) => (
                          <div
                            key={ss.id}
                            className="flex items-center justify-between group"
                          >
                            <span className="text-xs text-gray-600">
                                {ss.subsub_name} ({ss.total_items})                                
                              </span>


                            <div className="opacity-0 group-hover:opacity-100 transition flex gap-2 text-xs">
                              <PencilIcon
                                onClick={() =>
                                  openModalRename(
                                    "subsubcategories",
                                    ss.id,
                                    ss.subsub_name
                                  )
                                }
                                className="h-3 text-purple-600 cursor-pointer"
                              />
                              <TrashIcon
                                onClick={() =>
                                  handleDelete("subsubcategories", ss.id)
                                }
                                className="h-3 text-red-600 cursor-pointer"
                              />
                              
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3">{modal.title}</h2>

            <input
              type="text"
              className="w-full border px-3 py-2 rounded text-sm mb-4"
              value={modal.value}
              onChange={(e) =>
                setModal((m) => ({ ...m, value: e.target.value }))
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={saveModal}
                className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
