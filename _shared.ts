import { join } from "https://deno.land/std@0.221.0/path/mod.ts";

function getSourceFiles(path: string) {
  return [...Deno.readDirSync(path)].filter((v) =>
    v.isFile && v.name.endsWith(".ts")
  ).map((v) => join(path, v.name));
}

const cwd = Deno.cwd();
const directories = [...Deno.readDirSync(cwd)].filter((v) => v.isDirectory).map(
  (v) => join(cwd, v.name),
);

export function* iterSourceFiles() {
  yield* getSourceFiles(cwd).concat(...directories.map(getSourceFiles));
}
