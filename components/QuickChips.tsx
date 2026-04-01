"use client";

interface QuickChipsProps {
  onSelect: (text: string) => void;
}

const CHIPS = [
  "Как отменить автопролонгацию?",
  "Снизить штраф за расторжение?",
  "Что стоит изменить перед подписанием?",
];

export default function QuickChips({ onSelect }: QuickChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {CHIPS.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          className="px-3 py-1.5 rounded-full text-[12px] text-[#6b6b6b] bg-white
            border border-[rgba(0,0,0,0.15)] transition-colors
            hover:border-[#2563eb] hover:text-[#2563eb]"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
