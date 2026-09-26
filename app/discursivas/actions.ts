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

/** Like field(), but returns the raw string so whitespace the student typed is preserved. */
function fieldRaw(form: FormData, name: string, max: number, required = true): string {
  const value = form.get(name);
  if (typeof value !== "string") throw new Error("Campo inválido: " + name);
  const trimmed = value.trim();
  if (trimmed.length > max || (required && !trimmed)) throw new Error("Preencha corretamente o campo: " + name);
  if (value.length > max) throw new Error("Preencha corretamente o campo: " + name);
  return value;
}

export async function submitDiscursive(form: FormData) {
  const command = field(form, "command", 4000);
  const criteriaText = field(form, "criteria", 2500);
  const answer = fieldRaw(form, "answer", 10000);
  const referenceAnswer = fieldRaw(form, "referenceAnswer", 10000, false);
  const idempotencyKeyRaw = form.get("idempotencyKey");
  const idempotencyKey =
    typeof idempotencyKeyRaw === "string" && idempotencyKeyRaw.trim().length >= 8
      ? idempotencyKeyRaw.trim().slice(0, 80)
      : null;
  const criteria = criteriaText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (criteria.length < 1 || criteria.length > 12 ||
      new Set(criteria).size !== criteria.length) {
    throw new Error("Informe de 1 a 12 critérios diferentes, um por linha.");
  }
  // Initial release: only short questions; the technical piece depends on the TCDF manual.
  const lines = answer.split(/\r?\n/);
  if (lines.length > 20) throw new Error("A questão não pode exceder 20 quebras de linha digitadas.");

  if (idempotencyKey) {
    const [existing] = await db
      .select({ id: discursiveAttempts.id })
      .from(discursiveAttempts)
      .where(eq(discursiveAttempts.idempotencyKey, idempotencyKey))
      .limit(1);
    if (existing) {
      redirect("/discursivas/" + existing.id);
    }
  }

  // Persist the student's original answer BEFORE calling the external provider.
  let attempt: { id: number };
  try {
    const [created] = await db.insert(discursiveAttempts).values({
      kind: "question", command, criteria: JSON.stringify(criteria), referenceAnswer,
      answer, status: "pending", idempotencyKey,
    }).returning({ id: discursiveAttempts.id });
    if (!created) throw new Error("Não foi possível salvar sua resposta.");
    attempt = created;
  } catch (error) {
    // Unique race: another identical submission won; reuse it.
    if (idempotencyKey) {
      const [existing] = await db
        .select({ id: discursiveAttempts.id })
        .from(discursiveAttempts)
        .where(eq(discursiveAttempts.idempotencyKey, idempotencyKey))
        .limit(1);
      if (existing) redirect("/discursivas/" + existing.id);
    }
    throw error;
  }

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
