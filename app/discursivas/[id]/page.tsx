import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { discursiveAttempts } from "@/db/schema";
import { parseFeedback } from "@/lib/discursive-feedback";
import { FeedbackView } from "../feedback-view";

export const dynamic = "force-dynamic";

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) notFound();
  const [attempt] = await db.select().from(discursiveAttempts)
    .where(eq(discursiveAttempts.id, numericId)).limit(1);
  if (!attempt) notFound();
  const feedback = attempt.status === "completed" && attempt.feedback
    ? parseFeedback(attempt.feedback) : null;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-5 sm:p-10">
      <Link className="text-sm text-sky-700 underline" href="/discursivas">← Minhas discursivas</Link>
      <h1 className="text-3xl font-bold">Correção da resposta #{attempt.id}</h1>
      <p className="text-sm text-slate-600">Feedback e espelho de treinamento, não oficiais. A nota numérica do edital ainda não está implementada nesta versão.</p>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Comando</h2>
        <p className="mt-2 whitespace-pre-wrap">{attempt.command}</p>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Sua resposta original</h2>
        <p className="mt-2 whitespace-pre-wrap">{attempt.answer}</p>
      </section>
      {!feedback && <section className="rounded-xl bg-amber-50 p-5 text-amber-950" role="status">
        {attempt.status === "failed" ?
          "A tentativa foi salva, mas o feedback não pôde ser gerado. Verifique a configuração da API e tente novamente em uma nova prática." :
          "A tentativa foi salva; o feedback ainda não está disponível."}
      </section>}
      {feedback && <FeedbackView feedback={feedback} />}
    </main>
  );
}
