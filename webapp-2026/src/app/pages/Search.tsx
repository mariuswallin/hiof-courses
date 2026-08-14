// src/app/pages/Search.tsx — semantic search
import { SearchBox } from "@/app/components/SearchBox";

export function Search() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Semantisk søk</h1>
      <p className="text-muted text-sm">
        Søk etter mening, ikke bare ord. KI-en svarer ut fra de mest relevante
        innleggene (RAG). Krever at Workers AI + Vectorize er konfigurert.
      </p>
      <SearchBox />
    </div>
  );
}
