// src/pages/admin/AdminOrderStatus.js
import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';

const statusOptions = ['注文確認中', '手配中', '欠品中', '出荷済', '納品済'];

const AdminOrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('すべて');
  const [productKeyword, setProductKeyword] = useState('');

  // 🔄 注文データ取得
  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, 'orders'), orderBy('orderedAt', 'desc'));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(results);
      setFilteredOrders(results);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // 🔍 フィルターロジック
  const handleFilter = useCallback(() => {
    const keyword = searchKeyword.trim();
    const product = productKeyword.trim();

    const result = orders.filter(order => {
      const matchKeyword =
        keyword === '' ||
        order.id.includes(keyword) ||
        (order.siteName && order.siteName.includes(keyword)) ||
        (order.deliveryLocation && order.deliveryLocation.includes(keyword));

      const currentStatus = order.status || '注文確認中';
      const matchStatus =
        statusFilter === 'すべて' || currentStatus === statusFilter;

      const matchProduct =
        product === '' ||
        (Array.isArray(order.items) &&
          order.items.some(item => item.name.includes(product)));

      return matchKeyword && matchStatus && matchProduct;
    });

    setFilteredOrders(result);
  }, [orders, searchKeyword, statusFilter, productKeyword]);

  // 🔁 フィルター更新時に再実行
  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  // ✅ ステータス変更
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, { status: newStatus });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('ステータス更新エラー:', err);
      alert('ステータスの更新に失敗しました');
    }
  };

  const handleReset = () => {
    setSearchKeyword('');
    setStatusFilter('すべて');
    setProductKeyword('');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🛠 管理者：注文ステータス管理</h2>

      {/* 🔍 フィルター */}
      <div className="bg-gray-50 border p-4 rounded mb-6">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">🔍 注文検索／絞り込み</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="注文番号・現場名・納品先で検索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="border p-2 w-64"
          />
          <input
            type="text"
            placeholder="商品名で検索"
            value={productKeyword}
            onChange={(e) => setProductKeyword(e.target.value)}
            className="border p-2 w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2"
          >
            <option value="すべて">すべてのステータス</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={handleReset}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            🔄 リセット
          </button>
        </div>
      </div>

      {/* ✅ 注文リスト */}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        filteredOrders.map(order => (
          <div key={order.id} className="border rounded p-4 mb-4 shadow">
            <div className="text-sm text-gray-600 mb-1">
              注文番号: {order.id} ／ 注文日: {order.orderedAt?.toDate().toLocaleString()}
            </div>
            <div className="text-sm text-gray-700 mb-2">
              会社: {order.companyName || '不明'} ／ 担当者: {order.personName || '未入力'}
            </div>

            <div className="text-sm mb-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="border-b py-1 flex justify-between">
                  <span>{item.name}</span>
                  <span>数量: {item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <label className="text-sm">ステータス:</label>
              <select
                value={order.status || '注文確認中'}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="border p-1"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrderStatus;
