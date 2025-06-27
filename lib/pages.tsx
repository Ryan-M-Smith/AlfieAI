//
// Filename: pages.tsx
// Description: Model the website's pages for dynamic navigation via the navbar
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { BsAsterisk } from "react-icons/bs";
import { IoChatboxEllipses } from "react-icons/io5";
import { MdOutlineContactSupport } from "react-icons/md";
import { PiGavelFill } from "react-icons/pi";
import { ReactNode } from "react";

export interface Page {
	href: 			string;
	name: 			string;
	description: 	string;
	card: 			ReactNode;
}

export type PageLayout = Record<string, Record<string, Page>>;

export const pages: PageLayout = {
	features: {
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
	},

	info: {
		policies: {
			href: "/policies",
			name: "policies",
			description: "The stuff we have to write and you don't want to read",
			card: (
				<span className="flex flex-row justify-center items-center gap-1 text-2xl font-bold tracking-tight">
					AlfieAI
					<PiGavelFill size={15}/>
					<span className="text-orange-500 font-light font-mono">
						Legal
					</span>
				</span>
			)
		},

		contact: {
			href: "/contact",
			name: "contact",
			description: "Contact the AlfieAI team",
			card: (
				<span className="flex flex-row justify-center items-center gap-1 text-2xl font-bold tracking-tight">
					AlfieAI
					<MdOutlineContactSupport size={15}/>
					<span className="text-lime-500 font-bold font-cursive">
						Contact
					</span>
				</span>
			)
		}
	}
};

export function getPage(pathname: string): Page | undefined {
	const pageName = pathname.split("/")[1];
	const pageList = Object.values(pages).flatMap((record) => Object.values(record));
	return pageList.find((page) => page.name === pageName);
}
