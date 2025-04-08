import React, { useState } from 'react';

const GasTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const testGASConnection = async () => {
    setResult(null);
    setError('');

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbyE2LGDT8yW67ELHtmzmSgu96eQVRDt3QRsIP8bIW81LgukLG2sSZz4J_1dqBkvySHi/exec', {
        method: 'POST',
        headers: {
          // シンプルなヘッダーにすることでプリフライトを回避
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({ test: 'Reactから送信' }),
      });

      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      const data = await response.json();
      console.log('通信成功:', data);
      setResult(data);
      alert('通信成功: ' + JSON.stringify(data));
    } catch (err) {
      console.error('通信エラー:', err);
      setError('通信失敗: ' + err.message);
      alert('通信失敗: ' + err.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">GAS 通信テスト</h2>
      <button onClick={testGASConnection} className="bg-blue-600 text-white px-4 py-2 rounded">
        テスト送信
      </button>
      {result && <pre className="mt-4 text-green-800">{JSON.stringify(result, null, 2)}</pre>}
      {error && <p className="mt-4 text-red-600">エラー: {error}</p>}
    </div>
  );
};

export default GasTest;
