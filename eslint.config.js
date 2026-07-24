import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import globals from "globals";

export default [
  // Ignores (replaces the old --ignore-path .gitignore). node_modules is
  // ignored by default in flat config; the rest mirror .gitignore.
  {
    ignores: ["dist/**", "dist-ssr/**", "coverage/**", "*.local"],
  },

  // eslint:recommended equivalent
  js.configs.recommended,

  // Vue 3 essential rules (flat-config equivalent of plugin:vue/vue3-essential).
  // Sets up vue-eslint-parser for .vue files automatically.
  ...pluginVue.configs["flat/essential"],

  // Browser globals + module syntax for our source files.
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },

  // Build/config files run in Node, so they need Node globals (process, etc.).
  {
    files: [
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
      "vite.config.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Disable rules that conflict with Prettier. Must come last so it wins.
  skipFormatting,
];
