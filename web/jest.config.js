module.exports = {
  setupFilesAfterEnv: ['<rootDir>/lib/test-setup.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  modulePaths: ['<rootDir>']
};
