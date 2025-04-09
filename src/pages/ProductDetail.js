// src/pages/ProductDetail.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="p-4">
        <p>商品情報が見つかりませんでした。</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline">
          商品一覧に戻る
        </button>
      </div>
    );
  }

  const getStockLabel = (status) => {
    const numericStatus = Number(status);
    if (!isNaN(numericStatus)) {
      if (numericStatus >= 1) return { text: '在庫あり', style: 'bg-green-100 text-green-700' };
      if (numericStatus === 0) return { text: 'お取り寄せ【1〜4営業日】', style: 'bg-yellow-100 text-yellow-800' };
      return { text: '欠品中', style: 'bg-red-100 text-red-700' };
    }
    return { text: '欠品中', style: 'bg-red-100 text-red-700' };
  };

  const { text, style } = getStockLabel(product.stockStatus);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${product.name} を ${quantity}個 カートに追加しました`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 underline mb-4">
        ← 一覧に戻る
      </button>

      <div className="border rounded shadow p-4">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="mb-4 w-full h-64 object-contain"
          />
        )}
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-sm text-gray-500 mb-2">{product.catchCopy}</p>
        <p className="text-xl text-red-600 font-bold">¥{product.price.toLocaleString()}</p>

        <p className={`text-sm px-2 py-1 inline-block rounded mt-2 ${style}`}>
          {text}
        </p>

        {/* 商品説明追加 */}
        {product.description && (
          <div className="mt-4">
            <h3 className="font-semibold mb-1">商品説明</h3>
            <div
            className="text-sm text-gray-700 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: product.description }}
           />
        </div>
        )}

        <div className="mt-6">
          <label className="block mb-1">数量を入力：</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border p-2 w-24 mb-4"
          />
          <br />
          <button
            onClick={handleAddToCart}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            カートに追加
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
