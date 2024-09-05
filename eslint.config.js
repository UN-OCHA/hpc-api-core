const baseConfig = require('@unocha/hpc-repo-tools/eslint.config.base');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['.github', '.prettierrc.js', 'eslint.config.js'],
  },
];
