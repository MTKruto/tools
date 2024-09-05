import { join } from "https://deno.land/std@0.221.0/path/mod.ts";

function getSourceFiles(path: string) {
  return [...Deno.readDirSync(path)].filter((v) =>
    v.isFile && v.name.endsWith(".ts")
  ).map((v) => join(path, v.name));
}

const cwd = Deno.cwd();
const directories = [...Deno.readDirSync(cwd)].filter((v) => v.isDirectory).map(
  (v) => join(cwd, v.name),
);

export function* iterSourceFiles() {
  yield* getSourceFiles(cwd).concat(...directories.map(getSourceFiles));
}

export const licenseHeader = `/**
 * MTKruto - Cross-runtime JavaScript library for building Telegram clients
 * Copyright (C) 2023-${new Date().getFullYear()} Roj <https://roj.im/>
 *
 * This file is part of MTKruto.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */`;
