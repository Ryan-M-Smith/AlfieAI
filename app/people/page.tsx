//
// Filename: page.tsx
// Route: /people
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { BsAsterisk } from "react-icons/bs";
import { JSX } from "react";

import SearchBox from "@/components/search-box";

export default function People(): JSX.Element {
	return (
		<div className="h-screen">
			<main className="flex justify-center items-center h-screen px-4 sm:px-0">
				<div className="flex flex-col gap-y-10 w-full">
					<h1 className="text-4xl sm:text-7xl flex justify-center items-center text-center">
						<span className="flex flex-row justify-center items-center gap-2 sm:gap-5">
							<span>AlfieAI</span>
							<BsAsterisk className="sm:size-1 lg:size-10"/>
							<span className="font-serif">People</span>
						</span>
					</h1>

					<SearchBox/>
				</div>
			</main>
		</div>
	);
}