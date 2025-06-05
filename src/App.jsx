import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminUsers from './pages/admin/Users';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminSearchLogs from './pages/admin/SearchLogs';
import AdminProducts from './pages/admin/Products';
import MeLayout from './pages/me/MeLayout';
import MeSummary from './pages/me/Summary';
import MeCart from './pages/me/Cart';
import MeOrders from './pages/me/Orders';
import MeProfile from './pages/me/Profile';
import Checkout from './pages/Checkout';

function App() {
  return (
    <>
      <Header />

      {/* ✅ Ejemplo de prueba de Tailwind */}
      {/* <div className="bg-red-500 text-white p-4 text-center">Tailwind está funcionando</div> */}

      <main className="pt-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Panel del usuario */}
          <Route path="/me" element={<MeLayout />}>
            <Route index element={<MeSummary />} />
            <Route path="cart" element={<MeCart />} />
            <Route path="orders" element={<MeOrders />} />
            <Route path="profile" element={<MeProfile />} />
          </Route>

          {/* Panel admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/search-logs" element={<AdminSearchLogs />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
