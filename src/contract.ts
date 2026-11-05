import { defineContract, get } from "@usevibejs/contract";
import * as v from "valibot";

/** `GET /flags` returns the configured map. Missing names stay closed on the client. */
export const flagsContract = defineContract("/flags", {
  list: get("/", { response: v.record(v.string(), v.boolean()) }),
});
