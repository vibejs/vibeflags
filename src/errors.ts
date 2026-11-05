/** Stable codes owned by `@usevibejs/flags`. They are not vibe.js `VIBE` codes. */
export const FLAGS_INVALID_CONFIG = "FLAGS_INVALID_CONFIG";

/** A flags configuration or usage error. `code` is stable. */
export class FlagsError extends Error {
  override readonly name = "FlagsError";
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
