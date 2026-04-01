import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { extractText } from "@/lib/pdf";
import type { AnalysisResult } from "@/types/analysis";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const SYSTEM_PROMPT = `Ты — юридический AI-ассистент. Проанализируй текст договора и верни результат строго в JSON формате.

Задача:
1. Определи тип договора
2. Извлеки стороны и их роли
3. Найди ключевые суммы, сроки, условия оплаты
4. Перечисли основные обязательства каждой стороны
5. Выяви все потенциальные риски и "красные флаги" для подписанта:
   — скрытые штрафы
   — автопролонгация
   — одностороннее изменение условий
   — невыгодные условия расторжения
   — размытые формулировки ответственности
   — отсутствие важных пунктов
6. Оцени общий уровень риска: "green" (безопасно), "yellow" (требует внимания), "red" (высокий риск)

Верни ТОЛЬКО валидный JSON без маркдауна, без \`\`\`json, без пояснений. Формат:
{
  "document_type": "string",
  "traffic_light": "green" | "yellow" | "red",
  "traffic_label": "string — краткое пояснение статуса",
  "parties": [{ "role": "string", "name": "string" }],
  "key_terms": [{ "label": "string", "value": "string" }],
  "obligations": [{ "party": "string", "color": "blue" | "green", "text": "string" }],
  "risks": [{ "text": "string — краткое описание + номер пункта", "severity": "high" | "medium" | "low", "details": "string — подробное объяснение", "clause": "string — номер пункта" }],
  "summary": "string — 2-3 предложения общая оценка",
  "suggested_questions": ["string", "string", "string"] — ровно 3 конкретных вопроса которые пользователь мог бы задать по этому документу, со ссылками на реальные пункты и условия договора
}`;

async function analyzeWithClaude(fileText: string): Promise<AnalysisResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: fileText }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  // Убираем возможные markdown-обёртки на случай если модель всё же добавила
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as AnalysisResult;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Файл превышает 20 МБ" }, { status: 400 });
    }

    // 1. Извлекаем текст
    const buffer = Buffer.from(await file.arrayBuffer());
    let fileText = "";
    try {
      fileText = await extractText(buffer);
    } catch {
      return NextResponse.json(
        { error: "Не удалось извлечь текст из файла. Проверьте формат PDF." },
        { status: 422 }
      );
    }

    if (!fileText.trim()) {
      return NextResponse.json(
        { error: "PDF не содержит текста (возможно, отсканирован как изображение)." },
        { status: 422 }
      );
    }

    // 2. Создаём запись со статусом processing
    const supabase = getServiceClient();
    const { data: row, error: insertError } = await supabase
      .from("analyses")
      .insert({ filename: file.name, file_text: fileText, status: "processing" })
      .select("id")
      .single();

    if (insertError || !row) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Ошибка базы данных" }, { status: 500 });
    }

    // 3. Анализируем через Claude
    let result: AnalysisResult;
    try {
      result = await analyzeWithClaude(fileText);
    } catch (err) {
      await supabase.from("analyses").update({ status: "error" }).eq("id", row.id);
      console.error("Claude API error:", err);
      return NextResponse.json({ error: "Ошибка AI-анализа" }, { status: 502 });
    }

    // 4. Сохраняем результат
    const { error: updateError } = await supabase
      .from("analyses")
      .update({ result, status: "done" })
      .eq("id", row.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: "Ошибка сохранения результата" }, { status: 500 });
    }

    return NextResponse.json({ id: row.id, status: "done", result });
  } catch (err) {
    console.error("Analyze route error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
