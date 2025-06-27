//
// Filename: page.tsx
// Route: /policies/disclaimers
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";
import fs from "fs";
import path from "path";

import Navbar from "@/components/navbar";
import MarkdownRenderer from "@/components/markdown-renderer";

export const metadata = {
	title: "Policies | Disclaimers",
	description: "AlfieAI's Disclaimers | Last updated: June 25, 2025",
}

export default function Disclaimers(): JSX.Element {
	const filePath = path.join(process.cwd(), "policies", "disclaimers.md");
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