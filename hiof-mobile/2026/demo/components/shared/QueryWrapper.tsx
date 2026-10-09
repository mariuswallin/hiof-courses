import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage";

/**
 * Renders the three states of a query in one place, so every screen does not
 * repeat the same if-loading, if-error, else block.
 *
 * `children` is a function rather than an element, because the data only exists
 * in the success branch. That is what lets TypeScript narrow it to T.
 */
export function QueryWrapper<T>({
  query,
  children,
  loadingLabel,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  loadingLabel?: string;
}) {
  if (query.isPending) return <Loading label={loadingLabel} />;
  if (query.isError) {
    return (
      <ErrorMessage
        message={query.error instanceof Error ? query.error.message : "Ukjent feil"}
        onRetry={() => query.refetch()}
      />
    );
  }
  return <>{children(query.data)}</>;
}
