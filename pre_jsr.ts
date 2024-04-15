import { parse } from "https://deno.land/std@0.217.0/jsonc/mod.ts";

const version = Deno.args[0];

if (!version.startsWith("0")) throw new Error("Version not allowed");

// deno-lint-ignore no-explicit-any
const config = parse(Deno.readTextFileSync("deno.jsonc")) as any;
Deno.writeTextFileSync(
  "deno.jsonc",
  JSON.stringify(
    { name: "@mtkruto/mtkruto", version, exports: "./mod.ts", ...config },
    null,
    2,
  ),
);
