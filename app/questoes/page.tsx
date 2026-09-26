import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { disciplines, questionLogs } from "@/db/schema";
import { summarizeDiscipline } from "@/lib/question-stats";
import { addQuestionLog } from "./actions";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const [grouped, history] = await Promise.all([
    db.select({
      discipline: disciplines.name,
      correct: sql.raw("COALESCE(SUM(question_logs.correct), 0)").mapWith(Number),
      wrong: sql.raw("COALESCE(SUM(question_logs.wrong), 0)").mapWith(Number),
    }).from(questionLogs)
      .innerJoin(disciplines, eq(questionLogs.disciplineId, disciplines.id))
      .groupBy(disciplines.id, disciplines.name).orderBy(disciplines.name),
    db.select({
      id: questionLogs.id, date: questionLogs.date, discipline: disciplines.name,
      correct: questionLogs.correct, wrong: questionLogs.wrong,
    }).from(questionLogs)
      .innerJoin(disciplines, eq(questionLogs.disciplineId, disciplines.id))
      .orderBy(desc(questionLogs.date), desc(questionLogs.id)).limit(30),
  ]);
  const rows = grouped.map((row) => ({ ...row, ...summarizeDiscipline(row) }));
  const overall = summarizeDiscipline({
    correct: rows.reduce((sum, row) => sum + row.correct, 0),
    wrong: rows.reduce((sum, row) => sum + row.wrong, 0),
  });
  const pct = (number: number) => number.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-5 sm:p-10">
      <header>
        <Link href="/" className="text-sm text-sky-700 underline">← Início</Link>
        <h1 className="mt-4 text-3xl font-bold">Desempenho em questões</h1>
        <p className="mt-2 text-sm text-slate-600">Registre apenas os resultados de questões resolvidas fora do Tutor Gaya.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-4" aria-label="Resumo geral">
        {[
          ["Questões", overall.total],
          ["Acertos", overall.correct],
          ["Erros", overall.wrong],
          ["Aproveitamento", pct(overall.accuracy) + "%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Por disciplina</h2>
        <p className="mt-1 text-sm text-slate-600">
          Percentual = Σ acertos ÷ (Σ acertos + Σ erros) × 100. Não é a média dos percentuais individuais.
        </p>
        {rows.length === 0 ? (
          <p className="mt-5 rounded-lg bg-slate-50 p-4 text-slate-600">Nenhuma questão registrada ainda.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[570px] text-left text-sm">
              <thead><tr className="border-b text-slate-600">
                <th scope="col" className="py-3 pr-4">Disciplina</th>
                <th scope="col" className="px-2 py-3 text-right">Questões</th>
                <th scope="col" className="px-2 py-3 text-right">Acertos</th>
                <th scope="col" className="px-2 py-3 text-right">Erros</th>
                <th scope="col" className="py-3 pl-4 text-right">Acertos (%)</th>
              </tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.discipline} className="border-b border-slate-100 last:border-0">
                    <th scope="row" className="py-4 pr-4 font-medium">{row.discipline}</th>
                    <td className="px-2 py-4 text-right tabular-nums">{row.total}</td>
                    <td className="px-2 py-4 text-right tabular-nums">{row.correct}</td>
                    <td className="px-2 py-4 text-right tabular-nums">{row.wrong}</td>
                    <td className="w-36 py-4 pl-4 text-right">
                      <span className="font-semibold tabular-nums">{pct(row.accuracy)}%</span>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={pct(row.accuracy) + "% de acertos"}>
                        <div className="h-full rounded-full bg-sky-600" style={{ width: row.accuracy + "%" }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Novo registro</h2>
        <form action={addQuestionLog} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">Disciplina
            <input className="rounded-lg border border-slate-300 p-3" type="text" name="discipline" maxLength={120} placeholder="Nome conforme o edital" required list="discipline-names" />
            <datalist id="discipline-names">{rows.map((row) => <option key={row.discipline} value={row.discipline} />)}</datalist>
          </label>
          <label className="grid gap-1 text-sm font-medium">Data
            <input className="rounded-lg border border-slate-300 p-3" type="date" name="date" defaultValue={new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })} required />
          </label>
          <label className="grid gap-1 text-sm font-medium">Acertos
            <input className="rounded-lg border border-slate-300 p-3" type="number" name="correct" min="0" max="999999" defaultValue="0" required />
          </label>
          <label className="grid gap-1 text-sm font-medium">Erros
            <input className="rounded-lg border border-slate-300 p-3" type="number" name="wrong" min="0" max="999999" defaultValue="0" required />
          </label>
          <button className="rounded-lg bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800 sm:col-span-2" type="submit">Registrar resultados</button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Últimos registros</h2>
        {history.length === 0 ? <p className="mt-3 text-slate-600">Sem registros.</p> : (
          <ul className="mt-4 divide-y divide-slate-100">
            {history.map((entry) => <li key={entry.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <span><span className="font-medium">{entry.discipline}</span> · {entry.date}</span>
              <span className="tabular-nums">{entry.correct + entry.wrong} questões · {entry.correct} acertos · {entry.wrong} erros</span>
            </li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
