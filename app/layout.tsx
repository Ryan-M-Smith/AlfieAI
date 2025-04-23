import "@/styles/globals.css";

import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/providers";

import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/system";

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
		<html className="bg-background" lang="en" suppressHydrationWarning>
			<head/>
			<body
				className={clsx(
					"min-h-screen bg-background font-sans antialiased overscroll-none",
					fontSans.variable,
				)}
			>
				<Providers themeProps={{
					attribute: "class",
					defaultTheme: "system",
					enableSystem: true,
					disableTransitionOnChange: true
				}}>
					{children}
				</Providers>
			</body>
		</html>
	);
}
