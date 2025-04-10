import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom'; // ✅ 商品詳細へのリンク追加

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [person, setPerson] = useState('');
  const [place, setPlace] = useState('');
  const [site, setSite] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem('lineUserId');
      if (!userId) return;

      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('orderedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setFilteredOrders(data);
    };

    fetchOrders();
  }, []);

  const handleSearch = () => {
    const filtered = orders.filter(order => {
      const orderDate = order.orderedAt?.toDate();

      const matchKeyword = keyword === '' || order.items.some(item => item.name.includes(keyword));
      const matchStart = startDate ? dayjs(orderDate).isAfter(dayjs(startDate).subtract(1, 'day')) : true;
      const matchEnd = endDate ? dayjs(orderDate).isBefore(dayjs(endDate).add(1, 'day')) : true;
      const matchPerson = person === '' || (order.personName && order.personName.includes(person));
      const matchPlace = place === '' || (order.deliveryLocation && order.deliveryLocation.includes(place));
      const matchSite = site === '' || (order.siteName && order.siteName.includes(site));

      return matchKeyword && matchStart && matchEnd && matchPerson && matchPlace && matchSite;
    });

    setFilteredOrders(filtered);
  };

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setPerson('');
    setPlace('');
    setSite('');
    setFilteredOrders(orders);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📋 注文履歴</h2>

      {/* 🔍 検索フォーム */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="商品名で検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border p-2 w-40"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2"
        />
        <span>〜</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="担当者名"
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          className="border p-2 w-40"
        />
        <input
          type="text"
          placeholder="納品先"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className="border p-2 w-40"
        />
        <input
          type="text"
          placeholder="現場名"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className="border p-2 w-40"
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">
          🔍 検索
        </button>
        <button onClick={handleReset} className="bg-gray-400 text-white px-4 py-2 rounded">
          🔄 リセット
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <p>該当する注文履歴がありません。</p>
      ) : (
        filteredOrders.map(order => {
          const total = Array.isArray(order.items)
            ? order.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0)
            : 0;

          return (
            <div key={order.id} className="border rounded p-4 mb-4 shadow">
              <div className="mb-2 text-sm text-gray-600">
                注文日: {order.orderedAt?.toDate().toLocaleString()} ／ 注文番号: {order.id}
              </div>
              <div className="text-sm text-gray-700 mb-1">
                担当者: {order.personName || '未入力'} ／ 現場名: {order.siteName || '未入力'} ／ 納品先: {order.deliveryLocation || '未入力'}
              </div>

              {/* ✅ 注文ステータス */}
              <div className="text-sm text-red-600 font-bold mb-1">
                ステータス: {order.status || '注文確認中'}
              </div>

              {/* ✅ 商品一覧 */}
              <div className="text-sm">
                {order.items.map((item, idx) => (
                  <div key={idx} className="border-b py-1 flex justify-between">
                    <div>
                      <div className="font-bold">
                        {/* ✅ 商品名にリンクを追加 */}
                        <Link to={`/product/${item.id}`} className="text-blue-600 underline">
                          {item.name}
                        </Link>
                      </div>
                      <div className="text-gray-500 text-sm">
                        数量: {item.quantity} ／ 単価: ￥{item.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      小計: ￥{(item.quantity * item.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ 合計金額表示 */}
              <div className="text-right font-bold mt-2">
                合計金額: ￥{total.toLocaleString()}
              </div>

              {/* ✅ 発注書ボタン */}
              <button
                onClick={() =>
                  window.open(
                    `https://us-central1-product-master-f5fb0.cloudfunctions.net/createInvoice?orderId=${order.id}`,
                    '_blank'
                  )
                }
                className="mt-3 text-sm text-blue-600 underline"
              >
                🧾 発注書を見る・送る
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default OrderHistory;
