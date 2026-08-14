// app/components/TableFilters.tsx

import type {
  TableFilters as FilterType,
  FilterActions,
} from "../types/filters";

interface TableFiltersProps {
  filters: FilterType;
  actions: FilterActions;
  totalQuestions: number;
  filteredCount: number;
}

export function TableFilters({
  filters,
  actions,
  totalQuestions,
  filteredCount,
}: TableFiltersProps) {
  return (
    <div>
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
        Viser <span className="count-highlight">{filteredCount}</span> av{" "}
        <span className="count-highlight">{totalQuestions}</span> spørsmål
        {filteredCount !== totalQuestions && (
          <span className="filter-indicator">
            ({totalQuestions - filteredCount} skjult av filtre)
          </span>
        )}
      </div>
    </div>
  );
}
