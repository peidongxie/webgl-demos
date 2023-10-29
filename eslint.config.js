import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslintParser from '@typescript-eslint/parser';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['dist/*'],
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parser: typescriptEslintParser,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      'react-refresh': reactRefreshPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
  },
];
