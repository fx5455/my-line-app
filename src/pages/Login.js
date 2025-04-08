// src/pages/Login.js
import React, { useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc
} from 'firebase/firestore';

const Login = ({ onLogin }) => {
  const [companyCode, setCompanyCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const userId = 'TEST-LINE-ID'; // 実際は LINEログインで取得

    try {
      // 🔍 ① 認証マスターを検索
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

      // ✅ ② users に LINEユーザーIDをドキュメントIDとして保存
      await setDoc(doc(db, 'users', userId), {
        userId,
        companyCode,
        companyName: data.companyName,
        address: data.address || '',
        tel: data.tel || '',
        createdAt: new Date()
      });

      // 🔑 ③ ローカルストレージにユーザーID保存（自動ログイン対応）
      localStorage.setItem('lineUserId', userId);

      // 🎉 ログイン成功通知（親へ）
      onLogin(data.companyName);
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          ログイン
        </button>
      </form>
    </div>
  );
};

export default Login;
