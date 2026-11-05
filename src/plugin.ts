import {
  computed,
  inject,
  shallowRef,
  type InjectionKey,
  type Plugin,
  type Ref,
  type ShallowRef,
} from "@usevibejs/ui";
import { readFlag, type FlagMap } from "./read.ts";

const FLAGS: InjectionKey<ShallowRef<FlagMap>> = Symbol("flags");

export interface FlagsPluginOptions {
  /** Flags available immediately. Omitted names are off. */
  readonly flags?: FlagMap;
  /**
   * Optional in-process loader. The plugin does not fetch. Until this resolves, `flags` apply.
   * A rejection or a value that is not a boolean map closes every flag.
   */
  readonly load?: () => Promise<FlagMap>;
}

function isFlagMap(value: unknown): value is FlagMap {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === "boolean");
}

/** Provides flags to `useFlag`. There is no network call. */
export function createFlagsPlugin(options: FlagsPluginOptions = {}): Plugin {
  const initial = { ...(options.flags ?? {}) };
  return (app) => {
    const state = shallowRef<FlagMap>({ ...initial });
    app.provide(FLAGS, state);
    const load = options.load;
    if (!load) return;
    void Promise.resolve()
      .then(load)
      .then((flags) => {
        state.value = isFlagMap(flags) ? { ...flags } : {};
      })
      .catch(() => {
        state.value = {};
      });
  };
}

/** Whether `name` is on. Without the plugin, and for unknown names, this is `false`. */
export function useFlag(name: string): Readonly<Ref<boolean>> {
  const state = inject(FLAGS, null);
  return computed(() => readFlag(state?.value, name));
}
