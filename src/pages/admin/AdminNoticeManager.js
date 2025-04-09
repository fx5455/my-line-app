import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  orderBy,
  query,
} from 'firebase/firestore';

const AdminNoticeManager = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setNotices(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const dateToUse = createdAt ? Timestamp.fromDate(new Date(createdAt)) : serverTimestamp();

    if (editingId) {
      const docRef = doc(db, 'notices', editingId);
      await updateDoc(docRef, { title, content, createdAt: dateToUse });
    } else {
      await addDoc(collection(db, 'notices'), {
        title,
        content,
        createdAt: dateToUse,
      });
    }

    setTitle('');
    setContent('');
    setCreatedAt('');
    setEditingId(null);
    fetchNotices();
  };

  const handleEdit = (notice) => {
    setTitle(notice.title);
    setContent(notice.content);
    setCreatedAt(notice.createdAt?.toDate?.().toISOString().split('T')[0] || '');
    setEditingId(notice.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('削除してもよろしいですか？')) return;
    await deleteDoc(doc(db, 'notices', id));
    fetchNotices();
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🛠 お知らせ管理</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="本文"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full h-24"
        />
        <input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? '更新する' : '追加する'}
        </button>
      </form>

      <ul className="space-y-4">
        {notices.map(notice => (
          <li key={notice.id} className="border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{notice.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{notice.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  投稿日:{' '}
                  {notice.createdAt?.toDate?.().toLocaleDateString?.('ja-JP') || '不明'}
                </p>
              </div>
              <div className="space-x-2 text-sm">
                <button
                  onClick={() => handleEdit(notice)}
                  className="text-blue-600 underline"
                >編集</button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="text-red-600 underline"
                >削除</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminNoticeManager;
