import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactCompiler from 'eslint-plugin-react-compiler';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores([
    '**/dist',
    '**/node_modules',
    '**/.turbo',
    '**/.wrangler',
    '**/coverage',
    '**/.eslintcache',
  ]),
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      // Downgrades 'error' to 'warn' so it doesn't block the UI/Build
      '@typescript-eslint/no-unused-vars': 'warn',

      // Keep your existing React Compiler rules
      'react-compiler/react-compiler': 'error',
    },
  },
  {
    files: ['apps/api/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        Cloudflare: 'readonly',
        globalThis: 'readonly',
      },
      parserOptions: {
        tsconfigRootDir: path.join(__dirname, 'apps/api'),
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': 'warn',
    },
  },
]);
