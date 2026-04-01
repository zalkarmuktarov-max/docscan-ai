import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { analysis_id, message } = await req.json() as {
      analysis_id: string;
      message: string;
    };

    if (!analysis_id || !message?.trim()) {
      return NextResponse.json({ error: "Не передан analysis_id или message" }, { status: 400 });
    }

    const supabase = getServiceClient();

    // 1. Загружаем запись анализа
    const { data: analysis, error: fetchError } = await supabase
      .from("analyses")
      .select("file_text, result")
      .eq("id", analysis_id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ error: "Анализ не найден" }, { status: 404 });
    }

    // 2. Загружаем историю сообщений (последние 20)
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("analysis_id", analysis_id)
      .order("created_at", { ascending: true })
      .limit(20);

    // 3. Системный промпт из спецификации
    const systemPrompt = `Ты — юридический AI-ассистент. Тебе предоставлен текст договора. Отвечай на вопросы пользователя строго на основе содержания этого документа.

Правила:
- Ссылайся на конкретные пункты договора (п. 3.1, п. 7.2 и т.д.)
- Если вопрос выходит за рамки документа, скажи об этом
- Давай практичные рекомендации, но уточняй что это не юридическая консультация
- Отвечай на русском языке
- Отвечай кратко и по делу, не более 3-4 абзацев

Текст договора:
${analysis.file_text ?? "(текст недоступен)"}

Предыдущий анализ:
${analysis.result ? JSON.stringify(analysis.result, null, 2) : "(анализ недоступен)"}`;

    // 4. Формируем историю сообщений для API
    const messages: Anthropic.MessageParam[] = [
      ...(history ?? []).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content as string,
      })),
      { role: "user", content: message },
    ];

    // 5. Вызов Claude
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    // 6. Сохраняем вопрос и ответ
    await supabase.from("chat_messages").insert([
      { analysis_id, role: "user",      content: message },
      { analysis_id, role: "assistant", content: reply   },
    ]);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
