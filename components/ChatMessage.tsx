interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isAI = role === "assistant";

  return (
    <div className={`flex items-end gap-2.5 ${isAI ? "" : "flex-row-reverse"}`}>
      {/* Аватар */}
      <div
        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-medium ${
          isAI
            ? "bg-[#eff6ff] text-[#2563eb]"
            : "bg-[#f8f8f6] text-[#6b6b6b]"
        }`}
      >
        {isAI ? "AI" : "Вы"}
      </div>

      {/* Бабл */}
      <div
        className={`max-w-[75%] px-3 py-2 text-[13px] leading-[1.6] whitespace-pre-wrap ${
          isAI
            ? "bg-[#f8f8f6] text-[#1a1a1a]"
            : "bg-[#eff6ff] text-[#2563eb]"
        }`}
        style={{
          borderRadius: isAI ? "2px 12px 12px 12px" : "12px 2px 12px 12px",
        }}
      >
        {content}
      </div>
    </div>
  );
}
