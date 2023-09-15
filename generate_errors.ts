import { readCSV } from "https://deno.land/x/csv@v0.9.1/mod.ts";

const res = await fetch(
  "https://raw.githubusercontent.com/LonamiWebs/Telethon/v1/telethon_generator/data/errors.csv",
);
Deno.writeFileSync("errors.csv", new Uint8Array(await res.arrayBuffer()));

let code = 'import { types } from "./2_tl.ts";\n\n';
const map = new Map<string, string>();

for await (
  const row of readCSV(Deno.openSync("./errors.csv"), { fromLine: 1 })
) {
  const cells = new Array<string>();
  for await (const cell of row) {
    cells.push(cell);
  }
  if (cells.length != 3) {
    continue;
  }
  const [oerror] = cells;
  if (oerror.endsWith("X") || oerror.endsWith("INVALID2")) {
    console.log("Skipped", oerror + ".");
    continue;
  }
  let error = oerror;
  error = error.toLocaleLowerCase();
  error = error[0].toUpperCase() + error.slice(1);
  error = error.replace(/_([a-z])/g, (_, a) => a.toUpperCase());
  map.set(oerror, error);
  code += `export class ${error} extends types.RPCError {
  //
}

`;
}

code += "export const map = {\n";

for (const [k, v] of map.entries()) {
  code += `  ${k}: ${v},\n`;
}

code += "};\n";

Deno.writeTextFileSync("3_errors.ts", code.trim() + "\n");
Deno.remove("errors.csv");
