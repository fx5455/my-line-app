// src/pages/Notices.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import dayjs from 'dayjs';

const Notices = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      const q = query(
        collection(db, 'notices'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotices(data);
    };

    fetchNotices();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📢 お知らせ一覧</h2>
      {notices.length === 0 ? (
        <p>お知らせはまだありません。</p>
      ) : (
        <ul className="space-y-4">
          {notices.map(notice => (
            <li key={notice.id} className="border p-4 rounded shadow">
              <div className="text-sm text-gray-500 mb-1">
                投稿日: {notice.createdAt?.toDate?.().toLocaleDateString('ja-JP') || '日付不明'}
              </div>
              <h3 className="font-semibold text-lg">{notice.title}</h3>
              <p className="text-sm mt-1">{notice.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notices;
