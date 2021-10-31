module.exports = {
  preset: 'ts-jest',
  rootDir: './',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testMatch: ['<rootDir>/**/*.spec.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/test/'],
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
};
