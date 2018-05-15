module.exports = {
  use: [
    '@neutrinojs/airbnb-base',
    [
      '@neutrinojs/library',
      {
        name: 'request-to-swagger'
      }
    ],
    '@neutrinojs/jest',
    [
      '@neutrinojs/eslint',
      {
        eslint: {
          rules: { "quote-props": ["error", "as-needed", { "numbers": true }] }
        }
      }
    ],
    'neutrino-preset-flow',
    'neutrino-preset-prettier-eslint',
  ]
};
