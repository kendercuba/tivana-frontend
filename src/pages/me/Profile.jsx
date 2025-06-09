import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function Profile() {
  const [nombreInput, setNombreInput] = useState(user?.nombre || "");
  const [apellidoInput, setApellidoInput] = useState(user?.apellido || "");
  const { user } = useContext(UserContext);
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });
  const [newPayment, setNewPayment] = useState({
    cardholder_name: "",
    card_last4: "",
    expiry_month: "",
    expiry_year: "",
    brand: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addrRes, payRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/profile/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/profile/payment-methods`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const addrData = await addrRes.json();
        const payData = await payRes.json();

        setAddresses(addrData);
        setPayments(payData);
      } catch (err) {
        console.error("Error al cargar datos del perfil", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAddress),
    });
    if (res.ok) {
      setNewAddress({
        full_name: "",
        address_line: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      });
      const updated = await res.json();
      window.location.reload(); // Rápido, puedes mejorar esto luego
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/payment-methods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newPayment),
    });
    if (res.ok) {
      setNewPayment({
        cardholder_name: "",
        card_last4: "",
        expiry_month: "",
        expiry_year: "",
        brand: "",
      });
      window.location.reload();
    }
  };

  if (loading) return <p className="p-4">Cargando perfil...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Perfil de usuario</h1>

      {/* 👤 INFORMACIÓN DE USUARIO */}
<div>
  <h2 className="text-xl font-semibold mb-2">Datos del usuario</h2>
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: nombreInput, apellido: apellidoInput }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Datos actualizados correctamente");
      } else {
        alert(`❌ ${data.message}`);
      }
    }}
    className="grid gap-2 md:grid-cols-2 mb-6"
  >
    <input
      required
      placeholder="Nombre"
      value={nombreInput}
      onChange={(e) => setNombreInput(e.target.value)}
      className="border p-2 rounded"
    />
    <input
      required
      placeholder="Apellido"
      value={apellidoInput}
      onChange={(e) => setApellidoInput(e.target.value)}
      className="border p-2 rounded"
    />
    <input
      value={user?.email || ""}
      readOnly
      className="md:col-span-2 border p-2 rounded bg-gray-100 text-gray-500"
    />
    <button className="md:col-span-2 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition">
      Guardar cambios
    </button>
  </form>
</div>


      {/* 🏠 DIRECCIONES */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Direcciones guardadas</h2>
        <ul className="space-y-2 mb-4">
          {addresses.map((a) => (
            <li key={a.id} className="border p-3 rounded shadow">
              <p>{a.full_name}</p>
              <p>{a.address_line}</p>
              <p>{a.city}, {a.state}, {a.postal_code}</p>
              <p>{a.country}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddressSubmit} className="grid gap-2 md:grid-cols-2">
          <input required placeholder="Nombre completo" value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Dirección" value={newAddress.address_line} onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Ciudad" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Estado" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Código postal" value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="País" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="border p-2 rounded" />
          <button className="md:col-span-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">Agregar dirección</button>
        </form>
      </div>

      {/* 💳 MÉTODOS DE PAGO */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Métodos de pago</h2>
        <ul className="space-y-2 mb-4">
          {payments.map((p) => (
            <li key={p.id} className="border p-3 rounded shadow">
              <p>{p.cardholder_name} - {p.brand} ****{p.card_last4}</p>
              <p>Expira: {p.expiry_month}/{p.expiry_year}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={handlePaymentSubmit} className="grid gap-2 md:grid-cols-2">
          <input required placeholder="Nombre del titular" value={newPayment.cardholder_name} onChange={(e) => setNewPayment({ ...newPayment, cardholder_name: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Últimos 4 dígitos" maxLength={4} value={newPayment.card_last4} onChange={(e) => setNewPayment({ ...newPayment, card_last4: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Mes exp." value={newPayment.expiry_month} onChange={(e) => setNewPayment({ ...newPayment, expiry_month: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Año exp." value={newPayment.expiry_year} onChange={(e) => setNewPayment({ ...newPayment, expiry_year: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Marca (Visa, MasterCard...)" value={newPayment.brand} onChange={(e) => setNewPayment({ ...newPayment, brand: e.target.value })} className="border p-2 rounded" />
          <button className="md:col-span-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">Agregar método de pago</button>
        </form>
      </div>
    </div>
  );
}
