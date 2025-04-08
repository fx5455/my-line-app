import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CartPage = ({ companyName }) => {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
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

      const userId = localStorage.getItem('lineUserId'); // ログイン済ユーザーID

      const docRef = await addDoc(collection(db, 'orders'), {
        companyName,
        userId,
        deliveryLocation,
        siteName,
        personName,
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        orderedAt: serverTimestamp()
      });

      clearCart();
      navigate('/complete', { state: { orderId: docRef.id } });
    } catch (error) {
      console.error('注文エラー:', error);
      alert('発注に失敗しました');
    }
  };

  if (cartItems.length === 0) {
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
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold">🛒 カート内容</h2>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-blue-600 underline"
        >
          商品一覧に戻る
        </button>
      </div>

      {cartItems.map(item => (
        <div key={item.id} className="border p-4 rounded mb-2 shadow">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">{item.name}</p>
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
            </div>
          </div>
        </div>
      ))}

      <hr className="my-4" />

      {/* 納品先の選択 */}
      <div className="mb-4">
        <label className="block font-bold mb-1">納品方法を選択：</label>
        <div className="flex flex-col space-y-1">
          <label>
            <input
              type="radio"
              value="お店引取"
              checked={deliveryOption === 'お店引取'}
              onChange={() => setDeliveryOption('お店引取')}
              className="mr-2"
            />
            お店引取
          </label>
          <label>
            <input
              type="radio"
              value="会社入れ"
              checked={deliveryOption === '会社入れ'}
              onChange={() => setDeliveryOption('会社入れ')}
              className="mr-2"
            />
            会社入れ
          </label>
          <label>
            <input
              type="radio"
              value="その他"
              checked={deliveryOption === 'その他'}
              onChange={() => setDeliveryOption('その他')}
              className="mr-2"
            />
            その他（現場など）
          </label>
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

      {/* 現場名 */}
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

      {/* 担当者 */}
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

      <button
        onClick={handleOrder}
        className="bg-blue-600 text-white px-6 py-2 rounded mt-4 w-full"
      >
        発注する
      </button>
    </div>
  );
};

export default CartPage;
