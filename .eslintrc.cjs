module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2022, // Required to support top-level await in build script, and private class syntax (e.g. #foo() {})
    sourceType: 'module',
  },
  env: {
    es6: true,
  },

  extends: [
    'plugin:prettier/recommended',
  ],
  rules: {

  },
};
