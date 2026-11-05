import { createClient } from "@usevibejs/contract";
import { JsonLogger, Module } from "@usevibejs/server";
import { VibeFactory } from "@usevibejs/server";
import { expect, it } from "vitest";
import { flagsContract } from "./contract.ts";
import { FLAGS_INVALID_CONFIG } from "./errors.ts";
import { FLAGS, FlagsModule } from "./server.ts";

async function boot(flags?: Record<string, boolean>) {
  @Module({ imports: [FlagsModule.forRoot(flags === undefined ? {} : { flags })] })
  class AppModule {}
  return VibeFactory.create(AppModule, { logger: new JsonLogger({ level: "silent" }) });
}

it("serves the configured flags and keeps unknown names off", async () => {
  const app = await boot({ beta: true, old: false });
  const api = createClient({ flags: flagsContract }, { baseUrl: "", fetch: app.fetch });
  expect(await api.flags.list()).toMatchObject({ ok: true, data: { beta: true, old: false } });
  const flags = app.get(FLAGS);
  expect(flags.enabled("beta")).toBe(true);
  expect(flags.enabled("old")).toBe(false);
  expect(flags.enabled("missing")).toBe(false);
  await app.close();
});

it("starts closed when no flags are configured", async () => {
  const app = await VibeFactory.create(
    (() => {
      @Module({ imports: [FlagsModule.forRoot()] })
      class AppModule {}
      return AppModule;
    })(),
    { logger: new JsonLogger({ level: "silent" }) },
  );
  const response = await app.request("/flags");
  expect(await response.json()).toEqual({});
  await app.close();
});

it("rejects a non-boolean flag at configuration", () => {
  expect(() => FlagsModule.forRoot({ flags: { beta: 1 as unknown as boolean } })).toThrow(
    expect.objectContaining({ code: FLAGS_INVALID_CONFIG, name: "FlagsError" }),
  );
});
