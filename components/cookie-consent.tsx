//
// Filename: cookie-consent.tsx
// Description: AlfieAI's cookie consent component
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client"

import { useEffect } from "react";
import { useTheme } from "next-themes";

import * as CookieConsent from "vanilla-cookieconsent"
import { ccConfig } from "@/lib/cookie-consent-config"

export default function CookieConsentDialog(): null {
	const { resolvedTheme } = useTheme();

	// Apply the theme based on the resolved theme of the website
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const html = document.documentElement;

		if (resolvedTheme === "dark") {
			html.classList.add("cc--elegant-black");
			html.classList.remove("cc--lightmode");
		}
		else {
			html.classList.remove("cc--elegant-black");
			html.classList.add("cc--lightmode");
		}
	}, [resolvedTheme]);

	// Display the cookie consent banner
	useEffect(() => {
		CookieConsent.run(ccConfig)
	}, []);

	return null;
}