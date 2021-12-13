module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-idiomatic-order'
  ],
  rules: {
    'unit-allowed-list': ['em', '%']
  },
  overrides: [
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less'
    }
  ]
};
