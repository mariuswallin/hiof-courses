// /app/lib/__tests__/sorting.test.ts

import { describe, it, expect } from "vitest";
import {
  getSortIndicator,
  isNumericValue,
  sortTableData,
} from "../lib/sorting";

describe("sortTableData", () => {
  const testData = [
    {
      id: 1,
      name: "Alice",
      age: 30,
      score: 95.5,
      active: true,
      created: new Date("2023-01-15"),
    },
    {
      id: 2,
      name: "Bob",
      age: 25,
      score: 87.2,
      active: false,
      created: new Date("2023-02-10"),
    },
    {
      id: 3,
      name: "Charlie",
      age: 35,
      score: 92.8,
      active: true,
      created: new Date("2023-01-20"),
    },
    {
      id: 4,
      name: "alice",
      age: 28,
      score: 88.9,
      active: false,
      created: new Date("2023-03-05"),
    },
  ];

  describe("string sorting", () => {
    it("should sort strings in ascending order", () => {
      const result = sortTableData(testData, "name", "asc");
      expect(result.map((r) => r.name)).toEqual([
        "Alice",
        "alice",
        "Bob",
        "Charlie",
      ]);
    });

    it("should sort strings in descending order", () => {
      const result = sortTableData(testData, "name", "desc");
      expect(result.map((r) => r.name)).toEqual([
        "Charlie",
        "Bob",
        "Alice",
        "alice",
      ]);
    });

    it("should handle case-insensitive sorting", () => {
      const data = [
        { id: 1, name: "apple" },
        { id: 2, name: "Banana" },
        { id: 3, name: "cherry" },
        { id: 4, name: "Apple" },
      ];
      const result = sortTableData(data, "name", "asc");
      expect(result.map((r) => r.name)).toEqual([
        "apple",
        "Apple",
        "Banana",
        "cherry",
      ]);
    });
  });

  describe("numeric sorting", () => {
    it("should sort numbers in ascending order", () => {
      const result = sortTableData(testData, "age", "asc");
      expect(result.map((r) => r.age)).toEqual([25, 28, 30, 35]);
    });

    it("should sort numbers in descending order", () => {
      const result = sortTableData(testData, "age", "desc");
      expect(result.map((r) => r.age)).toEqual([35, 30, 28, 25]);
    });

    it("should handle decimal numbers", () => {
      const result = sortTableData(testData, "score", "asc");
      expect(result.map((r) => r.score)).toEqual([87.2, 88.9, 92.8, 95.5]);
    });

    it("should handle negative numbers", () => {
      const data = [
        { id: 1, value: -5 },
        { id: 2, value: 10 },
        { id: 3, value: -15 },
        { id: 4, value: 0 },
      ];
      const result = sortTableData(data, "value", "asc");
      expect(result.map((r) => r.value)).toEqual([-15, -5, 0, 10]);
    });
  });

  describe("boolean sorting", () => {
    it("should sort booleans with false before true (ascending)", () => {
      const result = sortTableData(testData, "active", "asc");
      const activeValues = result.map((r) => r.active);
      expect(activeValues.slice(0, 2)).toEqual([false, false]);
      expect(activeValues.slice(2)).toEqual([true, true]);
    });

    it("should sort booleans with true before false (descending)", () => {
      const result = sortTableData(testData, "active", "desc");
      const activeValues = result.map((r) => r.active);
      expect(activeValues.slice(0, 2)).toEqual([true, true]);
      expect(activeValues.slice(2)).toEqual([false, false]);
    });
  });

  describe("date sorting", () => {
    it("should sort dates in ascending order", () => {
      const result = sortTableData(testData, "created", "asc");
      const dates = result.map((r) => r.created.getTime());
      expect(dates).toEqual([
        new Date("2023-01-15").getTime(),
        new Date("2023-01-20").getTime(),
        new Date("2023-02-10").getTime(),
        new Date("2023-03-05").getTime(),
      ]);
    });

    it("should sort dates in descending order", () => {
      const result = sortTableData(testData, "created", "desc");
      const dates = result.map((r) => r.created.getTime());
      expect(dates).toEqual([
        new Date("2023-03-05").getTime(),
        new Date("2023-02-10").getTime(),
        new Date("2023-01-20").getTime(),
        new Date("2023-01-15").getTime(),
      ]);
    });
  });

  describe("null and undefined handling", () => {
    it("should sort null values to the end regardless of direction", () => {
      const dataWithNulls = [
        { id: 1, value: "apple" },
        { id: 2, value: null },
        { id: 3, value: "banana" },
        { id: 4, value: undefined },
        { id: 5, value: "cherry" },
      ];

      const ascResult = sortTableData(dataWithNulls, "value", "asc");
      expect(ascResult.slice(-2).every((r) => r.value == null)).toBe(true);

      const descResult = sortTableData(dataWithNulls, "value", "desc");
      expect(descResult.slice(-2).every((r) => r.value == null)).toBe(true);
    });

    it("should handle all null values", () => {
      const data = [
        { id: 1, value: null },
        { id: 2, value: null },
        { id: 3, value: undefined },
      ];
      const result = sortTableData(data, "value", "asc");
      expect(result).toHaveLength(3);
      expect(result.map((r) => r.id)).toEqual([1, 2, 3]);
    });
  });

  describe("mixed type handling", () => {
    it("should handle mixed types by converting to strings", () => {
      const data = [
        { id: 1, value: "banana" },
        { id: 2, value: 10 },
        { id: 3, value: "apple" },
        { id: 4, value: true },
      ];
      const result = sortTableData(data, "value", "asc");
      // Should convert to strings and sort: "10", "apple", "banana", "true"
      expect(result.map((r) => r.value)).toEqual([10, "apple", "banana", true]);
    });
  });

  describe("numeric string handling", () => {
    it("should handle numeric strings correctly", () => {
      const data = [
        { id: 1, value: "10" },
        { id: 2, value: "2" },
        { id: 3, value: "100" },
        { id: 4, value: "3" },
      ];
      const result = sortTableData(data, "value", "asc");
      // Should handle numeric ordering: 2, 3, 10, 100
      expect(result.map((r) => r.value)).toEqual(["2", "3", "10", "100"]);
    });
  });

  describe("immutability", () => {
    it("should not mutate the original array", () => {
      const originalData = [...testData];
      const result = sortTableData(testData, "age", "asc");

      expect(testData).toEqual(originalData);
      expect(result).not.toBe(testData);
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const result = sortTableData([], "name", "asc");
      expect(result).toEqual([]);
    });

    it("should handle single item array", () => {
      const data = [{ id: 1, name: "Alice" }];
      const result = sortTableData(data, "name", "asc");
      expect(result).toEqual(data);
      expect(result).not.toBe(data); // Still creates new array
    });

    it("should handle array with identical values", () => {
      const data = [
        { id: 1, value: "same" },
        { id: 2, value: "same" },
        { id: 3, value: "same" },
      ];
      const result = sortTableData(data, "value", "asc");
      expect(result).toHaveLength(3);
      expect(result.every((r) => r.value === "same")).toBe(true);
    });
  });
});

