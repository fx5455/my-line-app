import React, { useEffect, useState } from 'react';
import liff from '@line/liff';

const LIFF_ID = "あなたのLIFF IDをここに";

function App() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    liff.init({ liffId: LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          liff.getProfile().then(setProfile);
        }
      })
      .catch((err) => console.error('LIFF初期化エラー:', err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>LINEログイン完了</h2>
      {profile && (
        <div>
          <p>こんにちは、{profile.displayName} さん</p>
          <p>ユーザーID: {profile.userId}</p>
        </div>
      )}
    </div>
  );
}

export default App;