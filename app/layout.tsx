//
// Filename: layout.tsx
// Description: The website's root layout
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import CookieConsentDialog from "@/components/cookie-consent";
import { fontSans, fontMono, fontCursive } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/providers";
import React from "react";

export function generateMetadata(): Metadata {
	return {
		title: {
			default: siteConfig.name,
			template: `%s | ${siteConfig.name}`,
		},
		description: siteConfig.description,
		icons: {
			icon: "/favicon.ico",
		},
	};
}

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default function RootLayout({ children }: { children: ReactNode }) {
	const fonts = `
		${fontSans.variable}
		${fontMono.variable}
		${fontCursive.variable}
	`;

	return (
		<html className={`h-screen dark:bg-zinc-950/80 light:bg-gray-100 overscroll-none`} lang="en" suppressHydrationWarning>
			<head>
				<meta name="google-site-verification" content="9vfCGFrG_b3GRRS8iTZ1tIYAe_Ek0OhxcQgsVKzeza8"/>

				{/* Load the styles for the cookie consent banner */}
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css"/>
				<link rel="stylesheet" href="/styles/cc-custom.css"/>
			</head>
			
			<body className={`h-screen font-sans antialiased ${fonts}`}>
				<Providers themeProps={{
					attribute: "class",
					defaultTheme: "system",
					enableSystem: true,
					disableTransitionOnChange: true
				}}>
					<CookieConsentDialog/>

					{children}

					<GoogleAnalytics gaId="G-QVJB47RWM9"/>
					<Analytics mode="production"/>
					<SpeedInsights/>
				</Providers>
			</body>
		</html>
	);
}
