"use client";

const DEFAULTS = [
  "Как отменить автопролонгацию?",
  "Снизить штраф за расторжение?",
  "Что стоит изменить перед подписанием?",
];

interface QuickChipsProps {
  onSelect: (text: string) => void;
  suggested?: string[];
  riskQuestions?: string[];
}

function ChipRow({ chips, onSelect }: { chips: string[]; onSelect: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          className="px-3 py-1.5 rounded-full text-[12px] transition-colors text-left"
          style={{ color: '#8892a4', border: '0.5px solid rgba(0,229,255,0.2)', backgroundColor: 'transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.1)';
            e.currentTarget.style.color = '#00e5ff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#8892a4';
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

export default function QuickChips({ onSelect, suggested, riskQuestions }: QuickChipsProps) {
  const mainChips = suggested?.length ? suggested : DEFAULTS;

  return (
    <div className="flex flex-col gap-2 mb-3">
      {/* Основные вопросы (из анализа или дефолтные) */}
      <ChipRow chips={mainChips} onSelect={onSelect} />

      {/* Вопросы по рискам */}
      {riskQuestions && riskQuestions.length > 0 && (
        <ChipRow chips={riskQuestions} onSelect={onSelect} />
      )}
    </div>
  );
}
