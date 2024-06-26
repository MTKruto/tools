import { basename } from "https://deno.land/std@0.221.0/path/mod.ts";
import { red } from "https://deno.land/std@0.221.0/fmt/colors.ts";
import { Project } from "https://deno.land/x/ts_morph@22.0.0/mod.ts";
import { iterSourceFiles } from "./_shared.ts";

// ==== CHECK IMPORT LEVELS ==== //
let violationCount = 0;
const project = new Project();
for (const file of iterSourceFiles()) {
  const p = basename(file).split("_")[0];
  if (!p) {
    continue;
  }
  const thisLevel = Number(p);
  if (isNaN(thisLevel)) {
    continue;
  }

  const sourceFile = project.addSourceFileAtPath(file);
  const relativeImportLevels = sourceFile.getExportDeclarations()
    .map((
      v,
    ) => [v.getModuleSpecifier()?.getLiteralText(), v.getStartLineNumber()])
    .concat(
      sourceFile.getImportDeclarations().map((
        v,
      ) => [v.getModuleSpecifier().getLiteralText(), v.getStartLineNumber()]),
    )
    .filter((v): v is [string, number] => !!v[0])
    .filter((v) => v[0].startsWith("./"))
    .map((v) => {
      const p = v[0].slice(2).split("_")[0];
      if (!p) {
        return [NaN, v[1]];
      }
      return [p, v[1]];
    })
    .filter((v): v is [number, number] => !isNaN(v[0] as number));
  project.removeSourceFile(sourceFile);
  for (const [l, line] of relativeImportLevels) {
    if (l == thisLevel && file.endsWith("_test.ts")) {
      continue; // exception
    }
    if (l >= thisLevel) {
      console.log(red("Violation"), file + ":" + line);
      ++violationCount;
    }
  }
}

console.log(
  violationCount == 0 ? "No" : violationCount + "",
  "violation" + (violationCount == 1 ? " was" : "s were"),
  " found.",
);
if (violationCount) {
  Deno.exit(1);
}
