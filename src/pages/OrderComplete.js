import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const OrderComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  const companyName = localStorage.getItem('companyName');

  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrderData(docSnap.data());
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!orderData) {
    return (
      <div className="p-4 text-center">
        <p>発注内容を読み込み中です...</p>
      </div>
    );
  }

  const orderedAt = orderData.orderedAt?.toDate?.().toLocaleString('ja-JP') || '';

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">✅ 発注が完了しました！</h1>

      <p className="text-gray-700 mb-2">ありがとうございました。</p>

      {companyName && <p className="text-sm mb-1">発注元：{companyName}</p>}
      <p className="text-sm mb-1">注文番号：<span className="font-mono">{orderId}</span></p>

      {/* ✅ 追加表示項目 */}
      {orderData.siteName && (
        <p className="text-sm mb-1">現場名：{orderData.siteName}</p>
      )}
      {orderData.personName && (
        <p className="text-sm mb-1">担当者：{orderData.personName}</p>
      )}
      {orderData.deliveryLocation && (
        <p className="text-sm mb-1">納品場所：{orderData.deliveryLocation}</p>
      )}

      <p className="text-sm text-gray-500 mb-4">発注日時：{orderedAt}</p>

      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
      >
        商品一覧に戻る
      </button>
    </div>
  );
};

export default OrderComplete;