describe("getSortIndicator", () => {
  it("should return up arrow for ascending sort", () => {
    expect(getSortIndicator("name", "name", "asc")).toBe("↑");
  });

  it("should return down arrow for descending sort", () => {
    expect(getSortIndicator("name", "name", "desc")).toBe("↓");
  });

  it("should return empty string for different columns", () => {
    expect(getSortIndicator("age", "name", "asc")).toBe("");
  });

  it("should return empty string for no direction", () => {
    expect(getSortIndicator("name", "name", undefined)).toBe("↓");
  });
});

describe("isNumericValue", () => {
  it("should return true for numbers", () => {
    expect(isNumericValue(42)).toBe(true);
    expect(isNumericValue(-3.14)).toBe(true);
    expect(isNumericValue(0)).toBe(true);
  });

  it("should return true for numeric strings", () => {
    expect(isNumericValue("42")).toBe(true);
    expect(isNumericValue("-3.14")).toBe(true);
    expect(isNumericValue("0")).toBe(true);
  });

  it("should return false for non-numeric values", () => {
    expect(isNumericValue("abc")).toBe(false);
    expect(isNumericValue("")).toBe(false);
    expect(isNumericValue(null)).toBe(false);
    expect(isNumericValue(undefined)).toBe(false);
    expect(isNumericValue(true)).toBe(false);
    expect(isNumericValue({})).toBe(false);
  });

  it("should return false for special numeric values", () => {
    expect(isNumericValue(NaN)).toBe(false);
    expect(isNumericValue(Infinity)).toBe(false);
    expect(isNumericValue(-Infinity)).toBe(false);
  });
});
