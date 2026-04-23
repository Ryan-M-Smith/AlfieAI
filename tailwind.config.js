import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
	content: [
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./lib/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)"],
				mono: ["var(--font-mono)"],
				cursive: ["var(--font-cursive)"],
				chalkboard: ["var(--font-chalkboard)"],
				big: ["var(--font-big)"],
				bubble: ["var(--font-bubble)"],
				racing: ["var(--font-racing)"],
			},
			keyframes: {
				"gradient-move": {
					"0%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
					"100%": { backgroundPosition: "0% 50%" },
				},
			},
			animation: {
				"gradient-move": "gradient-move 6s ease infinite",
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						// Remove the quotes around blockquotes
						blockquote: {
							marginTop: '0',
							marginBottom: '0',
							p: {
								'&::before': { content: 'none' },
								'&::after': { content: 'none' },
							},
						},
						// Flatten spacing across common prose elements
						'p, ul, ol, li, h1, h2, h3, h4, h5, h6, pre': {
							marginTop: '0',
							marginBottom: '0',
						},
						'p + p, p + ul, p + ol, ul + p, ol + p, li + li, h1 + *, h2 + *, h3 + *, h4 + *, h5 + *, h6 + *': {
							marginTop: '0',
						},
						'ul, ol': {
							paddingLeft: theme('spacing.5'),
						},
					},
				},
			}),
		},
	},
	darkMode: "class",
	plugins: [
		heroui(),
		require("@tailwindcss/typography")
	]
}

module.exports = config;