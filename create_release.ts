import $ from "https://deno.land/x/dax@0.31.1/mod.ts";

const v = Deno.args[0];

if (!v.startsWith("0")) throw new Error("Version not allowed");

const content = Deno.readTextFileSync("4_constants.ts");

Deno.writeTextFileSync("4_constants.ts", content.replace(/(MTKruto )[0-9]+.[0-9]+.[0-9]+(";\n)/, `$1${v}$2`));

await $`git add constants.ts`;
await $`git commit -m "Change version constant"`;
await $`git tag ${v} -m ${v}`;
await $`git push`;
await $`git push origin ${v}`;
