'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NeuralBackground from '@/components/NeuralBackground';

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setError(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setError(null); }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true); setError(null); setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => p >= 85 ? 85 : p + Math.random() * 12);
    }, 400);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Ошибка анализа');
      clearInterval(interval); setProgress(100);
      await new Promise(r => setTimeout(r, 300));
      router.push(`/result/${json.id}`);
    } catch (err: unknown) {
      clearInterval(interval); setProgress(0);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsLoading(false);
    }
  };

  const fileExt = file?.name.split('.').pop()?.toUpperCase() ?? 'FILE';

  return (
    <>
      <NeuralBackground />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-6 relative" style={{ zIndex: 1 }}>
        <div className="w-full max-w-[640px]">

          {/* Logo */}
          <header className="flex items-start justify-between mb-10">
            <div>
              <div className="text-[20px] font-semibold tracking-tight">
                <span className="text-[#f0f0f0]">Cognit</span>
                <span style={{ color: '#00e5ff' }}>AI</span>
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: '#8892a4' }}>DocScan</div>
            </div>
            <span className="text-[12px] mt-1" style={{ color: '#4b5563' }}>v0.1 MVP</span>
          </header>

          {/* Заголовок */}
          <div className="mb-8 text-center">
            <h1 className="text-[28px] font-semibold text-[#f0f0f0] mb-2">
              Анализ договора с помощью AI
            </h1>
            <p className="text-[14px]" style={{ color: '#8892a4' }}>
              Загрузите PDF — получите структурированный разбор рисков, сторон и обязательств за секунды
            </p>
          </div>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Upload zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            className="rounded-[12px] py-12 px-6 text-center cursor-pointer select-none transition-all duration-200"
            style={{
              border: `1.5px dashed ${isDragging ? '#00e5ff' : 'rgba(0,229,255,0.3)'}`,
              backgroundColor: isDragging ? 'rgba(0,229,255,0.05)' : 'rgba(17,24,39,0.6)',
              boxShadow: isDragging ? '0 0 30px rgba(0,229,255,0.08)' : 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
              </svg>
            </div>
            <p className="text-[16px] font-medium text-[#f0f0f0] mb-1.5">Загрузите договор</p>
            <p className="text-[13px]" style={{ color: '#8892a4' }}>PDF до 20 МБ — кликните или перетащите</p>
          </div>

          {/* File card */}
          {file && (
            <div className="mt-4 rounded-[8px] px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: '#111827', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '0.5px solid rgba(220,38,38,0.3)' }}>
                <span className="text-[11px] font-medium" style={{ color: '#f87171' }}>{fileExt}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#f0f0f0] truncate">{file.name}</p>
                <p className="text-[12px] mt-0.5" style={{ color: '#8892a4' }}>
                  {(file.size / 1024 / 1024).toFixed(1)} МБ
                </p>
              </div>
              {/* Remove file */}
              <button onClick={e => { e.stopPropagation(); setFile(null); }}
                className="text-[20px] leading-none transition-colors"
                style={{ color: '#4b5563' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}>
                ×
              </button>
            </div>
          )}

          {/* Progress bar */}
          {isLoading && (
            <div className="mt-4 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00e5ff, #0088cc)' }} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 px-4 py-3 rounded-[8px] text-[13px]"
              style={{ backgroundColor: 'rgba(220,38,38,0.12)', border: '0.5px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}

          {/* Analyze button */}
          {file && (
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full mt-5 py-3 rounded-[8px] text-[15px] font-medium text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: isLoading ? 'rgba(0,229,255,0.3)' : 'linear-gradient(135deg, #00e5ff, #0088cc)',
                cursor: isLoading ? 'default' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 0 20px rgba(0,229,255,0.2)',
              }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(0,229,255,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = isLoading ? 'none' : '0 0 20px rgba(0,229,255,0.2)'; }}
            >
              {isLoading ? <><Spinner />Анализируем...</> : 'Анализировать'}
            </button>
          )}
        </div>
      </main>
    </>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
