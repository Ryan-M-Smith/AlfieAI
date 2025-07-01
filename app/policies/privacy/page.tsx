//
// Filename: page.tsx
// Route: /policies/privacy
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";
import fs from "fs";
import path from "path";

import Navbar from "@/components/navbar";
import MarkdownRenderer from "@/components/markdown-renderer";

export const metadata = {
	title: "Policies | Privacy Policy",
	description: "AlfieAI's Privacy Policy | Last updated: June 25, 2025",
}

export default function PrivacyPolicy(): JSX.Element {
	const filePath = path.join(process.cwd(), "policies", "privacy-policy.md");
	const markdown = fs.readFileSync(filePath, "utf8");
	
	return (
		<div>
			<Navbar/>

			<div className="flex justify-center w-full py-10">
				<div className="max-w-3xl w-full px-4">
					<MarkdownRenderer content={markdown} />
				</div>
			</div>
		</div>
	);
}