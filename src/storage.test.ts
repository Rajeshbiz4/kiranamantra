import { describe, expect, it } from "vitest";
import { parseStoredValue } from "./storage";

describe("storage migration", () => {
  it("reads legacy plain-text language values", () =>
    expect(parseStoredValue("mr", "en")).toBe("mr"));
  it("reads JSON language values", () =>
    expect(parseStoredValue('"hi"', "en")).toBe("hi"));
  it("uses fallback for invalid structured data", () =>
    expect(parseStoredValue("broken", [])).toEqual([]));
});
