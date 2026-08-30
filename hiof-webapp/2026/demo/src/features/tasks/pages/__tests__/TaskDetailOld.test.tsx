// @vitest-environment happy-dom
//
// Component test of the older pattern: a client component that fetches its
// own data with `useEffect` and `fetch`.
//
// Timing is the whole point here. The component renders without data first
// and updates when the response arrives. `findBy*` waits for that transition.
// `getBy*` would fail because it only looks at the first render.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { AuthProvider } from "@/context/AuthContext";
import TaskDetailOld from "../TaskDetailOld";

const user = { id: 1, name: "Kari", email: "kari@test.local", isAdmin: false };

const task = {
  id: "t1",
  name: "Skriv ferdig oppgaven",
  description: "Beskrivelse",
  dueDate: new Date("2026-01-01T12:00:00Z").toISOString(),
  userId: 1,
  completed: false,
  published: true,
};

/** Lets the test decide when fetch responds. */
function deferredFetch() {
  let svar: (verdi: unknown) => void = () => {};
  const spion = vi.fn(
    () =>
      new Promise((resolve) => {
        svar = (verdi) => resolve({ ok: true, json: async () => verdi });
      })
  );
  return { spion, svar: (verdi: unknown) => svar(verdi) };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderDetail() {
  return render(
    <AuthProvider user={user}>
      <TaskDetailOld params={{ taskId: "t1" }} />
    </AuthProvider>
  );
}

describe("TaskDetailOld fetching", () => {
  it("fetches the task from the API on the right URL", async () => {
    const fetchSpion = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: task }),
    }));
    vi.stubGlobal("fetch", fetchSpion);

    renderDetail();

    expect(await screen.findByText(/Skriv ferdig oppgaven/)).toBeInTheDocument();
    expect(fetchSpion).toHaveBeenCalledWith("/api/v1/tasks/t1");
  });

  it("renders the empty state first and the data when the response arrives", async () => {
    const { spion, svar } = deferredFetch();
    vi.stubGlobal("fetch", spion);

    const { container } = renderDetail();

    // Before the response `task` is null, so JSON.stringify gives "null".
    expect(container.textContent).toContain("null");
    expect(container.textContent).not.toContain("Skriv ferdig oppgaven");

    // Let the response through.
    svar({ data: task });

    expect(await screen.findByText(/Skriv ferdig oppgaven/)).toBeInTheDocument();
  });

  it("does not crash when the API call fails", async () => {
    const feil = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Nettverksfeil");
      })
    );

    const { container } = renderDetail();

    // The component stays in its empty state instead of throwing on.
    expect(await screen.findByText("Kari")).toBeInTheDocument();
    expect(container.textContent).toContain("null");
    expect(feil).toHaveBeenCalled();
  });
});
