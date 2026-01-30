import base from './eslint.base.js';
import ts from './eslint.ts.js';

let vue = [];
try {
  // Only import if vue is installed
  vue = await import('./eslint.vue.js').then(m => m.default ?? []);
} catch {
  // vue not installed, silently skip
}

export default [
  ...base,
  ...ts,
  ...vue,
];
