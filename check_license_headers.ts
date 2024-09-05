import { iterSourceFiles, licenseHeader } from "./_shared.ts";
import { red } from "https://deno.land/std@0.221.0/fmt/colors.ts";

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
