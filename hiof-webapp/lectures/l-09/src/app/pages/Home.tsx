// app/pages/Home.tsx

import { QuestionsPage } from "../components/QuestionsPage";
import { emptyQuestions, archivedOnlyQuestions } from "../data/questions";

export function Home() {
  return (
    <div>
      {/* Standard with default data */}
      <QuestionsPage />

      {/* With specific data and custom title */}
      <QuestionsPage
        initialQuestions={archivedOnlyQuestions}
        title="Arkiverte spørsmål"
        subtitle="Gjenopprett eller slett permanently"
      />

      {/* Test empty state */}
      <QuestionsPage
        initialQuestions={emptyQuestions}
        title="Ingen spørsmål ennå"
      />
    </div>
  );
}
