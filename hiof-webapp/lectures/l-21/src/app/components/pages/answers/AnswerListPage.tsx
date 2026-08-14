// src/app/pages/answers/AnswerListPage.tsx

import { getDb } from "@/db";
import { AnswerList } from "../../AnswerList";

import { answers } from "@/db/schema";
import { mapAnswerToDTO } from "@/app/lib/mappers/answers";
import { eq } from "drizzle-orm";

export async function AnswerListPage({ questionId }: { questionId: string }) {
  const data = await (await getDb())
    .select()
    .from(answers)
    .where(eq(answers.questionId, questionId));

  const mappedData = data.map(mapAnswerToDTO);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Svar</h1>
      <AnswerList answers={mappedData} />
    </div>
  );
}
