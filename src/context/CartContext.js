// src/context/CartContext.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

  // カートに追加
  const addToCart = (item, quantity = 1) => {
    const existing = cartItems.find(i => i.id === item.id);
    if (existing) {
      setCartItems(prev =>
        prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      );
    } else {
      setCartItems(prev => [...prev, { ...item, quantity }]);
    }
  };

  // カートから削除
  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // カート内の数量を変更
  const updateQuantity = (id, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // カートを全削除
  const clearCart = () => {
    setCartItems([]);
  };

  // 🕒 後で買うに移動
  const saveForLater = (item) => {
    if (!item) return;

    // すでに後で買うリストに入っているかチェック（重複防止）
    const exists = savedItems.find(i => i.id === item.id);
    if (!exists) {
      setSavedItems(prev => [...prev, item]);
    }

    removeFromCart(item.id);
  };

  // 後で買うから削除
  const removeFromSaved = (id) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  // カートに戻す
  const moveToCart = (item) => {
    if (!item) return;

    addToCart(item, item.quantity || 1);
    removeFromSaved(item.id);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      savedItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      saveForLater,
      removeFromSaved,
      moveToCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
