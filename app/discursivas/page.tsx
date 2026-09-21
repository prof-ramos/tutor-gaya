import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { discursiveAttempts } from "@/db/schema";
import { submitDiscursive } from "./actions";

export const dynamic = "force-dynamic";

export default async function DiscursivesPage() {
  const history = await db.select({
    id: discursiveAttempts.id, command: discursiveAttempts.command,
    status: discursiveAttempts.status, createdAt: discursiveAttempts.createdAt,
  }).from(discursiveAttempts).orderBy(desc(discursiveAttempts.id)).limit(20);

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-5 sm:p-10">
      <header>
        <Link href="/" className="text-sm text-sky-700 underline">← Início</Link>
        <h1 className="mt-4 text-3xl font-bold">Feedback de discursivas</h1>
        <p className="mt-2 text-slate-600">Prática de questão discursiva: envie o comando, os critérios de treino e sua resposta. A IA explicará o que foi ou não atendido.</p>
        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Correção e espelho são materiais de treinamento, não correspondem à correção oficial do Cebraspe. A peça técnica Informação depende da ingestão do Manual TCDF e será disponibilizada posteriormente.</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Nova prática</h2>
        <form action={submitDiscursive} className="mt-5 grid gap-5">
          <label className="grid gap-2 text-sm font-medium">Comando da questão
            <textarea className="min-h-24 rounded-lg border border-slate-300 p-3 font-normal" name="command" maxLength={4000} required placeholder="Cole ou escreva o comando de uma questão de Conhecimentos Especializados." />
          </label>
          <label className="grid gap-2 text-sm font-medium">Critérios do espelho de treinamento (um por linha)
            <textarea className="min-h-28 rounded-lg border border-slate-300 p-3 font-normal" name="criteria" maxLength={2500} required placeholder={"Definir o conceito solicitado\nExplicar o procedimento pertinente\nApresentar as consequências"} />
          </label>
          <label className="grid gap-2 text-sm font-medium">Resposta-modelo de referência (opcional)
            <textarea className="min-h-24 rounded-lg border border-slate-300 p-3 font-normal" name="referenceAnswer" maxLength={10000} placeholder="Se tiver um padrão de resposta confiável, cole-o aqui. Senão, a IA criará um modelo de treino." />
          </label>
          <label className="grid gap-2 text-sm font-medium">Sua resposta
            <textarea className="min-h-72 rounded-lg border border-slate-300 p-3 font-normal leading-relaxed" name="answer" maxLength={10000} required placeholder="Escreva sua resposta aqui." />
            <span className="text-xs font-normal text-slate-500">Até 20 linhas digitadas (quebras manuais). A aferição de linhas físicas no padrão da banca ainda não está implementada; nenhuma nota numérica será atribuída nesta etapa.</span>
          </label>
          <button className="rounded-lg bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800" type="submit">Enviar para feedback</button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Respostas anteriores</h2>
        {history.length === 0 ? <p className="mt-3 text-slate-600">Nenhuma resposta enviada ainda.</p> : (
          <ul className="mt-3 divide-y divide-slate-100">
            {history.map((item) => <li key={item.id} className="py-3">
              <Link href={"/discursivas/" + item.id} className="font-medium text-sky-800 underline">
                {item.command.length > 100 ? item.command.slice(0, 100) + "…" : item.command}
              </Link>
              <p className="mt-1 text-xs text-slate-500">{item.createdAt} · {item.status === "completed" ? "Feedback disponível" : item.status === "failed" ? "Correção indisponível" : "Aguardando correção"}</p>
            </li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
