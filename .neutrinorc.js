module.exports = {
  use: [
    '@neutrinojs/airbnb-base',
    [
      '@neutrinojs/library',
      {
        name: 'request-to-swagger'
      }
    ],
    '@neutrinojs/jest'
  ]
};
