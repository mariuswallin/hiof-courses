// @vitest-environment happy-dom
//
// Component test of the older edit pattern.
//
// The contrast with TaskEditAction is the form. Here the input is controlled
// (`value` and `onChange`), so every keystroke goes through React state. In
// the action version it is uncontrolled (`defaultValue`) and React reads the
// value only on submit.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TaskEditOld from "../TaskEditOld";

const task = {
  id: "t1",
  name: "Skriv ferdig oppgaven",
  description: "Beskrivelse",
  dueDate: new Date("2026-01-01T12:00:00Z").toISOString(),
  userId: 1,
  completed: false,
  published: true,
};

function stubFetch(svar: unknown = { data: task }) {
  const spion = vi.fn(async () => ({ ok: true, json: async () => svar }));
  vi.stubGlobal("fetch", spion);
  return spion;
}

/**
 * Stub that answers differently for the fetch (GET) and the save (PUT), so
 * the submit tests can see what was actually sent.
 */
function stubFetchMedLagring(lagret: Record<string, unknown>) {
  const spion = vi.fn(async (_url: string, init?: RequestInit) => ({
    ok: true,
    json: async () =>
      init?.method === "PUT" ? { data: lagret } : { data: task },
  }));
  vi.stubGlobal("fetch", spion);
  return spion;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TaskEditOld controlled form", () => {
  it("fills the field once the data has loaded", async () => {
    stubFetch();

    render(<TaskEditOld params={{ taskId: "t1" }} />);

    const input = (await screen.findByLabelText("Name:")) as HTMLInputElement;
    expect(input.value).toBe("Skriv ferdig oppgaven");
  });

  it("updates state on every keystroke", async () => {
    const bruker = userEvent.setup();
    stubFetch();

    render(<TaskEditOld params={{ taskId: "t1" }} />);
    const input = (await screen.findByLabelText("Name:")) as HTMLInputElement;

    await bruker.clear(input);
    await bruker.type(input, "Nytt");

    // Because the field is controlled, the value is mirrored in the heading
    // that renders the whole task object.
    expect(input.value).toBe("Nytt");
    expect(screen.getByRole("heading")).toHaveTextContent('"name":"Nytt"');
  });

  it("starts empty before the response arrives", () => {
    stubFetch();

    render(<TaskEditOld params={{ taskId: "t1" }} />);

    // `task` is undefined on first render and `value` falls back to "".
    const input = screen.getByLabelText("Name:") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("keeps the id in the form because handleSubmit reads it from FormData", async () => {
    stubFetch();

    const { container } = render(<TaskEditOld params={{ taskId: "t1" }} />);
    await screen.findByDisplayValue("Skriv ferdig oppgaven");

    const hidden = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="id"]'
    );
    expect(hidden?.value).toBe("t1");
  });
});

describe("TaskEditOld submit", () => {
  it("sends a PUT to the right URL with the name from the form", async () => {
    const bruker = userEvent.setup();
    const spion = stubFetchMedLagring({ ...task, name: "Nytt navn" });

    render(<TaskEditOld params={{ taskId: "t1" }} />);
    const input = await screen.findByLabelText("Name:");

    await bruker.clear(input);
    await bruker.type(input, "Nytt navn");
    await bruker.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(spion).toHaveBeenCalledTimes(2));

    // The first call is the fetch, the second is the save.
    const [url, init] = spion.mock.calls[1];
    // Regression guard: without the hidden id field this would be
    // "/api/v1/tasks/null".
    expect(url).toBe("/api/v1/tasks/t1");
    expect(init?.method).toBe("PUT");
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(JSON.parse(init?.body as string)).toEqual({ name: "Nytt navn" });
  });

  it("updates the form with what the server returned", async () => {
    const bruker = userEvent.setup();
    // The server answers with a different name than was submitted, which
    // proves the component uses the response and not its own state.
    stubFetchMedLagring({ ...task, name: "Navn fra server" });

    render(<TaskEditOld params={{ taskId: "t1" }} />);
    await screen.findByDisplayValue("Skriv ferdig oppgaven");

    await bruker.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByDisplayValue("Navn fra server")).toBeInTheDocument();
  });

  it("does not reload the page", async () => {
    const bruker = userEvent.setup();
    stubFetchMedLagring({ ...task });

    render(<TaskEditOld params={{ taskId: "t1" }} />);
    await screen.findByDisplayValue("Skriv ferdig oppgaven");

    // The listener has to sit above the React root. React 19 delegates
    // events to the container element, so a listener on the form itself would
    // run before `handleSubmit` got to call preventDefault.
    const submitHendelse = vi.fn();
    const lytter = (e: Event) => submitHendelse(e.defaultPrevented);
    document.addEventListener("submit", lytter);

    try {
      await bruker.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(submitHendelse).toHaveBeenCalled());
      expect(submitHendelse).toHaveBeenCalledWith(true);
    } finally {
      document.removeEventListener("submit", lytter);
    }
  });

  it("does not crash when the save fails", async () => {
    const bruker = userEvent.setup();
    const feil = vi.spyOn(console, "error").mockImplementation(() => {});
    const spion = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "PUT") throw new Error("Nettverksfeil");
      return { ok: true, json: async () => ({ data: task }) };
    });
    vi.stubGlobal("fetch", spion);

    render(<TaskEditOld params={{ taskId: "t1" }} />);
    await screen.findByDisplayValue("Skriv ferdig oppgaven");

    await bruker.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(feil).toHaveBeenCalled());
    // The form keeps the previous value instead of disappearing.
    expect(screen.getByLabelText("Name:")).toHaveValue("Skriv ferdig oppgaven");
  });
});
