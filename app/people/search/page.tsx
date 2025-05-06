//
// Filename: page.tsx
// Route: /people/search
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { BsAsterisk } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa";
import { JSX, useEffect, useState } from "react";
import smartquotes from "smartquotes-ts";
import { useSearchParams } from "next/navigation";

import SearchBox from "@/components/search-box";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function Search(): JSX.Element {
	const searchParams = useSearchParams();
	const query = searchParams.get("query") || "";

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [results, setResults] = useState<any[]>([]);

	useEffect(() => {
		if (!query) {
			return;
		}

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

			console.log(results);
		})();
	}, [query]);

	return (
		<div className="h-screen">
			<main className="flex flex-col gap-y-14 h-screen min-h-screen px-4 sm:px-0">
				<nav className="relative mt-10">
					<h1 className="text-4xl sm:text-5xl flex justify-center items-center text-center">
						<span className="flex flex-row justify-center items-center gap-1">
							<span>AlfieAI</span>
							<BsAsterisk size={20}/>
							<span className="font-serif">People</span>
						</span>
					</h1>
				</nav>

				<div className="flex flex-col justify-center items-center gap-y-8">
					<div className="text-2xl text-center">
						{
							isLoading? (
								<Spinner
									size="lg"
									label="Loading results..."
									aria-label="Loading results..."
									color="default"
								/>
							) : (
								<h1> {`${smartquotes(`Top results for "${query}"`)}`} </h1>
							)	
						}
					</div>

					<div className="flex flex-col gap-y-10 w-full">
						<SearchBox/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-4/5 px-4 pb-2">
						{
							!isLoading && results.length > 0 && results.map((profile, i) => (
								<div key={i} className="p-4 border rounded-lg shadow-md relative">
									<div className="absolute top-2 right-2">
										<Button
											variant="light"
											radius="full"
											startContent={
												<Link
													href={profile.url}
													target="_blank"
													rel="noopener noreferrer"
												>
													<FaLinkedin size={20}/>
												</Link>
											}
											isIconOnly
										/>
									</div>

									<h2 className="text-xl font-bold">{profile.name}</h2>
									<p className="text-gray-600">{profile.title}</p>
								</div>
							))
						}
					</div>
				</div>
			</main>
		</div>
	);
}