// app/components/questions/table/TableFilters.tsx

import type {
  TableFilters as FilterType,
  FilterActions,
} from "@/app/types/filters";

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
            name="search"
            type="text"
            value={filters.search}
            onChange={(e) => actions.setSearch(e.target.value)}
            placeholder="Skriv for å søke..."
            className="search-input"
          />
        </div>

        <div className="status-filter-container">
          <label htmlFor="status-filter">Filtrer etter status:</label>
          <select
            id="status-filter"
            value={filters.status || "all"}
            onChange={(e) => actions.setStatus(e.target.value as any)}
            name="status"
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
      <div className="results-info" data-testid="results-info">
        Viser{" "}
        <span className="count-highlight">
          {totalQuestions > 0 ? filteredCount : 0}
        </span>{" "}
        av <span className="count-highlight">{totalQuestions}</span> spørsmål
        {filteredCount !== totalQuestions && (
          <span className="filter-indicator">
            ({totalQuestions - filteredCount} skjult av filtre)
          </span>
        )}
      </div>
    </div>
  );
}
