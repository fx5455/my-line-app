// src/pages/admin/AdminProductManager.js
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(list);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({ ...product });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const { id, ...updateData } = form;
    await updateDoc(doc(db, 'products', editingId), updateData);
    setEditingId(null);
    setForm({});
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('この商品を削除してもよろしいですか？')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id?.includes(searchTerm)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🛠 商品編集・削除</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="商品名またはIDで検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      <ul className="space-y-4">
        {currentProducts.map(product => (
          <li key={product.id} className="border p-4 rounded">
            {editingId === product.id ? (
              <div className="space-y-2">
                <label className="block text-sm font-semibold">商品名</label>
                <input name="name" value={form.name || ''} onChange={handleChange} className="border p-2 w-full" />
                <label className="block text-sm font-semibold">売価</label>
                <input name="price" value={form.price || ''} onChange={handleChange} className="border p-2 w-full" />
                <label className="block text-sm font-semibold">仕入元</label>
                <input name="supplier" value={form.supplier || ''} onChange={handleChange} className="border p-2 w-full" />
                <label className="block text-sm font-semibold">仕入価格</label>
                <input name="supplierPrice" value={form.supplierPrice || ''} onChange={handleChange} className="border p-2 w-full" />
                <label className="block text-sm font-semibold">カテゴリ</label>
                <input name="category" value={form.category || ''} onChange={handleChange} className="border p-2 w-full" />
                <label className="block text-sm font-semibold">在庫数</label>
                <input name="stockStatus" value={form.stockStatus || ''} onChange={handleChange} className="border p-2 w-full" />
                <label className="block text-sm font-semibold">画像URL</label>
                <input name="imageUrl" value={form.imageUrl || ''} onChange={handleChange} className="border p-2 w-full" />
                <label className="block text-sm font-semibold">商品説明</label>
                <textarea name="description" value={form.description || ''} onChange={handleChange} className="border p-2 w-full h-24" />
                <button onClick={handleUpdate} className="bg-blue-600 text-white px-3 py-1 rounded">保存</button>
                <button onClick={() => setEditingId(null)} className="ml-2 text-gray-500">キャンセル</button>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{product.name}</p>
                  <p className="text-sm text-gray-500">ID: {product.id}</p>
                  <p className="text-sm">¥{product.price?.toLocaleString()}</p>
                </div>
                <div className="space-x-2 text-sm">
                  <button onClick={() => handleEdit(product)} className="text-blue-600 underline">編集</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 underline">削除</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* ページネーション */}
      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminProductManager;
