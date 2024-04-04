import $ from "https://deno.land/x/dax@0.31.1/mod.ts";

const v = Deno.args[0];

if (!v.startsWith("0")) throw new Error("Version not allowed");

await $`git tag ${v} -m ${v}`;
await $`git push`;
await $`git push origin ${v}`;
