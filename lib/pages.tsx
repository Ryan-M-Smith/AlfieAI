//
// Filename: pages.tsx
// Description: Model the website's pages for dynamic navigation via the navbar
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { BsAsterisk } from "react-icons/bs";
import { IoChatboxEllipses } from "react-icons/io5";
import { ReactNode } from "react";

export interface Page {
	href: 			string;
	name: 			string;
	description: 	string;
	card: 			ReactNode;
}

export const pages: Record<string, Page> = {
	chat: {
		href: "/",
		name: "chat",
		description: "Chat with AlfieAI",
		card: (
			<span className="flex flex-row justify-center items-center gap-1 text-2xl font-bold tracking-tight">
				AlfieAI
				<IoChatboxEllipses size={15}/>
				<span className="text-primary">
					Chat
				</span>
			</span>
		)
	},

	people: {
		href: "/people",
		name: "people",
		description: "Search Juniata's network of students and professionals",
		card: (
			<span className="flex flex-row justify-center items-center gap-1 text-2xl font-bold tracking-tight">
				AlfieAI
				<BsAsterisk size={15}/>
				<span className="text-yellow-500 dark:text-yellow-300 font-serif font-thin">
					People
				</span>
			</span>
		)
	}
};

export function getPage(pathname: string): Page | undefined {
	const pageName = pathname.split("/")[1];
	return pages[pageName];
}
