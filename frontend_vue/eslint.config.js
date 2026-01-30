import base from './eslint.base.js';
import ts from './eslint.ts.js';
import vue from './eslint.vue.js'; // optional, safe to remove if not using Vue

export default [
  ...base,
  ...ts,
  ...vue,
];
