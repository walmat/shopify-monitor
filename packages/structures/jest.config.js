const path = require('path');

module.exports = {
  transform: {
    '^.+\\.jsx?$': path.resolve(__dirname, '../../config/babelJestTransformer.js'),
  },
  verbose: false,
  collectCoverageFrom: ['src/**/*.js', '!src/__tests__/__utils__/'],
  testPathIgnorePatterns: ['/node_modules/', 'dist/', 'src/__tests__/__utils__/', '.eslintrc.js'],
};
