// @vitest-environment happy-dom
/**
 * Component test with hooks: `NewPostForm` uses `useState` and
 * `useTransition`, and calls the `createPost` server action.
 *
 * The action is mocked with `vi.fn()` — which is also a spy, so we can verify
 * *what* the component sent, not just that it sent something.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/actions/posts", () => ({
  createPost: vi.fn(async (text: string) =>
    text.trim().length === 0
      ? { ok: false as const, error: "Innlegget kan ikke være tomt." }
      : { ok: true as const, post: { id: "p1", text } },
  ),
}));

import { createPost } from "@/actions/posts";
import { NewPostForm } from "@/app/components/NewPostForm";

describe("NewPostForm", () => {
  beforeEach(() => {
    vi.mocked(createPost).mockClear();
    // The success path calls window.location.reload() — stubbed so the test does
    // not try to navigate in happy-dom.
    vi.spyOn(window.location, "reload").mockImplementation(() => {});
  });

  it("har Post-knappen deaktivert når feltet er tomt", () => {
    render(<NewPostForm />);

    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  });

  it("aktiverer knappen og teller tegn når brukeren skriver", async () => {
    const user = userEvent.setup();
    render(<NewPostForm />);

    await user.type(screen.getByPlaceholderText(/hva tenker du på/i), "Hallo");

    expect(screen.getByRole("button", { name: "Post" })).toBeEnabled();
    expect(screen.getByText("5 / 280")).toBeInTheDocument();
  });

  it("sender teksten til server-actionen (spy på argumentene)", async () => {
    const user = userEvent.setup();
    render(<NewPostForm />);

    await user.type(screen.getByPlaceholderText(/hva tenker du på/i), "Min kvittr");
    await user.click(screen.getByRole("button", { name: "Post" }));

    expect(createPost).toHaveBeenCalledTimes(1);
    expect(createPost).toHaveBeenCalledWith("Min kvittr");
  });

  it("viser feilmeldingen fra actionen uten å miste teksten", async () => {
    const user = userEvent.setup();
    vi.mocked(createPost).mockResolvedValueOnce({
      ok: false as const,
      error: "For langt innlegg",
    });
    render(<NewPostForm />);

    const textarea = screen.getByPlaceholderText(/hva tenker du på/i);
    await user.type(textarea, "noe");
    await user.click(screen.getByRole("button", { name: "Post" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("For langt innlegg");
    // The action *returns* the error instead of throwing, so the user keeps what
    // they typed.
    expect(textarea).toHaveValue("noe");
  });
});
