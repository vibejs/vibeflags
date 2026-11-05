import { expect, it } from "vitest";
import { FLAGS_INVALID_CONFIG, FlagsError, flagMap, readFlag } from "./index.ts";

it("re-exports the closed-by-default reader", () => {
  expect(readFlag(flagMap({ beta: true }), "beta")).toBe(true);
  expect(new FlagsError(FLAGS_INVALID_CONFIG, "bad").code).toBe(FLAGS_INVALID_CONFIG);
});
