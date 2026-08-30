// Unit test of `cn()`, the helper that merges Tailwind classes.
// The point of `twMerge` is that the last class wins when two classes control
// the same property. That is the behaviour worth testing.
import { describe, it, expect } from "vitest";
import { cn } from "@/app/lib/cn";

describe("cn", () => {
  it("merges multiple classes", () => {
    expect(cn("px-2", "font-bold")).toBe("px-2 font-bold");
  });

  it("lets the last class win when two conflict", () => {
    // Without twMerge both would survive and the result would be arbitrary.
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("skips falsy values", () => {
    const isActive = false;

    expect(cn("btn", isActive && "btn-active")).toBe("btn");
    expect(cn("btn", null, undefined, "")).toBe("btn");
  });

  it("accepts conditions as an object and as an array", () => {
    expect(cn("btn", { "btn-active": true, "btn-disabled": false })).toBe(
      "btn btn-active"
    );
    expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
  });

  it("returns an empty string with no arguments", () => {
    expect(cn()).toBe("");
  });
});

describe("cn edge cases", () => {
  it("flattens nested arrays", () => {
    expect(cn(["px-2", ["py-1", ["font-bold"]]])).toBe("px-2 py-1 font-bold");
  });

  it("deduplicates Tailwind classes but not arbitrary strings", () => {
    // twMerge recognises px-2 as a Tailwind utility and collapses it.
    expect(cn("px-2", "px-2")).toBe("px-2");
    // "btn" is not a Tailwind class, so it passes through twice. Worth
    // knowing if you use your own class names.
    expect(cn("btn", "btn")).toBe("btn btn");
  });

  it("keeps classes that control different properties", () => {
    // px and py do not conflict, so both survive.
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("treats prefixed variants separately", () => {
    // The hover: variant and the base class control different states.
    expect(cn("text-red-500", "hover:text-blue-500")).toBe(
      "text-red-500 hover:text-blue-500"
    );
    // Two hover variants do conflict.
    expect(cn("hover:text-red-500", "hover:text-blue-500")).toBe(
      "hover:text-blue-500"
    );
  });

  it("returns an empty string when everything is falsy", () => {
    expect(cn(false, null, undefined, "")).toBe("");
  });

  it("keeps arbitrary classes it does not recognise", () => {
    expect(cn("min-egen-klasse", "px-2")).toBe("min-egen-klasse px-2");
  });
});
