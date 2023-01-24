/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const config = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    // '^.+\\.(t|j)s$': 'ts-jest',
    '^.+\\.(t|j)sx?$': ['@swc/jest', { ...config }],
  },
};
