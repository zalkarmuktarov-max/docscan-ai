import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("analyses")
    .select("id, filename, file_text, status, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const preview = data.file_text?.slice(0, 500) ?? "";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← Назад
          </Link>
          <span style={{ fontSize: 18, fontWeight: 500 }}>
            <span style={{ color: "var(--accent-blue)" }}>Doc</span>
            <span style={{ color: "var(--text-primary)" }}>Scan AI</span>
          </span>
        </header>

        {/* File info card */}
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            border: "0.5px solid var(--border-light)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 6px" }}>
            Файл
          </p>
          <p
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 4px",
            }}
          >
            {data.filename}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
            Статус:{" "}
            <span style={{ color: "var(--success)", fontWeight: 500 }}>
              {data.status}
            </span>
          </p>
        </div>

        {/* Text preview card */}
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            border: "0.5px solid var(--border-light)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 12px",
            }}
          >
            Извлечённый текст (первые 500 символов)
          </p>
          {preview ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {preview}
              {(data.file_text?.length ?? 0) > 500 && (
                <span style={{ color: "var(--text-tertiary)" }}>
                  {" "}…[ещё {(data.file_text!.length - 500).toLocaleString("ru")} символов]
                </span>
              )}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>
              Текст не извлечён
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
