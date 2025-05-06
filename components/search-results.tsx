//
// Filename: search-results.tsx
// Description: Search results for the people search
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import smartquotes from "smartquotes-ts";
import { FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import SearchBox from "@/components/search-box";

export default function SearchResults() {
	const searchParams = useSearchParams();
	const query = searchParams.get("query") || "";

	const [isLoading, setIsLoading] = useState(true);
	const [results, setResults] = useState<any[]>([]);

	useEffect(() => {
		if (!query) return;

		(async () => {
			const decodedQuery = decodeURIComponent(query);
			const response = await fetch(`/api/people/?query=${decodedQuery}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query: decodedQuery }),
			});
			const { results } = await response.json();
			setResults(results);
			setIsLoading(false);
		})();
	}, [query]);

	return (
		<div className="flex flex-col justify-center items-center gap-y-8">
			<div className="text-2xl text-center">
				{
					isLoading? (
						<Spinner size="lg" label="Loading results..." aria-label="Loading results..." color="default" />
					) : (
						<h1> {`${smartquotes(`Top results for "${query}"`)}`} </h1>
					)
				}
			</div>

			<div className="flex flex-col gap-y-10 w-full">
				<SearchBox setIsSearching={setIsLoading}/>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-4/5 px-4 pb-2">
				{!isLoading &&
					results.map((profile, i) => (
						<div key={i} className="flex flex-col justify-start items-start p-4 border rounded-lg shadow-md">
							<div className="relative w-full">
								<h2 className="text-xl font-bold">
									<span className="flex gap-x-2 justify-start items-center">
										{profile.name}
										<Link href={profile.url} target="_blank" rel="noopener noreferrer">
											<FaLinkedin size={20} className="text-gray-600 hover:text-blue-700" />
										</Link>
									</span>
								</h2>
								<p className="text-gray-600">{profile.title}</p>
							</div>
						</div>
					))
				}
			</div>
		</div>
	);
}
