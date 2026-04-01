'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    setIsLoading(true);
    setError(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => p >= 85 ? 85 : p + Math.random() * 12);
    }, 400);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Ошибка анализа');
      clearInterval(interval);
      setProgress(100);
      await new Promise(r => setTimeout(r, 300));
      router.push(`/result/${json.id}`);
    } catch (err: unknown) {
      clearInterval(interval);
      setProgress(0);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsLoading(false);
    }
  };

  const fileExt = file?.name.split('.').pop()?.toUpperCase() ?? 'FILE';
  const fileSizeMb = file ? (file.size / 1024 / 1024).toFixed(1) : '';

  return (
    <main className="min-h-screen bg-[#f1f0ec] flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-[640px]">

        {/* Шапка */}
        <header className="flex items-center justify-between mb-8">
          <span className="text-[18px] font-medium">
            <span className="text-[#2563eb]">Doc</span>
            <span className="text-[#1a1a1a]">Scan AI</span>
          </span>
          <span className="text-[12px] text-[#9b9b9b]">v0.1 MVP</span>
        </header>

        {/* Скрытый input */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Зона загрузки */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={[
            'rounded-[12px] py-12 px-6 text-center cursor-pointer select-none',
            'border-[1.5px] border-dashed transition-colors duration-150',
            isDragging
              ? 'border-[#2563eb] bg-[#eff6ff]'
              : 'border-[rgba(0,0,0,0.15)] hover:border-[#2563eb]',
          ].join(' ')}
        >
          {/* Иконка */}
          <div className="w-12 h-12 rounded-full bg-[#eff6ff] flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-[#1a1a1a] mb-1.5">Загрузите договор</p>
          <p className="text-[13px] text-[#6b6b6b]">PDF, JPG, PNG до 20 МБ</p>
        </div>

        {/* Карточка файла */}
        {file && (
          <div className="mt-4 bg-white border-[0.5px] border-[rgba(0,0,0,0.08)] rounded-[8px] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#fef2f2] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-medium text-[#dc2626]">{fileExt}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#1a1a1a] truncate">{file.name}</p>
              <p className="text-[12px] text-[#9b9b9b] mt-0.5">{fileSizeMb} МБ</p>
            </div>
          </div>
        )}

        {/* Прогресс-бар */}
        {isLoading && (
          <div className="mt-4 h-1 bg-[rgba(0,0,0,0.08)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="mt-3 px-3.5 py-2.5 bg-[#fef2f2] border-[0.5px] border-[#dc2626] rounded-[8px] text-[13px] text-[#dc2626]">
            {error}
          </div>
        )}

        {/* Кнопка Анализировать */}
        {file && (
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={[
              'w-full mt-5 py-3 rounded-[8px] text-[15px] font-medium text-white',
              'flex items-center justify-center gap-2 transition-transform',
              isLoading ? 'bg-[#93c5fd] cursor-default' : 'bg-[#2563eb] cursor-pointer active:scale-[0.98]',
            ].join(' ')}
          >
            {isLoading ? <><Spinner />Анализируем...</> : 'Анализировать'}
          </button>
        )}

      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
