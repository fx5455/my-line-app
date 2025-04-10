// src/pages/admin/AdminProductForm.js
import React, { useState } from 'react';
import { db } from '../../firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

const AdminProductForm = () => {
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: '',
    supplier: '',
    supplierPrice: '',
    catchCopy: '',
    category: '',
    stockStatus: '',
    imageUrl: '',
    description: '',
    videoUrl: '' // ✅ 追加: 動画URL
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'products', form.id), {
        ...form,
        price: Number(form.price),
        supplierPrice: Number(form.supplierPrice),
        createdAt: serverTimestamp()
      });
      alert('商品を登録しました');
      setForm({
        id: '',
        name: '',
        price: '',
        supplier: '',
        supplierPrice: '',
        catchCopy: '',
        category: '',
        stockStatus: '',
        imageUrl: '',
        description: '',
        videoUrl: ''
      });
    } catch (err) {
      console.error('登録エラー:', err);
      alert('登録に失敗しました');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🛠 商品登録フォーム</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="id" value={form.id} onChange={handleChange} placeholder="商品ID（JANコードなど）" className="border p-2 w-full" required />
        <input name="name" value={form.name} onChange={handleChange} placeholder="商品名" className="border p-2 w-full" required />
        <input name="price" type="text" value={form.price} onChange={handleChange} placeholder="売価（税抜）" className="border p-2 w-full" required />
        <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="仕入元" className="border p-2 w-full" />
        <input name="supplierPrice" type="text" value={form.supplierPrice} onChange={handleChange} placeholder="仕入価格" className="border p-2 w-full" />
        <input name="catchCopy" value={form.catchCopy} onChange={handleChange} placeholder="キャッチコピー" className="border p-2 w-full" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="カテゴリ" className="border p-2 w-full" />
        <input name="stockStatus" value={form.stockStatus} onChange={handleChange} placeholder="在庫数（欠品：＠）" className="border p-2 w-full" />
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="画像URL" className="border p-2 w-full" />
        <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="YouTube動画URL（src=埋め込み用URL）" className="border p-2 w-full" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="商品説明" className="border p-2 w-full h-24" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">登録する</button>
      </form>
    </div>
  );
};

export default AdminProductForm;