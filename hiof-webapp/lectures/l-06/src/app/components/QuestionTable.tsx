// app/components/QuestionTable.tsx

"use client";

import { useState } from "react";

// Define TypeScript interfaces for data structure
interface Answer {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  answers: Answer[];
  createdAt: Date;
  status: "draft" | "published" | "archived";
}

const mockQuestions: Question[] = [
  {
    id: "1",
    question: "Hva er hovedformålet med React hooks?",
    answers: [
      { id: "1a", text: "Å erstatte class-komponenter" },
      {
        id: "1b",
        text: "Å håndtere state i funksjonelle komponenter",
      },
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
      {
        id: "4b",
        text: "Med ternary operator eller logical AND",
      },
      { id: "4c", text: "Med switch-statements" },
    ],
    createdAt: new Date("2024-01-05"),
    status: "archived",
  },
];

export function QuestionTable() {
  // Use useState for local state management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published" | "archived"
  >("all");

  const filteredQuestions = mockQuestions.filter((question) => {
    // First check if question matches search term
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Then check if status matches filter
    const matchesStatus =
      statusFilter === "all" || question.status === statusFilter;

    // Question must fulfill both criteria to be included
    return matchesSearch && matchesStatus;
  });

  const handleView = (questionId: string) => {
    console.log(`Viewing question with ID: ${questionId}`);
    // In a real application we would navigate to a detail page
  };

  const handleEdit = (questionId: string) => {
    console.log(`Editing question with ID: ${questionId}`);
    // In a real application we would open an editing interface
  };

  const handleRemove = (questionId: string) => {
    console.log(`Deleting question with ID: ${questionId}`);
    // In a real application we would show a confirmation dialog and delete
  };

  return (
    <section className="question-table-container">
      {/* Filter section */}
      <section className="filters">
        <div className="search-container">
          <label htmlFor="search">Søk i spørsmål:</label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Skriv for å søke..."
            className="search-input"
          />
        </div>

        <div className="status-filter-container">
          <label htmlFor="status-filter">Filtrer etter status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="status-select"
          >
            <option value="all">Alle</option>
            <option value="draft">Utkast</option>
            <option value="published">Publisert</option>
            <option value="archived">Arkivert</option>
          </select>
        </div>
      </section>

      {/* Table section */}
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

      {/* Show message if no results */}
      {filteredQuestions.length === 0 && (
        <div className="no-results">
          Ingen spørsmål funnet med gjeldende filtre.
        </div>
      )}
    </section>
  );
}
