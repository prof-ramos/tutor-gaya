import type { DiscursiveFeedback } from "@/lib/discursive-feedback";

const labels = {
  atendido: "Atendido",
  parcialmente_atendido: "Parcialmente atendido",
  nao_atendido: "Não atendido",
};
const badges = {
  atendido: "bg-emerald-50 text-emerald-800",
  parcialmente_atendido: "bg-amber-50 text-amber-900",
  nao_atendido: "bg-rose-50 text-rose-800",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-xl font-semibold">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>;
}
function Empty({ text }: { text: string }) {
  return <p className="text-sm text-slate-500">{text}</p>;
}

export function FeedbackView({ feedback }: { feedback: DiscursiveFeedback }) {
  return <div className="space-y-6" aria-label="Feedback detalhado">
    <section className="rounded-xl border border-sky-200 bg-sky-50 p-5">
      <h2 className="text-xl font-semibold">Resumo da avaliação</h2>
      <p className="mt-2 whitespace-pre-wrap">{feedback.summary}</p>
    </section>

    <Section title="Atendimento aos critérios">
      <ul className="space-y-4">
        {feedback.criteria.map((item, index) => <li key={index} className="rounded-lg border border-slate-200 p-4">
          <span className={"inline-block rounded-full px-3 py-1 text-xs font-semibold " + badges[item.status]}>{labels[item.status]}</span>
          <h3 className="mt-2 font-semibold">{item.criterion}</h3>
          <p className="mt-2 text-sm"><span className="font-medium">Evidência:</span> {item.evidence || "Nenhuma evidência identificada."}</p>
          <p className="mt-2 text-sm"><span className="font-medium">Como melhorar:</span> {item.guidance}</p>
        </li>)}
      </ul>
    </Section>

    <Section title="Omissões">
      {feedback.omissions.length ? <ul className="list-inside list-disc space-y-2">{feedback.omissions.map((text, i) => <li key={i}>{text}</li>)}</ul> : <Empty text="Nenhuma omissão identificada." />}
    </Section>

    <Section title="Erros conceituais">
      {feedback.conceptualErrors.length ? <ul className="space-y-4">{feedback.conceptualErrors.map((error, i) => <li key={i} className="rounded-lg bg-rose-50 p-4">
        <p><span className="font-medium">Trecho:</span> {error.excerpt}</p>
        <p className="mt-2"><span className="font-medium">Problema:</span> {error.explanation}</p>
        <p className="mt-2"><span className="font-medium">Correção sugerida:</span> {error.correction}</p>
      </li>)}</ul> : <Empty text="Nenhum erro conceitual identificado." />}
    </Section>

    <Section title="Erros linguísticos">
      {feedback.linguisticErrors.length ? <ul className="space-y-4">{feedback.linguisticErrors.map((error, i) => <li key={i} className="rounded-lg bg-amber-50 p-4">
        <p className="text-xs font-medium uppercase text-amber-900">{error.category}</p>
        <p className="mt-1"><span className="font-medium">Trecho:</span> {error.excerpt}</p>
        <p className="mt-2"><span className="font-medium">Problema:</span> {error.explanation}</p>
        <p className="mt-2"><span className="font-medium">Correção sugerida:</span> {error.correction}</p>
      </li>)}</ul> : <Empty text="Nenhum erro linguístico identificado." />}
    </Section>

    <Section title="Sugestões de melhoria">
      {feedback.suggestions.length ? <ul className="list-inside list-disc space-y-2">{feedback.suggestions.map((text, i) => <li key={i}>{text}</li>)}</ul> : <Empty text="Nenhuma sugestão adicional." />}
    </Section>

    <Section title="Espelho de treinamento">
      <p className="whitespace-pre-wrap">{feedback.mirror}</p>
      <p className="mt-3 text-xs text-slate-500">Espelho orientativo gerado por IA; não é o padrão oficial da banca.</p>
    </Section>

    <Section title="Resposta-modelo esperada (treinamento)">
      <p className="whitespace-pre-wrap">{feedback.modelAnswer}</p>
      <p className="mt-3 text-xs text-slate-500">Modelo de treinamento com base no comando e nos critérios informados; verifique informações normativas em fontes oficiais.</p>
    </Section>
  </div>;
}
