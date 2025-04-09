import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import OrderComplete from './pages/OrderComplete';
import OrderHistory from './pages/OrderHistory';
import NoticeList from './pages/NoticeList';
import Admin from './pages/Admin';
import AdminOrderStatus from './pages/admin/AdminOrderStatus';
import AdminNoticeManager from './pages/admin/AdminNoticeManager';

import { CartProvider } from './context/CartContext';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedCompany = localStorage.getItem('companyName');
    const storedUserId = localStorage.getItem('lineUserId');
    const storedAdmin = localStorage.getItem('isAdmin');

    if (storedCompany && storedUserId) {
      setCompanyName(storedCompany);
      setIsLoggedIn(true);
      setIsAdmin(storedAdmin === 'true');
    }
  }, []);

  const handleLogin = (company, adminFlag = false) => {
    setCompanyName(company);
    setIsLoggedIn(true);
    setIsAdmin(adminFlag);
    localStorage.setItem('isAdmin', adminFlag.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem('lineUserId');
    localStorage.removeItem('companyName');
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    setCompanyName('');
    setIsAdmin(false);
  };

  const AdminRoute = ({ children }) => {
    return isAdmin ? children : <Navigate to="/" />;
  };

  return (
    <CartProvider>
      <Router>
        <div className="App">
          {isLoggedIn ? (
            <>
              <div className="p-4 border-b mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    ようこそ、{companyName} 様
                  </h2>
                  <div className="space-x-4 text-sm text-blue-600 underline mt-1">
                    <Link to="/">🏠 商品一覧</Link>
                    <Link to="/history">📋 注文履歴</Link>
                    <Link to="/cart">🛒 カート</Link>
                    <Link to="/notices">📄 お知らせ一覧</Link>
                    {isAdmin && <Link to="/admin">🔧 管理画面</Link>}
                  </div>
                </div>
                <button onClick={handleLogout} className="text-red-600 text-sm">
                  ログアウト
                </button>
              </div>

              <Routes>
                <Route path="/" element={<ProductList isAdmin={isAdmin} />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage companyName={companyName} />} />
                <Route path="/complete" element={<OrderComplete />} />
                <Route path="/history" element={<OrderHistory />} />
                <Route path="/notices" element={<NoticeList />} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrderStatus /></AdminRoute>} />
                <Route path="/admin/notices" element={<AdminRoute><AdminNoticeManager /></AdminRoute>} />
              </Routes>
            </>
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
