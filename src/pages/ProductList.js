// src/pages/ProductList.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import dayjs from 'dayjs';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState(["すべて"]);
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [searchKeyword, setSearchKeyword] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [latestNotice, setLatestNotice] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 🔸 商品データ
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setFiltered(items);
    };
    fetchProducts();
  }, []);

  // 🔸 カテゴリデータ
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const categoryList = snapshot.docs.map(doc => doc.data().name);
      setCategories(["すべて", ...categoryList]);
    };
    fetchCategories();
  }, []);

  // 🔸 お知らせ（最新1件）
  useEffect(() => {
    const fetchNotice = async () => {
      const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setLatestNotice({
          id: doc.id,
          title: data.title,
          createdAt: data.createdAt?.toDate ? dayjs(data.createdAt.toDate()).format('YYYY/MM/DD') : ''
        });
      }
    };
    fetchNotice();
  }, []);

  const handleFilter = () => {
    let result = [...products];

    if (selectedCategory !== 'すべて') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchKeyword.trim() !== '') {
      result = result.filter(p => p.name.includes(searchKeyword));
    }

    if (priceMin !== '') {
      result = result.filter(p => p.price >= parseInt(priceMin));
    }
    if (priceMax !== '') {
      result = result.filter(p => p.price <= parseInt(priceMax));
    }

    setFiltered(result);
  };

  const handleReset = () => {
    setSelectedCategory("すべて");
    setSearchKeyword('');
    setPriceMin('');
    setPriceMax('');
    setFiltered(products);
  };

  const getStockLabel = (status) => {
    const num = Number(status);
    if (num >= 1) return { text: '在庫あり', style: 'bg-green-100 text-green-700' };
    if (num === 0) return { text: 'お取り寄せ【1〜4営業日】', style: 'bg-yellow-100 text-yellow-800' };
    return { text: '欠品中', style: 'bg-red-100 text-red-700' };
  };

  return (
    <div className="p-4">
      {/* 🔔 最新お知らせ */}
      {latestNotice && (
  <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-3">
    <div className="flex justify-between items-center">
      <p className="text-sm font-semibold">
        最新のお知らせ: {latestNotice.title}（{latestNotice.createdAt}）
      </p>
      <a href="/notices" className="text-blue-600 underline text-sm ml-4">📄 お知らせ一覧</a>
    </div>
  </div>
)}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">商品一覧</h2>
      </div>

      {/* 🔍 検索 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2"
        >
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="商品名で検索"
          className="border p-2"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <input
          type="number"
          placeholder="最低価格"
          className="border p-2 w-32"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="最高価格"
          className="border p-2 w-32"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />
        <button onClick={handleFilter} className="bg-blue-600 text-white px-4 py-2 rounded">検索</button>
        <button onClick={handleReset} className="bg-gray-500 text-white px-4 py-2 rounded">リセット</button>
      </div>

      {/* 商品一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const { text, style } = getStockLabel(item.stockStatus);

          return (
            <div
              key={item.id}
              className="border p-4 rounded shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/product/${item.id}`, { state: { product: item } })}
            >
              {item.imageUrl && (
                <div className="mb-2 w-full aspect-square bg-white border rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.catchCopy}</p>
              <p className="text-red-600 font-bold">¥{item.price?.toLocaleString()}</p>
              <p className={`text-sm px-2 py-1 inline-block rounded ${style} mt-2`}>{text}</p>

              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                <label className="block text-sm mb-1">数量:</label>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="border p-1 w-16"
                  onClick={(e) => e.stopPropagation()}
                  id={`qty-${item.id}`}
                />
                <button
                  onClick={() => {
                    const qty = Number(document.getElementById(`qty-${item.id}`).value);
                    addToCart(item, qty);
                    alert(`「${item.name}」を ${qty} 個 カートに追加しました`);
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded ml-2"
                >
                  カートに入れる
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
