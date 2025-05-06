//
// Filename: page.tsx
// Route: /people/search
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { Suspense } from "react";
import { BsAsterisk } from "react-icons/bs";
import SearchResults from "@/components/search-results";

export default function Search() {
	return (
		<div className="h-screen">
			<main className="flex flex-col gap-y-14 h-screen min-h-screen px-4 sm:px-0">
				<nav className="relative mt-10">
					<h1 className="text-4xl sm:text-5xl flex justify-center items-center text-center">
						<span className="flex flex-row justify-center items-center gap-1">
							<span>AlfieAI</span>
							<BsAsterisk size={20} />
							<span className="font-serif">People</span>
						</span>
					</h1>
				</nav>

				<Suspense fallback={<div className="text-center text-xl">Loading...</div>}>
					<SearchResults/>
				</Suspense>
			</main>
		</div>
	);
}
