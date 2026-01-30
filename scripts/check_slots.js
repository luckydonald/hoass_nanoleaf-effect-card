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
  // Regex that matches open/close tags and captures slash, tag name and attributes
  // Example matches: <div class="x">, </div>, <img src="" />
  const tagRegex = /<\s*(\/?)\s*([a-zA-Z0-9-]+)([^>]*)>/g;
  const stack = [];
  const problems = [];
  let m;

  while ((m = tagRegex.exec(text))) {
    const isClose = m[1] === '/';
    const tag = m[2];
    const attrs = m[3] || '';

    // Determine if self-closing like <br /> or <img .../> by checking attrs trailing slash
    const isSelfClose = /\/\s*$/.test(attrs.trim());

    if (!isClose) {
      // Opening tag: parent is current top of stack
      const parent = stack.length ? stack[stack.length - 1].tag : null;

      // Find slot attribute (support single or double quotes)
      const slotMatch = attrs.match(/\bslot\s*=\s*['\"]([^'\"]+)['\"]/);
      if (slotMatch) {
        const slot = slotMatch[1];
        // If tag itself is ha-* it's allowed
        if (!tag.startsWith('ha-')) {
          // Otherwise allow if parent is ha-*
          if (!(parent && parent.startsWith('ha-'))) {
            const upTo = text.slice(0, m.index);
            const line = upTo.split('\n').length;
            problems.push({ file, line, tag, slot, attrs });
          }
        }
      }

      // Push non-self-closing opening tags to stack
      if (!isSelfClose) {
        stack.push({ tag, index: m.index });
      }
    } else {
      // Closing tag: pop matching opening tag if present
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          stack.splice(i, 1);
          break;
        }
      }
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
    console.error('Found slot attributes on non-ha-* elements (and no ha-* parent):');
    for (const p of all) {
      console.error(`${p.file}:${p.line}: <${p.tag}> uses slot="${p.slot}"`);
    }
    process.exitCode = 2;
  } else {
    console.log('No problems found.');
  }
}

main();
