// /app/components/QuestionTable.tsx

import type { Question, QuestionStatus } from "../types/core";
import type { TableConfig } from "../types/table";
import { Table } from "./table/Table";

interface QuestionTableProps {
  questions: Question[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function QuestionTable({
  questions,
  onView,
  onEdit,
  onDelete,
  className,
}: QuestionTableProps) {
  const tableConfig: TableConfig<Question> = {
    columns: [
      {
        key: "question",
        header: "Question",
        sortable: true,
        width: "45%",
        render: (value: string, row: Question) => (
          <div className="max-w-md">
            <span title={value} className="block truncate">
              {value}
            </span>
            <div className="text-sm text-gray-500 mt-1">
              {row.answers.length} answer{row.answers.length !== 1 ? "s" : ""}
            </div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        align: "center",
        width: "15%",
        render: (value: QuestionStatus) => {
          const statusConfig = {
            draft: {
              bg: "bg-yellow-100",
              text: "text-yellow-800",
              label: "Draft",
            },
            published: {
              bg: "bg-green-100",
              text: "text-green-800",
              label: "Published",
            },
            archived: {
              bg: "bg-gray-100",
              text: "text-gray-800",
              label: "Archived",
            },
            deleted: {
              bg: "bg-red-100",
              text: "text-red-800",
              label: "Deleted",
            },
          };

          const config = statusConfig[value] || statusConfig.draft;

          return (
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${config.bg} ${config.text}`}
            >
              {config.label}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        header: "Created",
        sortable: true,
        align: "right",
        width: "20%",
        render: (value: Date) => {
          const date = new Date(value);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          let timeAgo = "";
          if (diffDays === 0) {
            timeAgo = "Today";
          } else if (diffDays === 1) {
            timeAgo = "Yesterday";
          } else {
            timeAgo = `${diffDays} days ago`;
          }

          return (
            <div className="text-sm">
              <div className="font-medium">{date.toLocaleDateString()}</div>
              <div className="text-gray-500">{timeAgo}</div>
            </div>
          );
        },
      },
    ],
    actions: [
      {
        key: "view",
        label: "Se detaljer",
        color: "primary",
        onClick: (question) => onView(question.id),
      },
      {
        key: "edit",
        label: "Rediger",
        color: "secondary",
        onClick: (question) => onEdit(question.id),
        disabled: (question) => question.status === "archived",
      },
      {
        key: "delete",
        label: "Slett",
        color: "danger",
        onClick: (question) => onDelete(question.id),
      },
    ],
    defaultSort: {
      column: "createdAt",
      direction: "desc",
    },
    striped: true,
    hoverable: true,
  };

  return (
    <Table
      data={questions}
      config={tableConfig}
      className={className}
      emptyMessage="Ingen spørsmål funnet"
    />
  );
}
