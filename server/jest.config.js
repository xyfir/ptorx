module.exports = {
  setupFilesAfterEnv: ['<rootDir>/lib/tests/prepare.ts'],
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: ['<rootDir>/__tests__/**/*.ts']
};
