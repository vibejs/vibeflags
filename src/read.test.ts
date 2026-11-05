import { describe, expect, it } from "vitest";
import { FLAGS_INVALID_CONFIG } from "./errors.ts";
import { flagMap, readFlag } from "./read.ts";

describe("readFlag", () => {
  it("is on only for an explicit true", () => {
    expect(readFlag({ beta: true, old: false }, "beta")).toBe(true);
    expect(readFlag({ beta: true, old: false }, "old")).toBe(false);
    expect(readFlag({ beta: true }, "missing")).toBe(false);
    expect(readFlag(undefined, "beta")).toBe(false);
    expect(readFlag(null, "beta")).toBe(false);
  });
});

describe("flagMap", () => {
  it("copies a boolean map and ignores later edits", () => {
    const source: Record<string, boolean> = { beta: true };
    const copy = flagMap(source);
    source.beta = false;
    expect(copy).toEqual({ beta: true });
    expect(flagMap({})).toEqual({});
  });

  it("rejects values that are not a plain boolean map", () => {
    expect(() => flagMap(undefined)).toThrow(
      expect.objectContaining({ code: FLAGS_INVALID_CONFIG }),
    );
    expect(() => flagMap(null)).toThrow(expect.objectContaining({ code: FLAGS_INVALID_CONFIG }));
    expect(() => flagMap(["no"] as unknown as Record<string, boolean>)).toThrow(
      expect.objectContaining({ code: FLAGS_INVALID_CONFIG }),
    );
    expect(() => flagMap({ beta: "yes" as unknown as boolean })).toThrow(/beta/);
    expect(() => flagMap(1 as unknown as Record<string, boolean>)).toThrow(
      expect.objectContaining({ code: FLAGS_INVALID_CONFIG }),
    );
  });
});
