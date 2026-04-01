import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractText } from "@/lib/pdf";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    const maxSize = 20 * 1024 * 1024; // 20 МБ
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Файл превышает 20 МБ" },
        { status: 400 }
      );
    }

    // Извлекаем текст из PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let fileText = "";

    try {
      fileText = await extractText(buffer);
    } catch {
      return NextResponse.json(
        { error: "Не удалось извлечь текст из файла. Проверьте формат PDF." },
        { status: 422 }
      );
    }

    // Сохраняем в Supabase
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        filename: file.name,
        file_text: fileText,
        status: "done",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Ошибка сохранения в базу данных" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      status: "done",
      text_preview: fileText.slice(0, 500),
    });
  } catch (err) {
    console.error("Analyze route error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
