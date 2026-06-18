import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

const srcRoot = new URL("../src/", import.meta.url);

function resolveWithExtensions(baseUrl) {
  const pathname = baseUrl.pathname;
  if (existsSync(pathname)) {
    return pathToFileURL(pathname).href;
  }

  const extensions = [".ts", ".tsx", "/index.ts", "/index.tsx", ".js"];
  for (const ext of extensions) {
    const candidate = pathname + ext;
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }

  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      url: new URL("./shims/server-only.mjs", import.meta.url).href,
      shortCircuit: true,
    };
  }

  if (specifier.startsWith("@/")) {
    const relative = specifier.slice(2);
    const resolved = resolveWithExtensions(new URL(relative, srcRoot));
    if (resolved) {
      return nextResolve(resolved, context);
    }
  }

  if (specifier.startsWith(".")) {
    const resolved = resolveWithExtensions(new URL(specifier, context.parentURL));
    if (resolved) {
      return nextResolve(resolved, context);
    }
  }

  return nextResolve(specifier, context);
}
