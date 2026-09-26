import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeDiscipline } from "../lib/question-stats.ts";

test("consolida as quantidades, e não a média de percentuais de sessões", () => {
  // Sessões: 1/1 (100%) e 0/9 (0%) → consolidado = 1/10 (10%), não 50%.
  const result = summarizeDiscipline({ correct: 1, wrong: 9 });
  assert.deepEqual(result, { total: 10, correct: 1, wrong: 9, accuracy: 10 });
});
test("retorna percentual zero quando o histórico é vazio", () => {
  assert.equal(summarizeDiscipline({ correct: 0, wrong: 0 }).accuracy, 0);
});
test("recusa totais negativos e fracionários", () => {
  assert.throws(() => summarizeDiscipline({ correct: -1, wrong: 1 }));
  assert.throws(() => summarizeDiscipline({ correct: 0.5, wrong: 1 }));
});
