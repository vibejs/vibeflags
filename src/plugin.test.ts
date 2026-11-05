// @vitest-environment jsdom
import { createApp, nextTick } from "@usevibejs/ui";
import { flushPromises } from "@usevibejs/ui/testing";
import { expect, it, vi } from "vitest";
import { createFlagsPlugin, useFlag } from "./plugin.ts";

const Root = { render: () => document.createTextNode("") };

it("reads the flags it was given and ignores later edits", () => {
  const flags: Record<string, boolean> = { beta: true };
  const app = createApp(Root).use(createFlagsPlugin({ flags }));
  const [beta, old] = app.runWithContext(() => [useFlag("beta"), useFlag("old")]);
  flags.beta = false;
  expect(beta.value).toBe(true);
  expect(old.value).toBe(false);
});

it("is off without the plugin", () => {
  const beta = createApp(Root).runWithContext(() => useFlag("beta"));
  expect(beta.value).toBe(false);
});

it("starts from the given map and replaces it when load resolves", async () => {
  const app = createApp(Root).use(
    createFlagsPlugin({
      flags: { beta: false },
      load: async () => ({ beta: true, next: false }),
    }),
  );
  const [beta, next] = app.runWithContext(() => [useFlag("beta"), useFlag("next")]);
  expect(beta.value).toBe(false);
  await flushPromises();
  await nextTick();
  expect([beta.value, next.value]).toEqual([true, false]);
});

it("closes every flag when load fails or returns a non-boolean map", async () => {
  const failed = createApp(Root).use(
    createFlagsPlugin({
      flags: { beta: true },
      load: () => Promise.reject(new Error("offline")),
    }),
  );
  const beta = failed.runWithContext(() => useFlag("beta"));
  await flushPromises();
  await nextTick();
  expect(beta.value).toBe(false);

  const invalid = createApp(Root).use(
    createFlagsPlugin({
      flags: { beta: true },
      load: async () => ({ beta: "yes" }) as unknown as Record<string, boolean>,
    }),
  );
  const still = invalid.runWithContext(() => useFlag("beta"));
  await flushPromises();
  await nextTick();
  expect(still.value).toBe(false);
});

it("closes every flag when load returns null or an array", async () => {
  const load = vi.fn<() => Promise<Record<string, boolean>>>();
  load.mockResolvedValueOnce(null as unknown as Record<string, boolean>);
  const app = createApp(Root).use(createFlagsPlugin({ flags: { beta: true }, load }));
  const beta = app.runWithContext(() => useFlag("beta"));
  await flushPromises();
  await nextTick();
  expect(beta.value).toBe(false);

  load.mockResolvedValueOnce(["beta"] as unknown as Record<string, boolean>);
  const again = createApp(Root).use(createFlagsPlugin({ load }));
  const other = again.runWithContext(() => useFlag("beta"));
  await flushPromises();
  await nextTick();
  expect(other.value).toBe(false);
});

it("does not call fetch", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  createApp(Root).use(createFlagsPlugin());
  expect(fetchSpy).not.toHaveBeenCalled();
  fetchSpy.mockRestore();
});
