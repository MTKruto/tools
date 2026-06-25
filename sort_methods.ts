import { type MethodDeclaration, Project } from "jsr:@ts-morph/ts-morph@28.0.0";

const paths = Deno.args.length === 0
  ? [
    "client/1_client_generic.ts",
    "client/6_client_dispatcher.ts",
    "client/6_client.ts",
  ]
  : Deno.args;

const sectionPattern =
  /^(\s*\/\/\s*\n\s*\/\/ ========================= .+ ========================= \/\/\s*\n\s*\/\/\s*\n)/gm;

const project = new Project();

function getMainClass(sourceFile: ReturnType<Project["addSourceFileAtPath"]>) {
  const classDeclaration = sourceFile.getClasses()[0];
  if (classDeclaration === undefined) {
    throw new Error(`No class found in ${sourceFile.getFilePath()}`);
  }
  return classDeclaration;
}

function getSectionBoundaries(text: string) {
  const sections = [...text.matchAll(sectionPattern)].map((match) => ({
    contentStart: match.index! + match[1].length,
    sectionStart: match.index!,
  }));

  return sections.map((section, index) => ({
    contentEnd: sections[index + 1]?.sectionStart ?? text.length,
    contentStart: section.contentStart,
  }));
}

function getMethodSegmentStart(
  text: string,
  method: MethodDeclaration,
  sectionStart: number,
): number {
  return Math.max(method.getFullStart(), sectionStart);
}

function normalizeMethodSegment(text: string): string {
  const trimmed = text.replace(/^\n+/, "");
  return trimmed.startsWith("  ") ? trimmed : `  ${trimmed}`;
}

for (const path of paths) {
  const sourceFile = project.addSourceFileAtPath(path);
  const classDeclaration = getMainClass(sourceFile);
  const methods = classDeclaration.getMethods();
  const text = sourceFile.getFullText();
  const replacements = [];

  for (const section of getSectionBoundaries(text)) {
    const sectionMethods = methods.filter((method) =>
      method.getStart() >= section.contentStart &&
      method.getEnd() <= section.contentEnd
    );

    if (sectionMethods.length < 2) {
      continue;
    }

    const sortedText = sectionMethods
      .map((method, index) => ({
        index,
        name: method.getName().replace(/^#/, ""),
        text: text.slice(
          getMethodSegmentStart(text, method, section.contentStart),
          method.getEnd(),
        ),
      }))
      .toSorted((left, right) => {
        const byName = left.name.localeCompare(right.name);
        return byName === 0 ? left.index - right.index : byName;
      })
      .map((method) => normalizeMethodSegment(method.text))
      .join("\n\n");

    replacements.push({
      end: sectionMethods.at(-1)!.getEnd(),
      start: getMethodSegmentStart(
        text,
        sectionMethods[0],
        section.contentStart,
      ),
      text: sortedText,
    });
  }

  for (const replacement of replacements.toReversed()) {
    sourceFile.replaceText(
      [replacement.start, replacement.end],
      replacement.text,
    );
  }

  sourceFile.saveSync();
}
