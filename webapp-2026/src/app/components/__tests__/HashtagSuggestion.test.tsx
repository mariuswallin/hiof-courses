// @vitest-environment happy-dom
/**
 * Component test with a mocked network.
 *
 * `HashtagSuggestion` calls `/api/ai/hashtags`, which on the server hits
 * `env.AI.run`. Workers AI does not exist in node, and a real AI call would
 * make the test slow and flaky. So we stub `fetch` and test our own handling:
 * loading state, rendering, and the error path.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashtagSuggestion } from "@/app/components/HashtagSuggestion";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("HashtagSuggestion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("er deaktivert uten tekst å foreslå ut fra", () => {
    render(<HashtagSuggestion text="   " />);

    expect(screen.getByRole("button", { name: /foreslå hashtags/i })).toBeDisabled();
  });

  it("viser forslagene den får tilbake", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ hashtags: ["matlaging", "rester"] }),
    );
    render(<HashtagSuggestion text="Middag av rester" />);

    await user.click(screen.getByRole("button", { name: /foreslå hashtags/i }));

    expect(await screen.findByText("#matlaging")).toBeInTheDocument();
    expect(screen.getByText("#rester")).toBeInTheDocument();
  });

  it("oversetter feilslaget fra serveren til en norsk melding", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "ai-unavailable" }, 503),
    );
    render(<HashtagSuggestion text="Middag av rester" />);

    await user.click(screen.getByRole("button", { name: /foreslå hashtags/i }));

    expect(
      await screen.findByText("KI er ikke tilgjengelig her."),
    ).toBeInTheDocument();
  });

  it("tilbyr «Prøv igjen» etter en timeout", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "timeout" }, 504),
    );
    render(<HashtagSuggestion text="Middag av rester" />);

    await user.click(screen.getByRole("button", { name: /foreslå hashtags/i }));

    expect(
      await screen.findByText("KI-en brukte for lang tid."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prøv igjen" })).toBeEnabled();
  });

  it("viser «Tenker...» mens kallet er underveis (fake timers)", () => {
    vi.useFakeTimers();
    // A slow response under our control: we decide when the 500 ms have passed.
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(() => resolve(jsonResponse({ hashtags: ["sent"] })), 500),
        ),
    );
    render(<HashtagSuggestion text="Middag av rester" />);

    // fireEvent is synchronous and works with fake timers; userEvent waits on
    // real microtasks and needs an advanceTimers bridge.
    fireEvent.click(screen.getByRole("button", { name: /foreslå hashtags/i }));

    expect(screen.getByRole("button", { name: "Tenker..." })).toBeInTheDocument();
    expect(screen.queryByText("#sent")).toBeNull();
  });
});
