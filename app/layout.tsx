import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"

import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	icons: {
		icon: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
	return (
		<html className="h-screen dark:bg-default-100 light:bg-gray-100 overscroll-none" lang="en" suppressHydrationWarning>
			<head>
				<meta name="google-site-verification" content="9vfCGFrG_b3GRRS8iTZ1tIYAe_Ek0OhxcQgsVKzeza8"/>
			</head>
			<body className={`h-screen font-sans antialiased ${fontSans.variable}`}>
				<Providers themeProps={{
					attribute: "class",
					defaultTheme: "system",
					enableSystem: true,
					disableTransitionOnChange: true
				}}>
					{children}
					<Analytics mode="production"/>
					<SpeedInsights/>
				</Providers>
			</body>
		</html>
	);
}
