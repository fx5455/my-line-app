import React, { useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc
} from 'firebase/firestore';

const Login = ({ onLogin }) => {
  const [companyCode, setCompanyCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const lineUserId = 'TEST-LINE-ID-123'; // ✅ 仮のLINE ID（後で置き換え）

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 🔍 authMaster から会社情報を取得
      const q = query(
        collection(db, 'authMaster'),
        where('companyCode', '==', companyCode),
        where('password', '==', password)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('認証に失敗しました');
        return;
      }

      const data = snapshot.docs[0].data();

      // 🔄 既存のユーザーデータ（isAdmin等）取得
      const userRef = doc(db, 'users', lineUserId);
      const existingSnap = await getDoc(userRef);
      const existingData = existingSnap.exists() ? existingSnap.data() : {};

      const isAdmin = data.isAdmin ?? existingData.isAdmin ?? false;

      // ✅ Firestoreに保存（merge指定で上書き防止）
      await setDoc(
        userRef,
        {
          userId: lineUserId,
          companyCode,
          companyName: data.companyName,
          address: data.address || '',
          tel: data.tel || '',
          createdAt: existingData.createdAt || new Date(),
          isAdmin // ← ここ重要！
        },
        { merge: true }
      );

      // ✅ ローカルストレージに保存
      localStorage.setItem('lineUserId', lineUserId);
      localStorage.setItem('companyName', data.companyName);
      localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');

      // 🎉 親に通知
      onLogin(data.companyName, isAdmin);
    } catch (err) {
      console.error('ログイン失敗:', err);
      setError('通信エラーが発生しました');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">会社コードでログイン</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="会社コード"
          className="w-full border p-2 mb-2"
          value={companyCode}
          onChange={(e) => setCompanyCode(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワード"
          className="w-full border p-2 mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          ログイン
        </button>
      </form>
    </div>
  );
};

export default Login;
