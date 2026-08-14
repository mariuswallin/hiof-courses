// @vitest-environment happy-dom
/**
 * Component test: optimistic-ish toggle against a mocked server action.
 * The point is to test the *component's* state handling, not the database —
 * that flow is covered by `src/test/__tests__/flow.social.test.ts`.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/actions/follows", () => ({
  toggleFollow: vi.fn(async () => ({ ok: true as const, following: true })),
}));

import { toggleFollow } from "@/actions/follows";
import { FollowButton } from "@/app/components/FollowButton";

describe("FollowButton", () => {
  beforeEach(() => {
    vi.mocked(toggleFollow).mockClear();
  });

  it("viser «Følg» når man ikke følger fra før", () => {
    render(<FollowButton followedId="u2" initialFollowing={false} />);

    expect(screen.getByRole("button", { name: "Følg" })).toBeInTheDocument();
  });

  it("bytter til «Følger» etter at actionen har svart", async () => {
    const user = userEvent.setup();
    render(<FollowButton followedId="u2" initialFollowing={false} />);

    await user.click(screen.getByRole("button", { name: "Følg" }));

    expect(toggleFollow).toHaveBeenCalledWith("u2");
    expect(await screen.findByRole("button", { name: "Følger" })).toBeInTheDocument();
  });

  it("beholder tilstanden når actionen feiler", async () => {
    const user = userEvent.setup();
    vi.mocked(toggleFollow).mockResolvedValueOnce({
      ok: false,
      error: "Login required",
    } as never);
    render(<FollowButton followedId="u2" initialFollowing={false} />);

    await user.click(screen.getByRole("button", { name: "Følg" }));

    expect(screen.getByRole("button", { name: "Følg" })).toBeInTheDocument();
  });
});
