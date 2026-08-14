// app/components/QuestionTable.tsx
"use client";

import { useTableFilters } from "../hooks/useTableFilters";
import type { Question } from "../types/core";

export const mockQuestions: Question[] = [
  {
    id: "1",
    question: "Hva er hovedformålet med React hooks?",
    answers: [
      { id: "1a", text: "Å erstatte class-komponenter" },
      { id: "1b", text: "Å håndtere state i funksjonelle komponenter" },
      { id: "1c", text: "Å forbedre performance" },
    ],
    createdAt: new Date("2024-01-15"),
    status: "published",
  },
  {
    id: "2",
    question: "Hvilken hook brukes for side effects?",
    answers: [
      { id: "2a", text: "useState" },
      { id: "2b", text: "useEffect" },
      { id: "2c", text: "useContext" },
    ],
    createdAt: new Date("2024-01-10"),
    status: "draft",
  },
  {
    id: "3",
    question: "Hva står JSX for?",
    answers: [
      { id: "3a", text: "JavaScript XML" },
      { id: "3b", text: "Java Syntax Extension" },
      { id: "3c", text: "JSON XML" },
    ],
    createdAt: new Date("2024-01-20"),
    status: "published",
  },
  {
    id: "4",
    question: "Hvordan håndterer man conditional rendering i React?",
    answers: [
      { id: "4a", text: "Med if-statements" },
      { id: "4b", text: "Med ternary operator eller logical AND" },
      { id: "4c", text: "Med switch-statements" },
    ],
    createdAt: new Date("2024-01-05"),
    status: "archived",
  },
];

export function QuestionTable() {
  const { filters, actions, filteredQuestions, resultCount } =
    useTableFilters(mockQuestions);

  const handleView = (questionId: string) => {
    console.log(`Viser spørsmål med ID: ${questionId}`);
  };

  const handleEdit = (questionId: string) => {
    console.log(`Redigerer spørsmål med ID: ${questionId}`);
  };

  const handleRemove = (questionId: string) => {
    console.log(`Sletter spørsmål med ID: ${questionId}`);
  };

  return (
    <section className="question-table-container">
      <section className="filters">
        <div className="search-container">
          <label htmlFor="search">Søk i spørsmål:</label>
          <input
            id="search"
            type="text"
            value={filters.searchTerm}
            onChange={(e) => actions.setSearchTerm(e.target.value)}
            placeholder="Skriv for å søke..."
            className="search-input"
          />
        </div>

        <div className="status-filter-container">
          <label htmlFor="status-filter">Filtrer etter status:</label>
          <select
            id="status-filter"
            value={filters.statusFilter}
            onChange={(e) => actions.setStatusFilter(e.target.value as any)}
            className="status-select"
          >
            <option value="all">Alle</option>
            <option value="draft">Utkast</option>
            <option value="published">Publisert</option>
            <option value="archived">Arkivert</option>
          </select>
        </div>

        <div className="clear-filters-container">
          <button
            onClick={actions.clearAllFilters}
            className="clear-filters-btn"
          >
            Tøm filtre
          </button>
        </div>
      </section>

      <div className="results-info">
        Viser {resultCount} av {mockQuestions.length} spørsmål
      </div>

      <section className="table-container">
        <table className="questions-table">
          <thead>
            <tr>
              <th>Spørsmål</th>
              <th>Antall svar</th>
              <th>Status</th>
              <th>Opprettet</th>
              <th>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question) => (
              <tr key={question.id}>
                <td>{question.question}</td>
                <td>{question.answers.length}</td>
                <td>
                  <span className={`status-badge status-${question.status}`}>
                    {question.status}
                  </span>
                </td>
                <td>{question.createdAt.toLocaleDateString("nb-NO")}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleView(question.id)}
                    >
                      Se
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(question.id)}
                    >
                      Rediger
                    </button>
                    <button
                      className="action-btn remove-btn"
                      onClick={() => handleRemove(question.id)}
                    >
                      Slett
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {filteredQuestions.length === 0 && (
        <div className="no-results">
          Ingen spørsmål funnet med gjeldende filtre.
        </div>
      )}
    </section>
  );
}
