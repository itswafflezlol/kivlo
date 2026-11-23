// next 16 emits prefetch payloads nested (route/__next.seg/**/__PAGE__.txt)
// but the client requests them flattened (route/__next.seg....__PAGE__.txt).
import { cpSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../out", import.meta.url));
if (!existsSync(out)) process.exit(0);

const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (!statSync(p).isDirectory()) continue;
    if (e.startsWith("__next.")) {
      const flat = (sub) => {
        for (const c of readdirSync(p + (sub ? "/" + sub : ""))) {
          const rel = sub ? `${sub}/${c}` : c;
          const fp = join(p, rel);
          if (statSync(fp).isDirectory()) flat(rel);
          else cpSync(fp, join(dir, `${e}.${rel.replaceAll("/", ".")}`));
        }
      };
      flat("");
    } else walk(p);
  }
};
walk(out);
console.log("fix-export: flattened prefetch payloads");
