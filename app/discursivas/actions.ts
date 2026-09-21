"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { discursiveAttempts } from "@/db/schema";
import { generateDiscursiveFeedback } from "@/lib/discursive-feedback";

function field(form: FormData, name: string, max: number, required = true): string {
  const value = form.get(name);
  if (typeof value !== "string") throw new Error("Campo inválido: " + name);
  const result = value.trim();
  if (result.length > max || (required && !result)) throw new Error("Preencha corretamente o campo: " + name);
  return result;
}

export async function submitDiscursive(form: FormData) {
  const command = field(form, "command", 4000);
  const criteriaText = field(form, "criteria", 2500);
  const answer = field(form, "answer", 10000);
  const referenceAnswer = field(form, "referenceAnswer", 10000, false);
  const criteria = criteriaText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (criteria.length < 1 || criteria.length > 12 ||
      new Set(criteria).size !== criteria.length) {
    throw new Error("Informe de 1 a 12 critérios diferentes, um por linha.");
  }
  // Initial release: only short questions; the technical piece depends on the TCDF manual.
  const lines = answer.split(/\r?\n/);
  if (lines.length > 20) throw new Error("A questão não pode exceder 20 quebras de linha digitadas.");

  // Persist the student's original answer BEFORE calling the external provider.
  const [attempt] = await db.insert(discursiveAttempts).values({
    kind: "question", command, criteria: JSON.stringify(criteria), referenceAnswer,
    answer, status: "pending",
  }).returning({ id: discursiveAttempts.id });
  if (!attempt) throw new Error("Não foi possível salvar sua resposta.");

  try {
    const feedback = await generateDiscursiveFeedback({ command, criteria, answer, referenceAnswer });
    await db.update(discursiveAttempts)
      .set({ feedback: JSON.stringify(feedback), status: "completed" })
      .where(eq(discursiveAttempts.id, attempt.id));
  } catch (error) {
    // Never log the submitted response or the provider payload.
    console.error("Discursive feedback failed", { attemptId: attempt.id, errorType: error instanceof Error ? error.name : "Unknown" });
    await db.update(discursiveAttempts)
      .set({ status: "failed" }).where(eq(discursiveAttempts.id, attempt.id));
  }
  revalidatePath("/discursivas");
  redirect("/discursivas/" + attempt.id);
}
