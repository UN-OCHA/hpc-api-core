import baseConfig from '@unocha/hpc-repo-tools/eslint.config.base.js';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['.github', 'prettier.config.mjs', 'eslint.config.mjs'],
  },
];
