import { type MethodDeclaration, Project, SyntaxKind } from "jsr:@ts-morph/ts-morph@28.0.0";

const contextPath = Deno.args[0] ?? "client/4_context.ts";

const project = new Project();
const sourceFile = project.addSourceFileAtPath(contextPath);
const contextClass = sourceFile.getClassOrThrow("Context");
const members = contextClass.getMembers();

function isSortableMethod(member: MethodDeclaration) {
  const name = member.getName();
  return !name.startsWith("#") && !name.startsWith("has") && name !== "toJSON";
}

const methodRuns: MethodDeclaration[][] = [];
let currentRun: MethodDeclaration[] = [];

for (const member of members) {
  if (member.getKind() === SyntaxKind.MethodDeclaration && isSortableMethod(member as MethodDeclaration)) {
    currentRun.push(member as MethodDeclaration);
  } else if (currentRun.length !== 0) {
    methodRuns.push(currentRun);
    currentRun = [];
  }
}
if (currentRun.length !== 0) {
  methodRuns.push(currentRun);
}

const replacements = methodRuns.map((run) => {
  const text = run
    .map((method, index) => ({
      index,
      name: method.getName().replace(/^#/, ""),
      text: method.getFullText(),
    }))
    .toSorted((left, right) => {
      const byName = left.name.localeCompare(right.name);
      return byName === 0 ? left.index - right.index : byName;
    })
    .map((method) => method.text)
    .join("");

  return {
    end: run.at(-1)!.getEnd(),
    start: run[0].getFullStart(),
    text,
  };
});

for (const { end, start, text } of replacements.toReversed()) {
  sourceFile.replaceText(
    [start, end],
    text,
  );
}

sourceFile.saveSync();
