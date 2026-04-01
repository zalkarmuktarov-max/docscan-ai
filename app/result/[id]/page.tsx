import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { AnalysisResult } from "@/types/analysis";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("analyses")
    .select("id, filename, result, status")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const result = data.result as AnalysisResult | null;

  if (!result) {
    return (
      <main className="min-h-screen bg-[#f1f0ec] flex items-center justify-center">
        <p className="text-[#6b6b6b] text-[14px]">Анализ ещё выполняется...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f1f0ec] px-4 py-8">
      <div className="w-full max-w-[720px] mx-auto">

        {/* Шапка */}
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors flex items-center gap-1"
          >
            ← Назад
          </Link>
          <TrafficLight value={result.traffic_light} label={result.traffic_label} />
        </header>

        {/* Имя файла */}
        <p className="text-[13px] text-[#9b9b9b] mb-6 truncate">{data.filename}</p>

        {/* Таб-заголовок (только "Разбор" активен, чат — День 4) */}
        <div className="border-b border-[rgba(0,0,0,0.08)] mb-6">
          <div className="flex gap-6">
            <button className="pb-3 text-[14px] font-medium text-[#1a1a1a] border-b-2 border-[#2563eb] -mb-px">
              Разбор
            </button>
            <button className="pb-3 text-[14px] text-[#9b9b9b] cursor-not-allowed">
              Чат с документом
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">

          {/* Карточка 1 — Основная информация */}
          <div className="bg-white border-[0.5px] border-[rgba(0,0,0,0.08)] rounded-[12px] p-5">
            <p className="text-[12px] text-[#9b9b9b] mb-1">Тип документа</p>
            <p className="text-[16px] font-medium text-[#1a1a1a]">{result.document_type}</p>

            {/* Мета-сетка */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Стороны */}
              {result.parties.slice(0, 2).map((p) => (
                <div key={p.role} className="bg-[#f8f8f6] rounded-[8px] p-3">
                  <p className="text-[12px] text-[#9b9b9b] mb-1">{p.role}</p>
                  <p className="text-[14px] font-medium text-[#1a1a1a] leading-snug">{p.name}</p>
                </div>
              ))}
              {/* Ключевые условия */}
              {result.key_terms.slice(0, 2).map((t) => (
                <div key={t.label} className="bg-[#f8f8f6] rounded-[8px] p-3">
                  <p className="text-[12px] text-[#9b9b9b] mb-1">{t.label}</p>
                  <p className="text-[14px] font-medium text-[#1a1a1a] leading-snug">{t.value}</p>
                </div>
              ))}
            </div>

            {/* Резюме */}
            {result.summary && (
              <p className="mt-4 text-[13px] text-[#6b6b6b] leading-relaxed">{result.summary}</p>
            )}
          </div>

          {/* Карточка 2 — Обязательства */}
          {result.obligations?.length > 0 && (
            <div className="bg-white border-[0.5px] border-[rgba(0,0,0,0.08)] rounded-[12px] p-5">
              <p className="text-[14px] font-medium text-[#1a1a1a] mb-4">Ключевые обязательства</p>
              <ul className="flex flex-col gap-3">
                {result.obligations.map((o, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]"
                      style={{ backgroundColor: o.color === "blue" ? "#2563eb" : "#16a34a" }}
                    />
                    <div>
                      <span className="text-[11px] font-medium text-[#9b9b9b] uppercase tracking-wide">
                        {o.party}
                      </span>
                      <p className="text-[13px] text-[#6b6b6b] leading-[1.5] mt-0.5">{o.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Карточка 3 — Риски */}
          {result.risks?.length > 0 && (
            <div className="bg-white border-[0.5px] border-[rgba(0,0,0,0.08)] rounded-[12px] p-5">
              <p className="text-[14px] font-medium text-[#1a1a1a] mb-4">
                Риски и красные флаги
                <span className="ml-2 text-[12px] font-normal text-[#dc2626]">
                  {result.risks.length}
                </span>
              </p>
              <ul className="flex flex-col gap-2">
                {result.risks.map((r, i) => (
                  <li
                    key={i}
                    className="bg-[#fef2f2] rounded-[8px] px-3 py-2.5 flex items-start gap-2.5 cursor-pointer hover:bg-[#fee2e2] transition-colors"
                    title={r.details}
                  >
                    {/* Иконка треугольника */}
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="shrink-0 mt-px"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <p className="text-[13px] text-[#dc2626] leading-[1.5]">{r.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

/* ── TrafficLight badge ── */
function TrafficLight({ value, label }: { value: string; label: string }) {
  const map = {
    green:  { bg: "#f0fdf4", text: "#16a34a", icon: <CheckIcon />, fallback: "Безопасно" },
    yellow: { bg: "#fffbeb", text: "#d97706", icon: <WarnIcon />,  fallback: "Требует внимания" },
    red:    { bg: "#fef2f2", text: "#dc2626", icon: <DangerIcon />, fallback: "Высокий риск" },
  } as const;

  const cfg = map[value as keyof typeof map] ?? map.yellow;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.icon}
      {label || cfg.fallback}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function WarnIcon() {
  return <span className="font-bold text-[13px]">!</span>;
}
function DangerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  );
}
