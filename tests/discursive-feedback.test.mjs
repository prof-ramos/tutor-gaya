import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeedback } from "../lib/discursive-feedback.ts";

const valid = {
  summary: "Correção de treino", criteria: [{
    criterion: "Conceito", status: "parcialmente_atendido", evidence: "Trecho", guidance: "Completar",
  }],
  omissions: ["Exemplo"], conceptualErrors: [{ excerpt: "X", explanation: "Y", correction: "Z" }],
  linguisticErrors: [{ excerpt: "X", category: "grafia", explanation: "Y", correction: "Z" }],
  suggestions: ["Revisar"], mirror: "Espelho de treinamento", modelAnswer: "Resposta de treino",
};
test("lê feedback completo com critérios, omissões, erros e espelho", () => {
  assert.deepEqual(parseFeedback(JSON.stringify(valid)), valid);
});
test("recusa critério sem status válido", () => {
  assert.throws(() => parseFeedback(JSON.stringify({
    ...valid, criteria: [{ ...valid.criteria[0], status: "perfeito" }],
  })));
});
test("recusa feedback sem resposta-modelo", () => {
  const missing = { ...valid };
  delete missing.modelAnswer;
  assert.throws(() => parseFeedback(JSON.stringify(missing)));
});
