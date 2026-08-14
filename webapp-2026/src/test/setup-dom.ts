/**
 * src/test/setup-dom.ts — runs before every test file (see `vitest.config.ts`).
 *
 * Adds jest-dom's DOM matchers (`toBeInTheDocument`, `toBeDisabled`, ...) to
 * `expect`. The matchers only touch the DOM when they are actually called, so
 * this file is safe for the pure node tests too.
 *
 * Cleanup between component tests is automatic: Testing Library registers
 * `cleanup` in `afterEach` when Vitest runs with `globals: true`.
 */
import "@testing-library/jest-dom/vitest";
