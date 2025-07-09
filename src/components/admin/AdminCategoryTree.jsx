import { useEffect, useState } from 'react';

export default function AdminCategoryTree() {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [activeItem, setActiveItem] = useState({ type: null, id: null });

const reloadData = async () => {
  console.log('🔄 Recargando datos...');  
  const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/categories`, {
    credentials: 'include',
  });
  const data = await res.json();
  setCategories(data);
  setExpandedCategories({});
  setExpandedSubcategories({});
};

  useEffect(() => {
  reloadData();
  
}, []);


  const toggleCategory = async (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));

    if (!expandedCategories[categoryId]) {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/subcategories`, {
        credentials: 'include',
      });
      const allSub = await res.json();
      const updated = categories.map(cat =>
        cat.id === categoryId ? { ...cat, subcategories: allSub.filter(s => s.category_id === categoryId) } : cat
      );
      setCategories(updated);
    }
  };

  const toggleSubcategory = async (categoryId, subcategoryId) => {
  setExpandedSubcategories(prev => ({
    ...prev,
    [subcategoryId]: !prev[subcategoryId]
  }));

  // Si ya estaba expandido, no hace falta volver a cargar
  if (!expandedSubcategories[subcategoryId] || !sub.subsubcategories) {
    
    
     try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/subsubcategories`, {
        credentials: 'include',
      });
      const allSubSub = await res.json();

      const updated = categories.map(cat => {
        if (cat.id !== categoryId) return cat;

        const updatedSub = cat.subcategories.map(sub =>
          sub.id === subcategoryId
            ? {
                ...sub,
                subsubcategories: allSubSub.filter(ss => ss.subcategory_id === sub.id)
              }
            : sub
        );

        return { ...cat, subcategories: updatedSub };
      });

      setCategories(updated);
    } catch (err) {
      console.error("❌ Error loading subsubcategories:", err);
    }
  }
};



const endpoints = {
  category: 'admin/categories',
  subcategory: 'admin/subcategories',
  subsub: 'admin/subsubcategories',
};


const handleRename = async (type, id) => {
  console.log('📝 Editar:', type, id); // <- AÑADE ESTO
  const nuevoNombre = prompt(`Editar nombre de ${type}:`);
  if (!nuevoNombre) return;
  const field = 'name';

  console.log("📤 PUT →", {
  url: `${import.meta.env.VITE_API_URL}/${endpoints[type]}/${id}`,
  payload: { [field]: nuevoNombre }
});

  await fetch(`${import.meta.env.VITE_API_URL}/${endpoints[type]}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [field]: nuevoNombre })
  });

  reloadData();
};


const handleDelete = async (type, id) => {
  console.log('🗑️ Eliminar:', type, id);
  const confirmar = confirm(`¿Eliminar esta ${type}?`);
  if (!confirmar) return;

  await fetch(`${import.meta.env.VITE_API_URL}/${endpoints[type]}/${id}`, {
    method: 'DELETE'
  });

  reloadData();
};


const handleMove = async (type, id, direction) => {
  console.log('🔼 Mover:', type, id, direction);
  await fetch(`${import.meta.env.VITE_API_URL}/${endpoints[type]}/${id}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction })
  });

  reloadData();
};

const handleAdd = async (type, parentId) => {
  console.log('➕ Agregar:', type, parentId);
  const nuevoNombre = prompt(`Nombre de nueva ${type === 'subcategory' ? 'subcategoría' : 'sub-subcategoría'}`);
  if (!nuevoNombre) return;

  const body = type === 'subcategory'
    ? { name: nuevoNombre, category_id: parentId }
   : { name: nuevoNombre, subcategory_id: parentId };


  await fetch(`${import.meta.env.VITE_API_URL}/${endpoints[type]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  reloadData();
};


  return (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-2">Categorías</h2>
    <ul className="space-y-0.5">
      {categories.map(cat => (
        <li key={cat.id} className="border-b border-gray-200 py-1">
          <div className="flex justify-between items-center">
            <button
              className="text-left font-medium hover:underline"
              onClick={() => {
                toggleCategory(cat.id);
                setActiveItem({ type: 'category', id: cat.id });
              }}
            >
              {cat.name}
            </button>
            {activeItem.type === 'category' && activeItem.id === cat.id && (
              <div className="text-sm space-x-2 text-blue-600 ml-4">
                <button onClick={() => handleRename('category', cat.id)}>Editar</button>
                <button onClick={() => handleDelete('category', cat.id)}>Eliminar</button>
                <button onClick={() => handleMove('category', cat.id, 'up')}>Subir</button>
                <button onClick={() => handleMove('category', cat.id, 'down')}>Bajar</button>
                <button onClick={() => handleAdd('subcategory', cat.id)}>+ Subcategoría</button>
              </div>
            )}
          </div>

          {expandedCategories[cat.id] && cat.subcategories && (
            <ul className="ml-6 mt-0 space-y-0 bg-gray-100 rounded-md p-2">
                {cat.subcategories.map(sub => (
                    <li key={sub.id} className="border-b border-gray-100 py-0.5 pl-2">

                  <div className="flex justify-between items-center">
                    <button
                      className="text-left hover:underline"
                      onClick={() => {
                        toggleSubcategory(cat.id, sub.id);
                        setActiveItem({ type: 'subcategory', id: sub.id });
                      }}
                    >
                      {sub.name}
                    </button>
                    {activeItem.type === 'subcategory' && activeItem.id === sub.id && (
                      <div className="text-sm space-x-2 text-green-600 ml-4">
                        <button onClick={() => handleRename('subcategory', sub.id)}>Editar</button>
                        <button onClick={() => handleDelete('subcategory', sub.id)}>Eliminar</button>
                        <button onClick={() => handleMove('subcategory', sub.id, 'up')}>Subir</button>
                        <button onClick={() => handleMove('subcategory', sub.id, 'down')}>Bajar</button>
                        <button onClick={() => handleAdd('subsub', sub.id)}>+ Sub-subcategoría</button>
                      </div>
                    )}
                  </div>

                  {expandedSubcategories[sub.id] && sub.subsubcategories && (
                    <ul className="ml-6 mt-0 space-y-0 bg-white rounded-md p-2 text-sm text-gray-700">
  {sub.subsubcategories?.map(ss => (
    <li key={ss.id} className="border-b border-gray-100 py-0.5 pl-4">

                          <div className="flex justify-between items-center">
                            <button
                              className="hover:underline"
                              onClick={() => setActiveItem({ type: 'subsub', id: ss.id })}
                            >
                              {ss.subsub_name}
                            </button>
                            {activeItem.type === 'subsub' && activeItem.id === ss.id && (
                              <div className="text-sm space-x-2 text-purple-600 ml-4">
                                <button onClick={() => handleRename('subsub', ss.id)}>Editar</button>
                                <button onClick={() => handleDelete('subsub', ss.id)}>Eliminar</button>
                                <button onClick={() => handleMove('subsub', ss.id, 'up')}>Subir</button>
                                <button onClick={() => handleMove('subsub', ss.id, 'down')}>Bajar</button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </div>
);



}
