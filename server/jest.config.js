module.exports = {
  watchPathIgnorePatterns: ['\\.ts$'],
  setupFilesAfterEnv: ['<rootDir>/dist/lib/tests/prepare.js'],
  modulePaths: ['<rootDir>/dist'],
  testMatch: ['<rootDir>/dist/__tests__/**/*.js']
};
