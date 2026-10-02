import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STYLES_DIR = path.join(ROOT, 'src', 'styles');

const ALLOWED_FILES = new Set([
  path.join('abstracts', '_tokens.scss'),
  path.join('abstracts', '_breakpoints.scss'),
]);

const PX_RE = /(?<![\w-])(\d+(?:\.\d+)?)px\b/g;
const HEX_RE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const BREAKPOINT_ONE_PX_RE =
  /\(\s*\$breakpoint-[\w-]+\s*[+-]\s*1px\s*\)/;
const LOCAL_TOKEN_DECL_RE = /^\s*\$[\w-]+\s*:/;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.name.endsWith('.scss')) {
      files.push(full);
    }
  }

  return files;
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function isLocalTokenDeclaration(line) {
  return LOCAL_TOKEN_DECL_RE.test(line);
}

function isAllowedPx(value, line) {
  if (value === '0px' || value === '0') {
    return true;
  }
  if (isLocalTokenDeclaration(line)) {
    return true;
  }
  if (value === '1px' && BREAKPOINT_ONE_PX_RE.test(line)) {
    return true;
  }
  return false;
}

const files = await walk(STYLES_DIR);
const findings = [];

for (const file of files) {
  const rel = path.relative(STYLES_DIR, file);
  if (ALLOWED_FILES.has(rel)) {
    continue;
  }

  const raw = await readFile(file, 'utf8');
  const lines = stripComments(raw).split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!line.trim()) {
      return;
    }

    for (const match of line.matchAll(PX_RE)) {
      const value = `${match[1]}px`;
      if (isAllowedPx(value, line)) {
        continue;
      }
      findings.push({ file: rel, line: index + 1, kind: 'length', value });
    }

    if (!isLocalTokenDeclaration(line)) {
      for (const match of line.matchAll(HEX_RE)) {
        findings.push({ file: rel, line: index + 1, kind: 'color', value: match[0] });
      }
    }
  });
}

if (findings.length > 0) {
  console.error(
    'Magic CSS values found. Declare a token in _tokens.scss or in this component SCSS ($name: …), then use the variable — not a raw px/hex in a property.\n',
  );
  for (const item of findings) {
    console.error(`  ${item.file}:${item.line}  ${item.kind}  ${item.value}`);
  }
  process.exit(1);
}

console.log('No raw magic CSS lengths or hex colors in properties.');
