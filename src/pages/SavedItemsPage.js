// src/pages/SavedItemsPage.js
import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Link を追加
import { useCart } from '../context/CartContext';

const SavedItemsPage = () => {
  const navigate = useNavigate();
  const {
    savedItems,
    addToCart,
    removeFromSaved
  } = useCart();

  if (savedItems.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">🕒 後で買うリスト</h2>
        <p>後で買うリストに商品がありません。</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          商品一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🕒 後で買うリスト</h2>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-blue-600 underline"
        >
          商品一覧に戻る
        </button>
      </div>

      {savedItems.map((item) => (
        <div key={item.id} className="border p-4 rounded mb-2 shadow">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">
                <Link to={`/product/${item.id}`} className="text-blue-600 underline">
                  {item.name}
                </Link>
              </p>
              <p className="text-sm text-gray-500">単価: ¥{item.price?.toLocaleString()}</p>
            </div>
            <div className="text-right space-y-1">
              <button
                onClick={() => addToCart(item, 1)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                カートに入れる
              </button>
              <br />
              <button
                onClick={() => removeFromSaved(item.id)}
                className="text-red-600 text-sm"
              >
                🗑 削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedItemsPage;
