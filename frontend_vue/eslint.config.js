import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import globals from 'globals';

import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

/* OPTIONAL – only needed if Vue is used */
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // ===========================================================================
  // Base JavaScript (minimal, predictable)
  // ===========================================================================
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      // Arrays
      'array-bracket-newline': ['error', { multiline: true, minItems: 1 }],
      'array-element-newline': ['error', 'always'],

      // Objects
      'object-curly-newline': ['error', { multiline: true, consistent: true }],
      'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],

      // Functions
      'function-call-argument-newline': ['error', 'consistent'],
      'function-paren-newline': ['error', 'multiline'],

      // Formatting / misc
      'comma-dangle': ['error', 'always-multiline'],
      'max-len': 'off',

      // Project conventions
      'no-underscore-dangle': 'off',
      'max-classes-per-file': ['error', 3],
      'class-methods-use-this': 'off',
      'no-console': 'warn',
      'no-restricted-globals': ['error', { name: 'event', message: 'Do not use global event' }],
      'default-case': 'off',
    },
  },

  // ===========================================================================
  // TypeScript (TYPE-CHECKED, core config)
  // ===========================================================================
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        project: path.join(__dirname, 'tsconfig.eslint.json'),
      },
    },

    rules: {
      // Naming (ported 1:1 from your old config)
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'property',
          format: ['camelCase', 'snake_case', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeProperty',
          format: ['camelCase', 'snake_case', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'objectLiteralProperty',
          format: null,
          filter: {
            regex: '^--[a-z0-9-]+$',
            match: true,
          },
        },
        {
          selector: 'method',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
      ],

      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: true, variables: true },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ===========================================================================
  // JS config files (no type checking)
  // ===========================================================================
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      parser: js.parsers.espree,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'array-bracket-newline': 'off',
      'array-element-newline': 'off',
    },
  },

  // ===========================================================================
  // TS config files (vite / vitest – NO type info)
  // ===========================================================================
  {
    files: ['vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'no-multiple-empty-lines': 'off',
    },
  },

  // ===========================================================================
  // OPTIONAL: Vue support (safe to delete if unused)
  // ===========================================================================
  ...vue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        projectService: true,
        tsconfigRootDir: __dirname,
        project: path.join(__dirname, 'tsconfig.eslint.json'),
        extraFileExtensions: ['.vue'],
      },
    },

    rules: {
      'vue/max-attributes-per-line': ['error', { singleline: 1, multiline: { max: 1 } }],
      'vue/html-closing-bracket-newline': ['error', { singleline: 'never', multiline: 'always' }],
      'vue/multiline-html-element-content-newline': [
        'error',
        { ignoreWhenEmpty: true, allowEmptyLines: false },
      ],
      'vue/html-indent': ['error', 2],
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'always', component: 'always' },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/no-deprecated-slot-attribute': [
        'error',
        {
          ignoreParents: [
            'ha-expansion-panel',
            'ha-button',
            'ha-fab',
            'ha-dialog',
          ],
        },
      ],
      'vue/v-slot-style': 'off',
      'vue/array-bracket-newline': ['error', 'consistent'],
      'vue/v-bind-style': ['error', 'shorthand', { sameNameShorthand: 'always' }],
    },
  },
];
