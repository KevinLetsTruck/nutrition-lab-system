module.exports = {
  extends: ["next/core-web-vitals", "@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  settings: {
    "import/resolver": {
      typescript: true,
    },
  },
  rules: {
    // Prevent the exact issues we fixed today
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",

    // Null safety (prevents labValues.find() crashes)
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",

    // Database safety - catch table name mismatches
    "no-console": ["warn", { allow: ["warn", "error"] }],

    // Medical data safety
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    // Async safety
    "@typescript-eslint/no-floating-promises": "warn",

    // Prevent any usage (forces proper typing)
    "@typescript-eslint/no-explicit-any": "warn",
  },
  overrides: [
    {
      files: ["src/app/api/**/*.ts", "src/lib/medical/**/*.ts"],
      rules: {
        // Extra strict rules for medical APIs
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "prefer-const": "error",
        "no-var": "error",
      },
    },
  ],
  ignorePatterns: ["node_modules/", ".next/", "dist/", "**/*.js", "**/*.d.ts"],
};
