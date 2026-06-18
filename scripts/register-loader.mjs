import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const dir = pathToFileURL(fileURLToPath(new URL(".", import.meta.url)));
register(new URL("./loader.mjs", dir));
