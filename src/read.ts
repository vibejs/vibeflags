import { FLAGS_INVALID_CONFIG, FlagsError } from "./errors.ts";

/** A closed-by-default flag map. Only an explicit `true` turns a flag on. */
export type FlagMap = Readonly<Record<string, boolean>>;

/**
 * Whether `name` is on. A missing map, a missing name, and an explicit `false` are all off.
 * This function does not read the network.
 */
export function readFlag(flags: FlagMap | null | undefined, name: string): boolean {
  return flags?.[name] === true;
}

/** Copies a plain object of booleans, or throws `FLAGS_INVALID_CONFIG`. */
export function flagMap(flags: FlagMap | null | undefined): FlagMap {
  if (flags === null || flags === undefined || typeof flags !== "object" || Array.isArray(flags)) {
    throw invalid("flags must be an object of booleans.");
  }
  const copy: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(flags)) {
    if (typeof value !== "boolean") throw invalid(`Flag "${key}" must be a boolean.`);
    copy[key] = value;
  }
  return copy;
}

function invalid(message: string): FlagsError {
  return new FlagsError(FLAGS_INVALID_CONFIG, message);
}
