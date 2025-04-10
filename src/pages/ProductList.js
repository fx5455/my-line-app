// src/pages/ProductList.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
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
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setFiltered(items);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const categoryList = snapshot.docs.map(doc => doc.data().name);
      setCategories(["すべて", ...categoryList]);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNotice = async () => {
      const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
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
      result = result.filter(p => p.name.includes(searchKeyword) || p.id.includes(searchKeyword));
    }
    if (priceMin !== '') {
      result = result.filter(p => p.price >= parseInt(priceMin));
    }
    if (priceMax !== '') {
      result = result.filter(p => p.price <= parseInt(priceMax));
    }
    setFiltered(result);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedCategory("すべて");
    setSearchKeyword('');
    setPriceMin('');
    setPriceMax('');
    setFiltered(products);
    setCurrentPage(1);
  };

  const toggleFavorite = (id) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(fav => fav !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const getStockLabel = (status) => {
    const num = Number(status);
    if (num >= 1) return { text: '在庫あり', style: 'bg-green-100 text-green-700' };
    if (num === 0) return { text: 'お取り寄せ【1〜4営業日】', style: 'bg-yellow-100 text-yellow-800' };
    return { text: '欠品中', style: 'bg-red-100 text-red-700' };
  };

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-4">
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
        <button
          className="text-blue-600 underline text-sm"
          onClick={() => setFiltered(products.filter(p => favorites.includes(p.id)))}
        >⭐ お気に入りを表示</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border p-2">
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
        <input type="text" placeholder="商品名またはIDで検索" className="border p-2" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
        <input type="number" placeholder="最低価格" className="border p-2 w-32" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
        <input type="number" placeholder="最高価格" className="border p-2 w-32" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        <button onClick={handleFilter} className="bg-blue-600 text-white px-4 py-2 rounded">検索</button>
        <button onClick={handleReset} className="bg-gray-500 text-white px-4 py-2 rounded">リセット</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paginated.map((item) => {
          const { text, style } = getStockLabel(item.stockStatus);
          const isFavorite = favorites.includes(item.id);

          return (
            <div key={item.id} className="border p-4 rounded shadow hover:shadow-lg transition cursor-pointer" onClick={() => navigate(`/product/${item.id}`, { state: { product: item } })}>
              {item.imageUrl && (
                <div className="mb-2 w-full aspect-square bg-white border rounded flex items-center justify-center overflow-hidden">
                  <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-xs text-gray-400">ID: {item.id}</p>
              <p className="text-sm text-gray-500">{item.catchCopy}</p>
              <p className="text-red-600 font-bold">¥{item.price?.toLocaleString()}</p>
              <p className={`text-sm px-2 py-1 inline-block rounded ${style} mt-2`}>{text}</p>

              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                <label className="block text-sm mb-1">数量:</label>
                <input type="number" min="1" defaultValue="1" className="border p-1 w-16" onClick={(e) => e.stopPropagation()} id={`qty-${item.id}`} />
                <button
                  onClick={() => {
                    const qty = Number(document.getElementById(`qty-${item.id}`).value);
                    addToCart(item, qty);
                    alert(`「${item.name}」を ${qty} 個 カートに追加しました`);
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded ml-2"
                >カートに入れる</button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className="mt-2 text-sm text-yellow-600 underline"
              >{isFavorite ? '⭐ お気に入り解除' : '☆ お気に入り登録'}</button>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded border ${currentPage === idx + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            >{idx + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
