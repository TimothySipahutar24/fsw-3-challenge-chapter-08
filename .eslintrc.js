module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: "eslint:recommended",
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "import/no-dynamic-require": "off",
    "global-require": "off",
    "no-unused-vars": "off",
    "linebreak-style": 0,
    "no-useless-escape": "off",
    "no-return-await": "off",
    "no-self-assign": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "arrow-body-style": "off",
    "no-restricted-globals": "off",
    "no-extra-boolean-cast": "off",
  },
};
