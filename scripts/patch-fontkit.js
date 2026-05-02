const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "node_modules", "fontkit", "dist", "module.mjs");

if (!fs.existsSync(target)) {
  console.warn("[patch-fontkit] fontkit module file not found; skipping patch.");
  process.exit(0);
}

const content = fs.readFileSync(target, "utf8");
const search = 'import {applyDecoratedDescriptor as $5OpyM$applyDecoratedDescriptor} from "@swc/helpers";';
const replace = 'import {_apply_decorated_descriptor as $5OpyM$applyDecoratedDescriptor} from "@swc/helpers";';

if (!content.includes(search)) {
  console.warn("[patch-fontkit] target import line not found; patch may already be applied or fontkit version differs.");
  process.exit(0);
}

fs.writeFileSync(target, content.replace(search, replace), "utf8");
console.log("[patch-fontkit] applied patch to fontkit/dist/module.mjs");
