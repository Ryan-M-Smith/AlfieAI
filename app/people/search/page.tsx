//
// Filename: page.tsx
// Route: /people/search
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { Suspense } from "react";
import { BsAsterisk } from "react-icons/bs";
import SearchResults from "@/components/search-results";
import { type Metadata } from "next";
import Navbar from "@/components/navbar";
import Link from "next/link";

interface SearchParams {
	searchParams: Promise<{ query?: string }>;
};

export async function generateMetadata({ searchParams }: SearchParams): Promise<Metadata> {
	const query = (await searchParams).query || "";

	return {
		title: query? "Search | AlfieAI People" : "AlfieAI People",
   		description: query? `Results for "${query}" | AlfieAI People` : "Results | AlfieAI People",
  	};
}

export default function Search() {
	return (
		<div className="h-screen">
			<Navbar/>
			<main className="flex flex-col gap-y-10 h-screen min-h-screen px-4 sm:px-0">
				<nav className="relative mt-10">
					<div className="flex flex-col gap-y-4">
						<h1 className="text-5xl sm:text-7xl flex justify-center items-center text-center">
							<span className="flex flex-row justify-center items-center gap-2">
								<span>AlfieAI</span>
								<BsAsterisk size={40}/>
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
				</nav>

				<Suspense fallback={<div className="text-center text-xl">Loading...</div>}>
					<SearchResults/>
				</Suspense>
			</main>
		</div>
	);
}
