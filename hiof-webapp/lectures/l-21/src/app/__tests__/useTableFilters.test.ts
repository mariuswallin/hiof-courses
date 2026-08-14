// __tests__/useTableFilters.test.ts

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTableFilters } from "../hooks/useTableFilters";

// The hook owns filter state only. Filtering itself happens server-side, so
// the tests assert the state transitions rather than a filtered list.
describe("useTableFilters", () => {
  it("starts with empty search and status 'all'", () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.filters).toEqual({ search: "", status: "all" });
  });

  it("setSearch updates the search term and keeps the status", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.actions.setSearch("React");
    });

    expect(result.current.filters.search).toBe("React");
    expect(result.current.filters.status).toBe("all");
  });

  it("setStatus updates the status and keeps the search term", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.actions.setSearch("React");
      result.current.actions.setStatus("published");
    });

    expect(result.current.filters.status).toBe("published");
    expect(result.current.filters.search).toBe("React");
  });

  it("clearAllFilters resets both fields", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.actions.setSearch("React");
      result.current.actions.setStatus("published");
    });

    act(() => {
      result.current.actions.clearAllFilters();
    });

    expect(result.current.filters).toEqual({ search: "", status: "all" });
  });
});
