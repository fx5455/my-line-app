// src/pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProductDetail = () => {
  const { id } = useParams(); // ← URLのidを取得
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const ref = doc(db, 'products', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProduct({ id: snap.id, ...data });

          // お気に入りチェック
          const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
          setIsFavorite(storedFavorites.includes(snap.id));
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error('商品取得エラー:', e);
        setProduct(null);
      }
    };

    fetchProduct();
  }, [id]);

  const toggleFavorite = () => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let updated;
    if (storedFavorites.includes(product.id)) {
      updated = storedFavorites.filter(pid => pid !== product.id);
      setIsFavorite(false);
    } else {
      updated = [...storedFavorites, product.id];
      setIsFavorite(true);
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const getStockLabel = (status) => {
    const numericStatus = Number(status);
    if (!isNaN(numericStatus)) {
      if (numericStatus >= 1) return { text: '在庫あり', style: 'bg-green-100 text-green-700' };
      if (numericStatus === 0) return { text: 'お取り寄せ【1〜4営業日】', style: 'bg-yellow-100 text-yellow-800' };
      return { text: '欠品中', style: 'bg-red-100 text-red-700' };
    }
    return { text: '欠品中', style: 'bg-red-100 text-red-700' };
  };

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
        <p className="text-xl text-red-600 font-bold">¥{product.price?.toLocaleString()}</p>

        <p className={`text-sm px-2 py-1 inline-block rounded mt-2 ${style}`}>
          {text}
        </p>

        {/* お気に入り */}
        <div className="mt-2">
          <button
            onClick={toggleFavorite}
            className="text-yellow-600 underline text-sm"
          >
            {isFavorite ? '⭐ お気に入り解除' : '☆ お気に入り登録'}
          </button>
        </div>

        {/* 商品説明 */}
        {product.description && (
          <div className="mt-4">
            <h3 className="font-semibold mb-1">商品説明</h3>
            <div
              className="text-sm text-gray-700 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* 動画 */}
        {product.videoUrl && (
          <div className="mt-6">
            <h3 className="font-semibold mb-1">商品紹介動画</h3>
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="315"
                src={product.videoUrl}
                title="商品紹介動画"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded border"
              ></iframe>
            </div>
          </div>
        )}

        {/* カート追加 */}
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
