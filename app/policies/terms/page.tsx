//
// Filename: page.tsx
// Route: /policies/tos
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";
import fs from "fs";
import path from "path";

import Navbar from "@/components/navbar";
import MarkdownRenderer from "@/components/markdown-renderer";

export const metadata = {
	title: "Policies | Terms of Service",
	description: "AlfieAI's Terms of Service | Last updated: June 25, 2025",
}

export default function TermsOfService(): JSX.Element {
	const filePath = path.join(process.cwd(), "policies", "terms-of-service.md");
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