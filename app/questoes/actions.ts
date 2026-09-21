"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { disciplines, questionLogs } from "@/db/schema";

function getCount(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || !/^\d{1,6}$/.test(value)) {
    throw new Error("Informe um número inteiro não negativo de até 6 dígitos.");
  }
  return Number(value);
}

export async function addQuestionLog(form: FormData) {
  const name = String(form.get("discipline") ?? "").trim().replace(/\s+/g, " ");
  const date = String(form.get("date") ?? "");
  const correct = getCount(form.get("correct"));
  const wrong = getCount(form.get("wrong"));

  if (!name || name.length > 120) throw new Error("Informe uma disciplina válida.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date + "T00:00:00Z")) ||
      new Date(date + "T00:00:00Z").toISOString().slice(0, 10) !== date) {
    throw new Error("Data inválida.");
  }
  if (correct + wrong === 0) throw new Error("Registre pelo menos uma questão.");

  const nameKey = name.toLocaleLowerCase("pt-BR");
  await db.insert(disciplines).values({ name, nameKey }).onConflictDoNothing();
  const [discipline] = await db.select({ id: disciplines.id })
    .from(disciplines).where(eq(disciplines.nameKey, nameKey)).limit(1);
  if (!discipline) throw new Error("Não foi possível localizar a disciplina.");

  await db.insert(questionLogs).values({
    disciplineId: discipline.id, date, correct, wrong,
  });
  revalidatePath("/questoes");
}
