// app/components/table/ActionButtons.tsx

interface ActionButtonsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  className = "",
}: ActionButtonsProps) {
  return (
    <div className={`action-buttons ${className}`}>
      <button
        className="action-btn view-btn"
        onClick={onView}
        aria-label="Se detaljer"
      >
        Se
      </button>
      <button
        className="action-btn edit-btn"
        onClick={onEdit}
        aria-label="Rediger spørsmål"
      >
        Rediger
      </button>
      <button
        className="action-btn remove-btn"
        onClick={onDelete}
        aria-label="Slett spørsmål"
      >
        Slett
      </button>
    </div>
  );
}
