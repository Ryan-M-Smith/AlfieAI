//
// Filename: page.tsx
// Route: /policies/cookies
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";
import fs from "fs";
import path from "path";

import Navbar from "@/components/navbar";
import MarkdownRenderer from "@/components/markdown-renderer";

export const metadata = {
	title: "Policies | Cookie Policy",
	description: "AlfieAI's Cookie Policy | Last updated: June 25, 2025",
}

export default function CookiePolicy(): JSX.Element {
	const filePath = path.join(process.cwd(), "policies", "cookie-policy.md");
	const markdown = fs.readFileSync(filePath, "utf8");
	
	return (
		<div>
			<Navbar/>

			<div className="flex justify-center items-center w-full py-10">
				<MarkdownRenderer content={markdown} />
			</div>
		</div>
	);
}