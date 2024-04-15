import {
  Project,
  SyntaxKind,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts";

const project = new Project();
project.addSourceFilesAtPaths("./**/*.ts");

for (const sourceFile of project.getSourceFiles()) {
  const path = sourceFile.getFilePath();
  const stat = await Deno.stat(path);

  if (stat.size >= 100_000) {
    console.log("Skipping", path);
    continue;
  }

  console.log("Checking", sourceFile.getFilePath());
  const numericLiterals = sourceFile.getDescendantsOfKind(
    SyntaxKind.NumericLiteral,
  );

  for (const numericLiteral of numericLiterals) {
    if (numericLiteral.getText().startsWith("0x")) {
      numericLiteral.replaceWithText(
        "0x" +
          numericLiteral.getText().replace("0x", "").replaceAll("_", "")
            .toUpperCase().padStart(2, "0"),
      );
    }
  }

  await sourceFile.save();
}
