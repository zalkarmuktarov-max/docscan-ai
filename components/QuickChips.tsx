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
          className="px-3 py-1.5 rounded-full text-[12px] text-[#6b6b6b] bg-white
            border border-[rgba(0,0,0,0.15)] transition-colors text-left
            hover:border-[#2563eb] hover:text-[#2563eb]"
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
