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
import AccountLayout from './pages/account/AccountLayout';
import AccountSummary from './pages/account/Summary';
import AccountOrders from './pages/account/Orders';
import AccountProfile from './pages/account/Profile';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart'; // ✅ nuevo import

function App() {
  return (
    <>
      <Header />

      <main className="pt-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} /> {/* ✅ nueva ruta */}

          {/* Panel del usuario */}
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountSummary />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="profile" element={<AccountProfile />} />
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
