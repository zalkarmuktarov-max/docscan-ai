import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { AnalysisResult } from "@/types/analysis";
import ResultTabs from "./ResultTabs";

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
    .select("id, filename, result, status")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const result = data.result as AnalysisResult | null;

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[14px]" style={{ color: '#8892a4' }}>Анализ ещё выполняется...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="w-full max-w-[720px] mx-auto">
        <ResultTabs
          analysisId={data.id}
          filename={data.filename}
          result={result}
        />
      </div>
    </main>
  );
}
