import { licenseHeader } from "./_shared.ts";

const directories = [
  "client",
  "connection",
  "storage",
  "tl",
  "transport",
  "types",
  "utilities",
];

for (const dir of directories) {
  for (const entry of Deno.readDirSync(dir)) {
    if (!entry.isFile) {
      continue;
    }
    if (!entry.name.endsWith(".ts")) {
      continue;
    }
    let x = false;
    let c = Deno.readTextFileSync(dir + "/" + entry.name);
    if (c.startsWith(licenseHeader)) {
      x= true
      c = c.slice(licenseHeader.length).trim();
    }
    let lines = c.split("\n");
    if (!lines[0].startsWith("import ")) {
      continue;
    }
    let imports = new Array<string>();
    for (const line of lines) {
      if (line.startsWith("import ")) {
        imports.push(line);
      }
    }
    lines = lines.slice(imports.length);
    imports = imports
      .sort((a, b) =>
        a.replace(/^import.+from/, "").localeCompare(
          b.replace(/^import.+from/, ""),
        )
      )
      .sort((a, b) => {
        const bMatch = b.match(/\./g);
        const aMatch = a.match(/\./g);
        if (!bMatch || !aMatch) {
          return -1;
        }
        return b.match(/\./g)!.length - a.match(/\./g)!.length;
      });

    Deno.writeTextFileSync(
      dir + "/" + entry.name,
      (x? licenseHeader + "\n\n" : "") +
        (imports.join("\n") + "\n" + lines.join("\n")).trim() + "\n",
    );
  }
}
