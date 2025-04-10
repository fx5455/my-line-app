// src/pages/BuyLaterList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BuyLaterList = () => {
  const navigate = useNavigate();
  const buyLater = JSON.parse(localStorage.getItem('buyLater')) || [];

  const removeFromBuyLater = (id) => {
    const updated = buyLater.filter(item => item.id !== id);
    localStorage.setItem('buyLater', JSON.stringify(updated));
    window.location.reload();
  };

  const moveToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const exists = cart.find(p => p.id === item.id);
    if (exists) {
      exists.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    removeFromBuyLater(item.id);
    alert(`${item.name} をカートに移動しました`);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🕒 後で買うリスト</h2>
      {buyLater.length === 0 ? (
        <p>「後で買う」リストに商品がありません。</p>
      ) : (
        <ul className="space-y-4">
          {buyLater.map(item => (
            <li key={item.id} className="border p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-gray-500">単価: ¥{item.price.toLocaleString()}</p>
                  <p className="text-sm">数量: {item.quantity}</p>
                </div>
                <div className="text-sm space-x-2">
                  <button
                    onClick={() => moveToCart(item)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >カートに移動</button>
                  <button
                    onClick={() => removeFromBuyLater(item.id)}
                    className="text-red-600 underline"
                  >削除</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 underline"
        >← 戻る</button>
      </div>
    </div>
  );
};

export default BuyLaterList;
