import { JSX } from "react";
import { Metadata } from "next";

import AboutView from "@/components/about-view";

export const metadata: Metadata = {
	title: "About",
	description:
		"Discover AlfieAI's story, platform features, sustainability direction, and founder vision.",
};

export default function AboutPage(): JSX.Element {
	return <AboutView />;
}
