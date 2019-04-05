const pkg = require('./package');

module.exports = {
  displayName: pkg.name,
  transform: {
    '^.+\\.jsx?$': '<rootDir>/../../config/babelJestTransformer.js',
  },
  verbose: false,
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/__tests__/__utils__/'],
  testPathIgnorePatterns: ['/node_modules/', 'dist/', 'src/__tests__/__utils__/', '.eslintrc.js'],
};
