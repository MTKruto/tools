import { iterSourceFiles, licenseHeader } from "./_shared.ts";
import { red } from "jsr:@std/fmt@1/colors";

let c = 0;
for (const file of iterSourceFiles()) {
  const contents = Deno.readTextFileSync(file);
  if (!contents.startsWith(licenseHeader)) {
    ++c;
    console.log(red("Missing license header"), file);
  }
}

if (c) {
  Deno.exit(1);
}
