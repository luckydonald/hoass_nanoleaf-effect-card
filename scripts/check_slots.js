#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir) {
  const res = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      res.push(...walk(p));
    } else if (ent.isFile() && p.endsWith('.vue')) {
      res.push(p);
    }
  }
  return res;
}

function checkFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const regex = /<([a-zA-Z0-9-]+)([^>]*)\s+slot\s*=\s*"([^"]+)"/g;
  const problems = [];
  let m;
  while ((m = regex.exec(text))) {
    const tag = m[1];
    const attrs = m[2];
    const slot = m[3];
    // Allow ha- prefixed tags
    if (!tag.startsWith('ha-')) {
      // compute line number
      const upTo = text.slice(0, m.index);
      const line = upTo.split('\n').length;
      problems.push({ file, line, tag, slot, attrs });
    }
  }
  return problems;
}

function main() {
  const base = process.argv[2] || '.';
  const files = walk(base);
  const all = [];
  for (const f of files) {
    all.push(...checkFile(f));
  }
  if (all.length) {
    console.error('Found slot attributes on non-ha-* elements:');
    for (const p of all) {
      console.error(`${p.file}:${p.line}: <${p.tag}> uses slot="${p.slot}"`);
    }
    process.exitCode = 2;
  } else {
    console.log('No problems found.');
  }
}

main();
