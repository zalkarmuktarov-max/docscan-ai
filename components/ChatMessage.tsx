interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isAI = role === "assistant";
  return (
    <div className={`flex items-end gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Аватар */}
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-medium"
        style={isAI
          ? { background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '0.5px solid rgba(0,229,255,0.3)' }
          : { background: '#1a2332', color: '#8892a4', border: '0.5px solid rgba(255,255,255,0.08)' }
        }
      >
        {isAI ? 'AI' : 'Вы'}
      </div>

      {/* Бабл */}
      <div
        className="max-w-[75%] px-3 py-2 text-[13px] leading-[1.6] whitespace-pre-wrap"
        style={{
          borderRadius: isAI ? '2px 12px 12px 12px' : '12px 2px 12px 12px',
          ...(isAI
            ? { background: '#1a2332', color: '#f0f0f0', border: '0.5px solid rgba(255,255,255,0.05)' }
            : { background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '0.5px solid rgba(0,229,255,0.2)' }
          ),
        }}
      >
        {content}
      </div>
    </div>
  );
}
