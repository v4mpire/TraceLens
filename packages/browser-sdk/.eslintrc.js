module.exports = {
  extends: ["@tracelens/eslint-config"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  env: {
    browser: true,
  },
};
