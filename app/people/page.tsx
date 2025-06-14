//
// Filename: page.tsx
// Route: /people
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { BsAsterisk } from "react-icons/bs";
import { JSX } from "react";

import SearchBox from "@/components/search-box";
import Navbar from "@/components/navbar";
import Link from "next/link";

export const metadata = {
	title: "AlfieAI People",
	description: "AlfieAI's LinkedIn semantic people search for Juniata"
};

export default function People(): JSX.Element {
	return (
		<div className="h-screen flex flex-col">
			<Navbar />
			<main className="flex-1 flex justify-center items-center px-4 sm:px-0">
				<div className="flex flex-col gap-y-10 w-full">
					<div className="flex flex-col gap-y-4">
						<h1 className="text-5xl sm:text-7xl flex justify-center items-center text-center">
							<span className="flex flex-row justify-center items-center gap-2 sm:gap-3">
								<span>AlfieAI</span>
								<BsAsterisk className="sm:size-1 lg:size-10"/>
								<span className="font-serif">People</span>
							</span>
						</h1>

						<span className="flex flex-row justify-center gap-x-1 text-xs text-default-500 italic pointer-events-none">
							<p className="whitespace-nowrap">LinkedIn semantic search, powered by AlfieAI. Data from</p>
							<Link
								className="underline pointer-events-auto whitespace-nowrap"
								href="https://mixrank.com"
								rel="noopener noreferrer"
								target="_blank"
								passHref
							>
								MixRank.
							</Link>
						</span>
					</div>

					<SearchBox/>
				</div>
			</main>
		</div>
	);
}