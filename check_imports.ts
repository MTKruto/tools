const entries = Deno.readDirSync("./");

let err = false;
let errCount = 0;

for (const entry of entries) {
  if (!entry.isFile) {
    continue;
  }
  const match = entry.name.match(/^([0-9])_([^\.]+)\.ts$/);
  if (match == null) {
    continue;
  }
  const level = Number(match[1]);
  const dir = match[2];
  try {
    if (!Deno.statSync(dir).isDirectory) {
      continue;
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      continue;
    } else {
      throw err;
    }
  }
  for (const entry of Deno.readDirSync(dir)) {
    if (!entry.isFile || !entry.name.endsWith(".ts")) {
      continue;
    }
    const contents = Deno.readTextFileSync(dir + "/" + entry.name);
    for (const [i, line] of contents.split("\n").entries()) {
      const llevel = Number(line.match(/"..\/([0-9])+/)?.[1]);
      if (isNaN(llevel)) {
        continue;
      }
      if (llevel > level) {
        err = true;
        console.error(
          `${++errCount}.`,
          dir + "/" + entry.name + ":" + (i + 1),
          "|",
          llevel,
          ">",
          level,
        );
      }
    }
  }
}

console.error(
  errCount == 0
    ? "No errors were found."
    : errCount == 1
    ? "An error was found."
    : `${errCount} errors were found.`,
);

if (err) {
  Deno.exit(1);
}
