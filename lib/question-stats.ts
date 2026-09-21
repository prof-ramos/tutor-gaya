export type DisciplineTotals = {
  correct: number;
  wrong: number;
};

export function summarizeDiscipline({ correct, wrong }: DisciplineTotals) {
  if (![correct, wrong].every(Number.isSafeInteger) || correct < 0 || wrong < 0) {
    throw new Error("Totais de questões inválidos");
  }
  const total = correct + wrong;
  if (!Number.isSafeInteger(total)) throw new Error("Total de questões inválido");
  return { total, correct, wrong, accuracy: total ? (100 * correct) / total : 0 };
}
