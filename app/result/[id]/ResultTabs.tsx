"use client";

import Link from "next/link";
import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  analysisId: string;
  filename: string;
  result: AnalysisResult;
}

export default function ResultTabs({ analysisId, filename, result }: Props) {
  const [tab, setTab] = useState<"analysis" | "chat">("analysis");
  const [chatQuestion, setChatQuestion] = useState<string | null>(null);

  const handleRiskClick = (riskText: string) => {
    setChatQuestion(`Расскажи подробнее про: «${riskText}». Как защититься?`);
    setTab("chat");
  };

  return (
    <>
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Шапка */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-[13px] transition-colors"
            style={{ color: '#8892a4' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#00e5ff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8892a4')}>
            ← Назад
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[16px] font-semibold">
                <span className="text-[#f0f0f0]">Cognit</span>
                <span style={{ color: '#00e5ff' }}>AI</span>
              </div>
              <div className="text-[10px]" style={{ color: '#8892a4' }}>DocScan</div>
            </div>
          </div>
        </header>

        {/* Имя файла + светофор */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] truncate" style={{ color: '#8892a4' }}>{filename}</p>
          <TrafficLight value={result.traffic_light} label={result.traffic_label} />
        </div>

        {/* Табы */}
        <div className="flex gap-6 mb-6" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          {(['analysis', 'chat'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="pb-3 text-[14px] font-medium transition-colors -mb-px"
              style={{
                color: tab === t ? '#f0f0f0' : '#8892a4',
                borderBottom: tab === t ? '2px solid #00e5ff' : '2px solid transparent',
              }}>
              {t === 'analysis' ? 'Разбор' : 'Чат с документом'}
            </button>
          ))}
        </div>

        {/* ── Таб: Разбор ── */}
        {tab === 'analysis' && (
          <div className="flex flex-col gap-4">

            {/* Карточка 1 — Основная информация */}
            <Card>
              <Label>Тип документа</Label>
              <p className="text-[16px] font-medium text-[#f0f0f0] mb-4">{result.document_type}</p>
              <div className="grid grid-cols-2 gap-3">
                {result.parties.slice(0, 2).map(p => (
                  <MetaCell key={p.role} label={p.role} value={p.name} />
                ))}
                {result.key_terms.slice(0, 2).map(t => (
                  <MetaCell key={t.label} label={t.label} value={t.value} />
                ))}
              </div>
              {result.summary && (
                <p className="mt-4 text-[13px] leading-relaxed" style={{ color: '#8892a4' }}>{result.summary}</p>
              )}
            </Card>

            {/* Карточка 2 — Обязательства */}
            {result.obligations?.length > 0 && (
              <Card>
                <p className="text-[14px] font-medium text-[#f0f0f0] mb-4">Ключевые обязательства</p>
                <ul className="flex flex-col gap-3">
                  {result.obligations.map((o, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]"
                        style={{ backgroundColor: o.color === 'blue' ? '#00e5ff' : '#4ade80' }} />
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: '#4b5563' }}>
                          {o.party}
                        </span>
                        <p className="text-[13px] leading-[1.5] mt-0.5" style={{ color: '#8892a4' }}>{o.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Карточка 3 — Риски */}
            {result.risks?.length > 0 && (
              <Card>
                <p className="text-[14px] font-medium text-[#f0f0f0] mb-4">
                  Риски и красные флаги
                  <span className="ml-2 text-[12px] font-normal" style={{ color: '#f87171' }}>
                    {result.risks.length}
                  </span>
                </p>
                <ul className="flex flex-col gap-2">
                  {result.risks.map((r, i) => (
                    <li key={i} onClick={() => handleRiskClick(r.text)}
                      className="rounded-[8px] px-3 py-2.5 flex items-start gap-2.5 cursor-pointer transition-all"
                      style={{ backgroundColor: 'rgba(220,38,38,0.12)', border: '0.5px solid rgba(248,113,113,0.15)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.12)')}
                      title="Нажмите чтобы спросить AI об этом риске">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="shrink-0 mt-px">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <div className="flex-1">
                        <p className="text-[13px] leading-[1.5]" style={{ color: '#f87171' }}>{r.text}</p>
                        {r.details && (
                          <p className="text-[12px] mt-0.5 leading-snug opacity-70" style={{ color: '#f87171' }}>{r.details}</p>
                        )}
                      </div>
                      <span className="text-[11px] shrink-0 mt-0.5 opacity-40" style={{ color: '#f87171' }}>→ спросить</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* ── Таб: Чат ── */}
        {tab === 'chat' && (
          <ChatPanel
            analysisId={analysisId}
            initialQuestion={chatQuestion}
            suggestedQuestions={result.suggested_questions}
            risks={result.risks}
          />
        )}
      </div>
    </>
  );
}

/* ── Sub-components ── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] p-5"
      style={{ backgroundColor: '#111827', border: '0.5px solid rgba(255,255,255,0.08)' }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] mb-1" style={{ color: '#8892a4' }}>{children}</p>;
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] p-3" style={{ backgroundColor: '#1a2332' }}>
      <p className="text-[12px] mb-1" style={{ color: '#8892a4' }}>{label}</p>
      <p className="text-[14px] font-medium leading-snug text-[#f0f0f0]">{value}</p>
    </div>
  );
}

function TrafficLight({ value, label }: { value: string; label: string }) {
  const map = {
    green:  { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(74,222,128,0.3)',  color: '#4ade80', icon: '✓', fallback: 'Безопасно' },
    yellow: { bg: 'rgba(234,179,8,0.12)',   border: 'rgba(251,191,36,0.3)',  color: '#fbbf24', icon: '!', fallback: 'Требует внимания' },
    red:    { bg: 'rgba(220,38,38,0.12)',   border: 'rgba(248,113,113,0.3)', color: '#f87171', icon: '⚠', fallback: 'Высокий риск' },
  } as const;
  const cfg = map[value as keyof typeof map] ?? map.yellow;
  return (
    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium shrink-0"
      style={{ backgroundColor: cfg.bg, border: `0.5px solid ${cfg.border}`, color: cfg.color }}>
      <span>{cfg.icon}</span>
      {label || cfg.fallback}
    </span>
  );
}
