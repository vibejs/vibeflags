# Vibe Flags

**Feature flags for vibe.js. Closed by default, with no network.**

The package name is `@usevibejs/flags`.

## Install

```bash
pnpm add @usevibejs/flags @usevibejs/ui @usevibejs/server @usevibejs/contract
```

## Quick start

Flags are an in-process map. Unknown names are off. `createFlagsPlugin` does not fetch, and `FlagsModule` does not call out to a flag service.

```ts
import { createFlagsPlugin, useFlag } from "@usevibejs/flags/ui";
import { FlagsModule } from "@usevibejs/flags/server";

FlagsModule.forRoot({ flags: { beta: true } });
createFlagsPlugin({ flags: { beta: true } });
const beta = useFlag("beta");
```

Pass `load` only when the application already has the map. The plugin never opens a connection.

## Error codes

See [docs/errors.md](docs/errors.md).

## Local development

```bash
pnpm install
pnpm check
```

`pnpm check` formats, lints, typechecks, and runs tests at 100% per-file coverage.

## Releases

Releases use changesets. A maintainer runs the Release workflow from main. Do not publish by hand.

## License

MIT. See [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
