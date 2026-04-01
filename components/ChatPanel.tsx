"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import QuickChips from "./QuickChips";
import type { Risk } from "@/types/analysis";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  analysisId: string;
  initialQuestion?: string | null;
  suggestedQuestions?: string[];
  risks?: Risk[];
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Я проанализировал ваш договор. Задавайте любые вопросы по содержанию — я отвечу со ссылками на конкретные пункты.",
};

export default function ChatPanel({ analysisId, initialQuestion, suggestedQuestions, risks }: ChatPanelProps) {
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
    <div className="rounded-[12px] p-4 flex flex-col min-h-[380px]"
      style={{ backgroundColor: '#111827', border: '0.5px solid rgba(255,255,255,0.08)' }}>
      {/* Сообщения */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}

        {/* Индикатор набора */}
        {isTyping && (
          <div className="flex items-end gap-2.5">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-medium"
              style={{ background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '0.5px solid rgba(0,229,255,0.3)' }}>
              AI
            </div>
            <div className="px-3.5 py-2.5 rounded-[2px_12px_12px_12px] flex gap-1.5 items-center"
              style={{ backgroundColor: '#1a2332', border: '0.5px solid rgba(255,255,255,0.05)' }}>
              {[0, 150, 300].map(delay => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#8892a4', animation: `blink 1.2s infinite ${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Быстрые вопросы */}
      <QuickChips
        onSelect={sendMessage}
        suggested={suggestedQuestions}
        riskQuestions={risks?.map(r => `Как защититься от: ${r.text.replace(/\s*—\s*п\..*$/, "")}?`)}
      />

      {/* Поле ввода */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Спросите про договор..."
          className="flex-1 px-3.5 py-2.5 text-[14px] rounded-[8px] outline-none transition-colors"
          style={{
            backgroundColor: '#1a2332',
            color: '#f0f0f0',
            border: '0.5px solid rgba(255,255,255,0.1)',
          }}
          onFocus={e => (e.currentTarget.style.border = '0.5px solid rgba(0,229,255,0.5)')}
          onBlur={e => (e.currentTarget.style.border = '0.5px solid rgba(255,255,255,0.1)')}
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #00e5ff, #0088cc)' }}
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
