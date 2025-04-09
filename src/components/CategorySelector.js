// src/components/CategorySelector.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CategorySelector = ({ onCategoryChange }) => {
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const parents = snapshot.docs.map(doc => doc.id);
      setParentCategories(parents);
    };
    fetchCategories();
  }, []);

  const handleParentChange = async (e) => {
    const parent = e.target.value;
    setSelectedParent(parent);
    setSelectedChild('');
    onCategoryChange(parent); // 子なしでも絞り込み可能

    const docSnap = await getDoc(doc(db, 'categories', parent));
    const data = docSnap.data();
    setChildCategories(data?.children || []);
  };

  const handleChildChange = (e) => {
    const child = e.target.value;
    setSelectedChild(child);
    onCategoryChange(child); // 子カテゴリで絞り込み
  };

  return (
    <div className="flex gap-2">
      <select
        value={selectedParent}
        onChange={handleParentChange}
        className="border p-2"
      >
        <option value="">親カテゴリを選択</option>
        {parentCategories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {childCategories.length > 0 && (
        <select
          value={selectedChild}
          onChange={handleChildChange}
          className="border p-2"
        >
          <option value="">子カテゴリを選択</option>
          {childCategories.map((child, idx) => (
            <option key={idx} value={child}>{child}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CategorySelector;
