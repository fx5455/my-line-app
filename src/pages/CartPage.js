// src/pages/CartPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Link を追加
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';

const CartPage = ({ companyName }) => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    updateQuantity,
    saveForLater,
    savedItems = [],
    moveToCart
  } = useCart();
  const navigate = useNavigate();

  const [deliveryOption, setDeliveryOption] = useState('会社入れ');
  const [customAddress, setCustomAddress] = useState('');
  const [siteName, setSiteName] = useState('');
  const [personName, setPersonName] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async () => {
    try {
      const deliveryLocation =
        deliveryOption === 'その他' ? customAddress : deliveryOption;

      const userId = localStorage.getItem('lineUserId');

      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          const productRef = doc(db, 'products', item.id);
          const productSnap = await getDoc(productRef);
          const productData = productSnap.exists() ? productSnap.data() : {};

          return {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: Number(productData.price ?? item.price ?? 0),
            supplier: productData.supplier || '',
            supplierPrice: Number(productData.supplierPrice ?? 0)
          };
        })
      );

      const docRef = await addDoc(collection(db, 'orders'), {
        companyName,
        userId,
        deliveryLocation,
        siteName,
        personName,
        items: enrichedItems,
        orderedAt: serverTimestamp(),
        status: '注文確認中'
      });

      clearCart();
      navigate('/complete', { state: { orderId: docRef.id } });
    } catch (error) {
      console.error('注文エラー:', error);
      alert('発注に失敗しました');
    }
  };

  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">🛒 カート</h2>
        <p>カートに商品がありません。</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          商品一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🛒 カート内容</h2>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-blue-600 underline"
        >
          商品一覧に戻る
        </button>
      </div>

      {/* カート商品 */}
      {cartItems.map(item => (
        <div key={item.id} className="border p-4 rounded mb-2 shadow">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">
                <Link to={`/product/${item.id}`} className="text-blue-600 underline">
                  {item.name}
                </Link>
              </p>
              <p className="text-sm text-gray-500">単価: ¥{item.price.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded-l disabled:opacity-50"
                  disabled={item.quantity <= 1}
                >−</button>
                <span className="px-4">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded-r"
                >＋</button>
              </div>
            </div>
            <div className="text-right">
              <p>小計: ¥{(item.price * item.quantity).toLocaleString()}</p>
              <button onClick={() => removeFromCart(item.id)} className="text-red-600 mt-2">🗑 削除</button>
              <button onClick={() => saveForLater(item)} className="text-yellow-600 mt-2 ml-4">🕒 後で買う</button>
            </div>
          </div>
        </div>
      ))}

      {/* 納品情報 */}
      <div className="mb-4">
        <label className="block font-bold mb-1">納品方法を選択：</label>
        <div className="flex flex-col space-y-1">
          {['お店引取', '会社入れ', 'その他'].map(option => (
            <label key={option}>
              <input
                type="radio"
                value={option}
                checked={deliveryOption === option}
                onChange={() => setDeliveryOption(option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
        {deliveryOption === 'その他' && (
          <input
            type="text"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            placeholder="納品先住所を入力"
            className="mt-2 border p-2 w-full"
          />
        )}
      </div>

      <div className="mb-4">
        <label className="block font-bold mb-1">現場名：</label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="例：〇〇現場"
          className="border p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block font-bold mb-1">担当者：</label>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="例：山田太郎"
          className="border p-2 w-full"
        />
      </div>

      <p className="text-right text-lg font-bold">合計: ¥{total.toLocaleString()}</p>

      {/* 発注ボタン */}
      <button
        onClick={handleOrder}
        className="bg-blue-600 text-white px-6 py-2 rounded mt-4 w-full"
      >
        発注する
      </button>

      {/* 🕒 後で買う商品 */}
      {savedItems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">🕒 後で買う商品</h3>
          {savedItems.map(item => (
            <div key={item.id} className="border p-4 rounded mb-2 bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">
                    <Link to={`/product/${item.id}`} className="text-blue-600 underline">
                      {item.name}
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500">単価: ¥{item.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <button onClick={() => moveToCart(item)} className="text-green-600">
                    カートに戻す
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;
