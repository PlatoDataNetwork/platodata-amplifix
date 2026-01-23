import fs from "fs";
import path from "path";
function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyIfExists(src, dest) {
  const data = readFileSafe(src);
  if (!data) {
    console.warn(`[replicate] skip: missing ${src}`);
    return false;
  }
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, data, "utf8");
  console.log(`[replicate] wrote: ${dest}`);
  return true;
}

function parseLangCodes(tsSource) {
  const codes = new Set();
  const re = /code:\s*["'`]([^"'`]+)["'`]/g;
  let m;
  while ((m = re.exec(tsSource)) !== null) {
    codes.add(m[1]);
  }
  return Array.from(codes);
}

function main() {
  const projectRoot = process.cwd();
  const distDir = path.join(projectRoot, "dist");
  const srcLangFile = path.join(projectRoot, "src", "lib", "i18nLanguages.ts");

  const ts = readFileSafe(srcLangFile);
  if (!ts) {
    console.error("[replicate] ERROR: cannot read src/lib/i18nLanguages.ts");
    process.exit(1);
  }
  const langs = parseLangCodes(ts).filter((c) => c && c !== "en");
  if (langs.length === 0) {
    console.warn("[replicate] WARNING: no non-en languages found, nothing to replicate");
    return;
  }

  const baseRoutes = [
    { base: "", file: path.join(distDir, "index.html") },
    { base: "solutions", file: path.join(distDir, "solutions", "index.html") },
    { base: "intel", file: path.join(distDir, "intel", "index.html") },
    { base: "data-feeds", file: path.join(distDir, "data-feeds", "index.html") },
    { base: "api-docs", file: path.join(distDir, "api-docs", "index.html") },
  ];

  for (const lang of langs) {
    copyIfExists(path.join(distDir, "index.html"), path.join(distDir, lang, "index.html"));

    for (const r of baseRoutes.slice(1)) {
      const dest = path.join(distDir, lang, r.base, "index.html");
      copyIfExists(r.file, dest);
    }
  }

  console.log(`[replicate] done. Languages replicated: ${langs.join(", ")}`);
}

main();
