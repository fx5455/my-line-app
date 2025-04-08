// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import OrderComplete from './pages/OrderComplete';
import OrderHistory from './pages/OrderHistory';

import { CartProvider } from './context/CartContext';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyName, setCompanyName] = useState('');

  // ✅ 自動ログイン処理
  useEffect(() => {
    const storedCompany = localStorage.getItem('companyName');
    const storedUserId = localStorage.getItem('lineUserId');
    if (storedCompany && storedUserId) {
      setCompanyName(storedCompany);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (company) => {
    setCompanyName(company);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('lineUserId');
    localStorage.removeItem('companyName');
    setIsLoggedIn(false);
    setCompanyName('');
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
                    <a href="/">🏠 商品一覧</a>
                    <a href="/history">📋 注文履歴</a>
                    <a href="/cart">🛒 カート</a>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-red-600 text-sm">
                  ログアウト
                </button>
              </div>

              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage companyName={companyName} />} />
                <Route path="/complete" element={<OrderComplete />} />
                <Route path="/history" element={<OrderHistory />} />
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