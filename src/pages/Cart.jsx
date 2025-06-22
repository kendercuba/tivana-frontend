import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useCart from "../hooks/useCart.jsx";
import Button from '../components/ui/Button';
import CartItem from "../components/cart/CartItem";
import Card from '../components/ui/Card';


export default function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    loading,
    error,
    isSelected,
    toggleItemSelection,
    toggleSeleccionarTodo,
    calcularSubtotalSeleccionados,
    compartirProducto,
    guardarParaMasTarde,
    ToggleSeleccionarTodo,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    aumentarCantidadInvitado,
    disminuirCantidadInvitado,
    eliminarProductoInvitado,
    cambiarTalla,
  } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <div className="p-4">Cargando carrito...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  const allSelected = cart.length > 0 && cart.every(item =>
  isSelected(item.id || item.product_id, item.size)
);


  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-10 px-6">
        {/* 🧭 Columna izquierda: productos */}
        <Card className="w-full lg:w-4/5">
          <h1 className="text-2xl font-bold mb-6">Carrito</h1>

          
            {/* Validacion condicional si esta vacio el carrito desaparece el boton "seleccionar todo" */}
                  {cart.length === 0 ? (
              <p className="text-gray-500 mb-6">Tu carrito está vacío.</p>
            ) : (
              <>
                {/* ✅ Botón Seleccionar todo (si hay productos) */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={toggleSeleccionarTodo}
                    className="text-blue-600 hover:underline"
                  >
                    {allSelected ? "Quitar selección" : "Seleccionar todo"}
                  </button>
                </div>
              </>
            )}

                 {cart.length > 0 && (
                <div className="space-y-6">
                  {cart.map((item, index) => (
                    <CartItem
                      key={`${item.id || item.product_id}-${item.size}-${index}`}
                      item={item}
                      isSelected={isSelected(item.id || item.product_id, item.size)}
                      onToggle={() =>
                        toggleItemSelection(item.id || item.product_id, item.size)
                      }
                      onQuantityChange={(action) =>
                        item.product_id
                          ? action === "increase"
                            ? aumentarCantidad(item.product_id, item.size)
                            : disminuirCantidad(item.product_id, item.size)
                          : action === "increase"
                            ? aumentarCantidadInvitado(item.id, item.size)
                            : disminuirCantidadInvitado(item.id, item.size)
                      }
                      onDelete={() =>
                        item.product_id
                          ? eliminarProducto(item.product_id, item.size)
                          : eliminarProductoInvitado(item.id, item.size)
                      }
                      onSave={guardarParaMasTarde}
                      onSizeChange={cambiarTalla}
                    />
                  ))}
                </div>
              )}

      </Card> {/* cierre del contenedor de productos */}
 
        {/* 🧾 Columna derecha: resumen */}
        <Card className="w-full lg:w-1/5 h-fit">
          <h2 className="text-xl font-semibold mb-4">Resumen</h2>
          <p className="mb-2 text-sm">
            Productos seleccionados:{" "}
            <strong>
              {cart.filter((item) =>
                isSelected(item.id || item.product_id, item.size)
              ).length}
            </strong>
          </p>
          <p className="mb-4 text-sm">
            Subtotal:{" "}
            <strong>${calcularSubtotalSeleccionados().toFixed(2)}</strong>
          </p>
          <p className="text-xs text-gray-500 mb-4">
            El envío y los impuestos se calcularán en el checkout.
          </p>
         <Button full intent="primary">
          Proceder al pago
        </Button>

        </Card>
      </div>
    </div>
  );
}
