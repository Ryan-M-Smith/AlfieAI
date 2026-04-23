//
// Filename: eslint.config.mjs
// Description: ESLint flat config for AlfieAI
// Copyright (c) 2026 Ryan Smith <rysmith2113@gmail.com>
//

import path from "path";
import { fileURLToPath } from "url";

import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: [
			".now/*",
			"*.css",
			".changeset",
			"dist",
			"esm/*",
			"public/*",
			"tests/*",
			"scripts/*",
			"*.config.js",
			".DS_Store",
			"node_modules",
			"coverage",
			".next",
			"build",
		],
	},
	...compat.extends(
		"plugin:react/recommended",
		"plugin:prettier/recommended",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
		"plugin:@next/next/recommended-legacy"
	),
	...compat.config({
		env: {
			browser: false,
			es2021: true,
			node: true,
		},
		plugins: ["react", "unused-imports", "import", "@typescript-eslint", "jsx-a11y", "prettier"],
		parser: "@typescript-eslint/parser",
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
			ecmaVersion: 12,
			sourceType: "module",
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			"no-console": "warn",
			"no-tabs": "off",
			"react/prop-types": "off",
			"react/no-unescaped-entities": "warn",
			"react/jsx-uses-react": "off",
			"react/react-in-jsx-scope": "off",
			"react/jsx-sort-props": "off",
			"react/self-closing-comp": "off",
			"react-hooks/exhaustive-deps": "off",
			"react-hooks/static-components": "warn",
			"react-hooks/set-state-in-effect": "warn",
			"jsx-a11y/click-events-have-key-events": "warn",
			"jsx-a11y/interactive-supports-focus": "warn",
			"jsx-a11y/no-static-element-interactions": "warn",
			"jsx-a11y/aria-role": "warn",
			"prettier/prettier": "off",
			"no-unused-vars": "off",
			"unused-imports/no-unused-vars": "off",
			"unused-imports/no-unused-imports": "warn",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					args: "after-used",
					ignoreRestSiblings: false,
					argsIgnorePattern: "^_.*?$",
				},
			],
			"import/order": "off",
			"padding-line-between-statements": "off",
		},
	}),
];