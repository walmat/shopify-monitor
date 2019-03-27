module.exports = {
  env: {
    browser: true,
  },
  extends: ['airbnb', 'prettier'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to', 'hrefLeft', 'hrefRight'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
    'no-underscore-dangle': 'off',
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
};
