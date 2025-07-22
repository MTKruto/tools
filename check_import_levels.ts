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
  const thisLevel = p;

  const sourceFile = project.addSourceFileAtPath(file);
  if (file === "mod.ts" || file.endsWith("/mod.ts")) {
    continue;
  }
  interface RIL {
    spec: string;
    line: number;
    export: boolean;
    level: string;
  }
  const relativeImportLevels: RIL[] = sourceFile.getExportDeclarations()
    .map((
      v,
    ) => ({
      spec: v.getModuleSpecifier()?.getLiteralText(),
      line: v.getStartLineNumber(),
      export: true,
    }))
    .concat(
      sourceFile.getImportDeclarations().map((
        v,
      ) => ({
        spec: v.getModuleSpecifier()?.getLiteralText(),
        line: v.getStartLineNumber(),
        export: false,
      })),
    )
    .filter((v): v is Omit<RIL, "level"> => !!v.spec)
    .filter((v) => v.spec.startsWith("./"))
    .filter((v) => v.spec.split("/").length === 2)
    .map((v): RIL | false => {
      const p = v.spec.split("/").slice(-1)[0].split("_")[0];
      if (!p) {
        return false;
      }
      return { ...v, level: p };
    })
    .filter((v): v is RIL => !!v);
  project.removeSourceFile(sourceFile);
  for (const i of relativeImportLevels) {
    if (i.level === thisLevel && file.endsWith("_test.ts")) {
      continue; // exception
    }
    if (i.level.charCodeAt(0) >= thisLevel.charCodeAt(0)) {
      console.log(red("Violation"), file + ":" + i.line);
      ++violationCount;
    }
  }
  const high = relativeImportLevels.sort((a, b) =>
    b.level.charCodeAt(0) - a.level.charCodeAt(0)
  )[0];
  if (
    high !== undefined &&
    (high.level.charCodeAt(0) + 1 !== thisLevel.charCodeAt(0))
  ) {
    if (file.endsWith("_test.ts")) {
      continue; // exception
    }
    console.log(red("Violation"), file + ":" + high.line);
    ++violationCount;
  }

  const counts: Record<string, number> = {};
  for (const i of relativeImportLevels) {
    counts[i.spec + i.export] ??= 0;
    ++counts[i.spec + i.export];
    if (counts[i.spec + i.export] > 1) {
      console.log(red("Violation"), file + ":" + i.line, "(" + i.spec + ")");
      ++violationCount;
    }
  }
}

console.log(
  violationCount == 0 ? "No" : violationCount + "",
  "violation" + (violationCount == 1 ? " was" : "s were"),
  "found.",
);
if (violationCount) {
  Deno.exit(1);
}
