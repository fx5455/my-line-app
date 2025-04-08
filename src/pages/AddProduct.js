// src/pages/AddProduct.js
import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AddProduct = () => {
  const [product, setProduct] = useState({
    id: '',
    name: '',
    price: '',
    category: '',
    imageUrl: '',
    catchCopy: '',
    stockStatus: '1'
  });
  const [message, setMessage] = useState('');

  const saveProductWithCategory = async (product) => {
    await setDoc(doc(db, 'products', product.id), product);

    const catRef = doc(db, 'categories', product.category);
    const catSnap = await getDoc(catRef);
    if (!catSnap.exists()) {
      await setDoc(catRef, { name: product.category });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveProductWithCategory(product);
      setMessage('✅ 商品を登録しました');
      setProduct({
        id: '',
        name: '',
        price: '',
        category: '',
        imageUrl: '',
        catchCopy: '',
        stockStatus: '1'
      });
    } catch (err) {
      console.error('登録エラー:', err);
      setMessage('❌ 登録に失敗しました');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📦 商品登録</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="商品ID" value={product.id} onChange={(e) => setProduct({ ...product, id: e.target.value })} className="border p-2 w-full" required />
        <input type="text" placeholder="商品名" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="border p-2 w-full" required />
        <input type="number" placeholder="税込価格" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="border p-2 w-full" required />
        <input type="text" placeholder="カテゴリ名（例：電動工具）" value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })} className="border p-2 w-full" required />
        <input type="text" placeholder="画像URL" value={product.imageUrl} onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })} className="border p-2 w-full" />
        <input type="text" placeholder="キャッチコピー" value={product.catchCopy} onChange={(e) => setProduct({ ...product, catchCopy: e.target.value })} className="border p-2 w-full" />
        <select value={product.stockStatus} onChange={(e) => setProduct({ ...product, stockStatus: e.target.value })} className="border p-2 w-full">
          <option value="1">在庫あり</option>
          <option value="0">お取り寄せ</option>
          <option value="-1">欠品中</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">登録する</button>
      </form>

      {message && <p className="mt-4 text-center text-lg">{message}</p>}
    </div>
  );
};

export default AddProduct;
