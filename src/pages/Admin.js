// src/pages/Admin.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛠 管理者メニュー</h1>

      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/orders')}
          className="block w-full text-left bg-blue-600 text-white px-4 py-2 rounded"
        >
          📦 注文ステータス管理
        </button>
        <button
          onClick={() => navigate('/admin/notices')}
          className="block w-full text-left bg-green-600 text-white px-4 py-2 rounded"
        >
          📣 お知らせ管理
        </button>
      </div>
    </div>
  );
};

export default Admin;
