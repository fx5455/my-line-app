// src/pages/NoticeList.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';

const NoticeList = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            content: data.content || '',
            createdAt: data.createdAt?.toDate
              ? dayjs(data.createdAt.toDate()).format('YYYY/MM/DD')
              : '日付なし'
          };
        });
        setNotices(results);
      } catch (error) {
        console.error('お知らせの取得に失敗しました:', error);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📄 お知らせ一覧</h2>

      {notices.length === 0 ? (
        <p>お知らせはまだありません。</p>
      ) : (
        <div className="space-y-6">
          {notices.map(notice => (
            <div key={notice.id} className="border-b pb-4">
              <div className="text-sm text-gray-500 mb-1">
                {notice.createdAt}
              </div>
              <div className="text-lg font-semibold mb-1">
                {notice.title}
              </div>
              {notice.content && (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {notice.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeList;
