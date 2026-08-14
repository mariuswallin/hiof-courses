// app/pages/Question.tsx

import type { RequestInfo } from "rwsdk/worker";
import { QuestionDetail } from "../components/questions/pages/QuestionDetailPage";

export async function Question({ params }: RequestInfo) {
  return <QuestionDetail id={params.id} />;
}
