"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import QuickChips from "./QuickChips";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  analysisId: string;
  initialQuestion?: string | null;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Я проанализировал ваш договор. Задавайте любые вопросы по содержанию — я отвечу со ссылками на конкретные пункты.",
};

export default function ChatPanel({ analysisId, initialQuestion }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  // Автоматически отправляем вопрос из риска
  useEffect(() => {
    if (initialQuestion && !initialSent.current) {
      initialSent.current = true;
      sendMessage(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  // Скролл вниз при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis_id: analysisId, message: trimmed }),
      });
      const json = await res.json();
      const reply = res.ok ? json.reply : "Ошибка: " + (json.error ?? "неизвестная ошибка");
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Не удалось получить ответ. Проверьте соединение." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="bg-white border-[0.5px] border-[rgba(0,0,0,0.08)] rounded-[12px] p-4 flex flex-col min-h-[380px]">
      {/* Сообщения */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}

        {/* Индикатор набора */}
        {isTyping && (
          <div className="flex items-end gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#eff6ff] flex items-center justify-center text-[11px] font-medium text-[#2563eb] shrink-0">
              AI
            </div>
            <div className="bg-[#f8f8f6] px-3.5 py-2.5 rounded-[2px_12px_12px_12px] flex gap-1.5 items-center">
              {[0, 150, 300].map(delay => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-[#9b9b9b]"
                  style={{ animation: `blink 1.2s infinite ${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Быстрые вопросы */}
      <QuickChips onSelect={sendMessage} />

      {/* Поле ввода */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Спросите про договор..."
          className="flex-1 px-3.5 py-2.5 text-[14px] text-[#1a1a1a] bg-white
            border-[0.5px] border-[rgba(0,0,0,0.08)] rounded-[8px] outline-none
            focus:border-[#2563eb] transition-colors placeholder:text-[#9b9b9b]"
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center shrink-0
            disabled:opacity-40 transition-opacity hover:bg-[#1d4ed8]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>

      {/* Keyframe для точек */}
      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
