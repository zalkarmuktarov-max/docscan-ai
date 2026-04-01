'use client';

import { useRef, useState } from 'react';

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: 20 }}>
      <h1>DocScan AI</h1>
      <div
        onClick={() => { console.log('clicked'); inputRef.current?.click(); }}
        style={{ cursor: 'pointer', border: '2px dashed #999', padding: 48, textAlign: 'center', borderRadius: 12, marginTop: 24 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            console.log('file selected', e.target.files);
            if (e.target.files?.[0]) setFile(e.target.files[0]);
          }}
        />
        <p>Кликни сюда чтобы загрузить PDF</p>
      </div>
      {file && (
        <div style={{ marginTop: 16 }}>
          <p>{file.name} — {(file.size / 1024 / 1024).toFixed(1)} МБ</p>
          <button onClick={() => alert('Работает!')} style={{ marginTop: 8, padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Анализировать
          </button>
        </div>
      )}
    </main>
  );
}
