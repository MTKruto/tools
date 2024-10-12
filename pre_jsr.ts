import { parse } from "jsr:@std/jsonc@1";

const version = Deno.args[0];

if (!version.startsWith("0")) throw new Error("Version not allowed");

// deno-lint-ignore no-explicit-any
const config = parse(Deno.readTextFileSync("deno.jsonc")) as any;
Deno.writeTextFileSync(
  "deno.jsonc",
  JSON.stringify(
    { name: "@mtkruto/mtkruto", version, license: "LGPL-3.0-or-later", exports: "./mod.ts", ...config },
    null,
    2,
  ),
);
