module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    // Use an eslint-specific tsconfig that includes tests and config files
    project: './tsconfig.eslint.json',
    // Quiet the unsupported TypeScript version warning for now
    warnOnUnsupportedTypeScriptVersion: false,
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:vue/vue3-recommended',
  ],
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    // Arrays: force elements on separate lines
    'array-bracket-newline': ['error', { multiline: true, minItems: 1 }],
    'array-element-newline': ['error', 'always'],

    // Objects
    'object-curly-newline': ['error', { multiline: true, consistent: true }],
    // Allow short object properties on same line to avoid noisy errors for small inline objects
    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],

    // Functions
    'function-call-argument-newline': ['error', 'consistent'],
    'function-paren-newline': ['error', 'multiline'],

    // Imports and commas
    'comma-dangle': ['error', 'always-multiline'],
    // Don't enforce maximum line length in this project
    'max-len': 'off',

    // Vue template rules
    'vue/max-attributes-per-line': ['error', { singleline: 1, multiline: { max: 1 } }],
    'vue/html-closing-bracket-newline': ['error', { singleline: 'never', multiline: 'always' }],
    'vue/multiline-html-element-content-newline': ['error', { ignoreWhenEmpty: true, allowEmptyLines: false }],
    'vue/html-indent': ['error', 2],
    // Prefer self-closing form for void elements like <input />, <img />, <br /> to match HTML XML-style preferences
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
        // Allow normal HTML elements to be self-closing
        normal: 'always',
        component: 'always',
      },
      svg: 'always',
      math: 'always',
    }],
    // Disable rules that auto-convert legacy `slot` attributes to `v-slot` templates
    // for custom web components (Home Assistant `ha-*` elements). These are not
    // Vue components and should keep their native `slot="..."` attribute.
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
    'vue/array-bracket-newline': [
      "error",
      "consistent",
    ],
    "vue/v-bind-style": [
      "error",
      "shorthand", {
        "sameNameShorthand": "always",
      }
    ],
    // Project-specific relaxations to match existing code style
    // Allow underscore usage in properties and members (Home Assistant style)
    'no-underscore-dangle': 'off',
    'max-classes-per-file': ['error', 3],
    'class-methods-use-this': 'off',
    'no-console': 'warn',
    'no-restricted-globals': ['error', { name: 'event', message: 'Do not use global event' }],
    'no-spaced-func': 'off', // deprecated, trouble with TS
    'default-case': 'off',
  },
  overrides: [
    // JavaScript config files (no type checking)
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      rules: {
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'array-bracket-newline': 'off',
        'array-element-newline': 'off',
      },
    },
    // Config files in TypeScript (NO airbnb-typescript, NO type checking)
    {
      files: ['vite.config.ts', 'vitest.config.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        // Explicitly NO project or projectService
      },
      plugins: ['@typescript-eslint'],
      // Only use base rules, NOT airbnb-typescript/base
      rules: {
        // Disable all TypeScript rules that require type information
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/no-implied-eval': 'off',
        '@typescript-eslint/no-throw-literal': 'off',
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'array-bracket-newline': 'off',
        'array-element-newline': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'no-multiple-empty-lines': 'off',
        // Use base eslint rules instead
        'dot-notation': 'off',
        'no-implied-eval': 'error',
        'no-throw-literal': 'error',
      },
    },
    // Vue files
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        projectService: true,
        tsconfigRootDir: __dirname,
        project: `${__dirname}/tsconfig.eslint.json`,
        extraFileExtensions: ['.vue'],
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/stylistic-type-checked',
      ],
    },
    // TypeScript source files
    {
      files: ['src/**/*.{ts,tsx}', '*.ts'],
      excludedFiles: ['vite.config.ts', 'vitest.config.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        project: `${__dirname}/tsconfig.eslint.json`,
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/stylistic-type-checked',
      ],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'default',
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'forbid',
          },
          {
            // Allow object properties (including interface/type properties) to use snake_case
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
            // Allow object literal properties that are CSS custom properties (e.g. "--hour-background")
            selector: 'objectLiteralProperty',
            format: null,
            filter: {
              regex: '^--[a-z0-9-]+$',
              match: true,
            },
          },
          // Allow leading underscore for class methods and functions (common internal helpers)
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
        '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      },
    },
    // Test files (with type checking but relaxed rules)
    {
      files: ['tests/**/*.ts', 'tests/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        project: `${__dirname}/tsconfig.eslint.json`,
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/stylistic-type-checked',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'array-bracket-newline': 'off',
        'array-element-newline': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'no-multiple-empty-lines': 'off',
      },
    },
  ],
};
