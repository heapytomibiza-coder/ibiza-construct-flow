import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "packages/@core/dist", "packages/@contracts/dist", "packages/@ref-impl/**/dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Enforce contract-first development: prevent direct API calls
      "no-restricted-globals": ["error", {
        name: "fetch",
        message: "Use generated contract clients from packages/@contracts instead of raw fetch()"
      }],
    },
  },
  // LOB Module Boundary Rules - prevent cross-LOB imports
  {
    files: ["packages/@ref-impl/client/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@ibiza/ref-impl-workers", "@ibiza/ref-impl-workers/*"], message: "Cannot import workers from client module" },
          { group: ["@ibiza/ref-impl-admin", "@ibiza/ref-impl-admin/*"], message: "Cannot import admin from client module" }
        ]
      }]
    }
  },
  {
    files: ["packages/@ref-impl/workers/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@ibiza/ref-impl-client", "@ibiza/ref-impl-client/*"], message: "Cannot import client from workers module" },
          { group: ["@ibiza/ref-impl-admin", "@ibiza/ref-impl-admin/*"], message: "Cannot import admin from workers module" }
        ]
      }]
    }
  },
  {
    files: ["packages/@ref-impl/admin/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@ibiza/ref-impl-client", "@ibiza/ref-impl-client/*"], message: "Cannot import client from admin module" },
          { group: ["@ibiza/ref-impl-workers", "@ibiza/ref-impl-workers/*"], message: "Cannot import workers from admin module" }
        ]
      }]
    }
  },
);
