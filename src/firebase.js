// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ✅ Firebaseコンソールからコピーしてください（プロジェクト設定にあるやつ）
const firebaseConfig = {

    apiKey: "AIzaSyCqZsO3x7pKWfNHSi-ddZShAL6AIzBjl14",
  
    authDomain: "product-master-f5fb0.firebaseapp.com",
  
    projectId: "product-master-f5fb0",
  
    storageBucket: "product-master-f5fb0.firebasestorage.app",
  
    messagingSenderId: "382187067923",
  
    appId: "1:382187067923:web:86f49f34947ed3f215bde6",
  
    measurementId: "G-G2150GZGYB"
  
  };
  

// Firebase アプリを初期化
const app = initializeApp(firebaseConfig);

// Firestoreインスタンスを作成
const db = getFirestore(app);

export { db };