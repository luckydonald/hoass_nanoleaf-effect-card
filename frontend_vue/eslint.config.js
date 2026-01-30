import airbnb from './eslint.airbnb.mjs';
import base from './eslint.base.js';
import ts from './eslint.ts.js';

/** @type { string[] } */
const OPTIONAL_CONFIGS = [
  'vue',
];

const optionals = await Promise.allSettled(
  OPTIONAL_CONFIGS.map(
    async (configName) => {
      try {
        return await import((`./eslint.${configName}.js`)).then(m => m.default ?? []);
      } catch {
        return [];
      }
    }
  )
);

export default [
  ...airbnb,
  ...base,
  ...ts,
  ...optionals,
];
