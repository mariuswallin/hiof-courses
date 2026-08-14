// app/lib/__tests__/formatters.test.ts
import { describe, it, expect } from "vitest";
import { formatDate } from "../lib/formatters";

// Unit testing: This test suite checks the functionality of the formatDate function
describe("formatDate", () => {
  it("formate date to Norwegian format", () => {
    // ARRANGE: Create a date object for testing
    const date = new Date("2024-01-15");

    // ACT: Call the function
    const result = formatDate(date);

    // ASSERT: Check the result
    expect(result).toBe("15.1.2024");
  });

  // Regression testing: This test ensures that the formatDate function handles different date formats correctly
  // ARRANGE: Create multiple test cases
  it.each([
    { input: new Date("2024-12-31"), expected: "31.12.2024" },
    { input: new Date("2024-01-01"), expected: "1.1.2024" },
    { input: new Date("2024-06-15"), expected: "15.6.2024" },
  ])("handles different dates correctly", ({ input, expected }) => {
    // ACT & ASSERT: Test each case
    expect(formatDate(input)).toBe(expected);
  });
});
