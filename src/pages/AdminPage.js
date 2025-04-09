// src/pages/AdminPage.js
import React from 'react';

const AdminPage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛠 管理画面</h1>
      <p className="text-gray-700 mb-6">ここではすべての顧客の注文ステータス管理などを行います。</p>

      {/* 今後ここに注文一覧やステータス更新フォームなどを追加 */}
      <div className="border p-4 rounded bg-gray-50 text-gray-600">
        🚧 現在準備中のセクションです。
      </div>
    </div>
  );
};

export default AdminPage;