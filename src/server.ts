// oxlint-disable typescript/no-extraneous-class -- module classes are containers
import {
  Controller,
  Handle,
  Module,
  inject,
  token,
  type DynamicModule,
  type Token,
} from "@usevibejs/server";
import { flagsContract } from "./contract.ts";
import { flagMap, readFlag, type FlagMap } from "./read.ts";

/** The flags configured for this process. */
export interface Flags {
  readonly all: FlagMap;
  enabled(name: string): boolean;
}

/** Inject this to read flags on the server. Unknown names are off. */
export const FLAGS: Token<Flags> = token<Flags>("FLAGS");

export interface FlagsModuleOptions {
  /** Explicit toggles. Omitted and unknown names are off. */
  readonly flags?: FlagMap;
}

class FlagsReader implements Flags {
  readonly all: FlagMap;

  constructor(flags: FlagMap) {
    this.all = flags;
  }

  enabled(name: string): boolean {
    return readFlag(this.all, name);
  }
}

@Controller(flagsContract)
class FlagsController {
  private readonly flags = inject(FLAGS);

  @Handle(flagsContract.list)
  list(): FlagMap {
    return this.flags.all;
  }
}

/**
 * Serves `GET /flags` from memory. The module never calls the network.
 * Import `FlagsModule.forRoot({ flags })`.
 */
@Module({})
export class FlagsModule {
  static forRoot(options: FlagsModuleOptions = {}): DynamicModule {
    const flags = flagMap(options.flags ?? {});
    return {
      module: FlagsModule,
      global: true,
      controllers: [FlagsController],
      providers: [{ provide: FLAGS, useValue: new FlagsReader(flags) }],
      exports: [FLAGS],
    };
  }
}
