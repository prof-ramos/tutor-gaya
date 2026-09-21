import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6 sm:p-12">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-700">Preparação TCDF</p>
        <h1 className="text-4xl font-extrabold tracking-tight">Tutor Gaya</h1>
        <p className="text-slate-600">Acompanhe seus acertos e erros e receba feedback de práticas discursivas.</p>
      </header>
      <nav className="grid gap-5 sm:grid-cols-2" aria-label="Módulos">
        <Link href="/questoes" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-600">
          <h2 className="text-xl font-semibold">Questões →</h2>
          <p className="mt-2 text-sm text-slate-600">Histórico agrupado por disciplina, com totais e percentual consolidado.</p>
        </Link>
        <Link href="/discursivas" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-600">
          <h2 className="text-xl font-semibold">Discursivas →</h2>
          <p className="mt-2 text-sm text-slate-600">Envie uma resposta e consulte os critérios, omissões, erros e sugestões de melhoria.</p>
        </Link>
      </nav>
      <p className="text-sm text-slate-500">Versão inicial: as disciplinas e os critérios de treino são cadastrados manualmente. Importação do edital e autenticação Google fazem parte das próximas etapas do PRD.</p>
    </main>
  );
}
