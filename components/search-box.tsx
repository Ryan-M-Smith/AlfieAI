//
// Filename: page.tsx
// Describtion: The search box for the people site
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { Button } from "@heroui/button";
import { FaArrowCircleUp } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { Dispatch, JSX, KeyboardEvent, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Textarea } from "@heroui/input";

interface SearchBoxProps {
	setIsSearching: Dispatch<SetStateAction<boolean>>;
}

export default function SearchBox({ setIsSearching }: SearchBoxProps): JSX.Element {
	const router = useRouter();

	const [query, setQuery] = useState<string>("");
	const [canSend, setCanSend] = useState<boolean>(false);
	const [placeholder, setPlaceholder] = useState<string>("");
	
	const placeholders = [
		"Graduates with a masters degree in Computer Science",
		"Math teachers near State College",
		"Biology students graudating in 2027",
		"Engineers who work in big tech",
		"Scientists using machine learning in their research",
	];

	useEffect(() => {
		const index = Math.floor(Math.random() * placeholders.length);
		setPlaceholder(placeholders[index]);
	}, []);

	const SearchButton = () => (
		<Button
			className="relative right-0 sm:right-auto sm:top-0"
			variant="light"
			radius="full"
			startContent={<FaArrowCircleUp size={30}/>}
			onPress={sendQuery}
			isIconOnly
		/>
	);

	const sendQuery = () => {
		if (!canSend) {
			return;
		}

		setIsSearching(true);
		
		const encodedQuery = encodeURIComponent(query);
		router.push(`/people/search?query=${encodedQuery}`);
	}
	
	return (
		<Textarea
			className="flex justify-center items-center w-full sm:w-2/3 lg:w-1/3 mx-auto px-4 sm:px-0"
			placeholder={placeholder}
			startContent={<IoSearch size={20}/>}
			endContent={
				<>
					<div className="hidden sm:flex md:absolute md:bottom-1 sm:right-0 flex-col sm:flex-row justify-between w-full px-2">
						<span className="flex gap-x-1 text-xs text-default-500 italic md:mt-4">
							<p>LinkedIn semantic search, powered by AlfieAI. Data from</p>

							<Link
								className="underline"
								href="https://mixrank.com"
								rel="noopener noreferrer"
								target="_blank"
								passHref
							>
								MixRank.
							</Link>
						</span>

						<SearchButton/>
					</div>

					<div className="sm:hidden">
						<SearchButton/>
					</div>
				</>
			}

			onValueChange={(value: string) => {
				setQuery(value);
				setCanSend(value.length > 0);
			}}

			onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
				if (event.key === "Enter") {
					event.preventDefault();
					sendQuery();
				}
			}}
		/>
	)
}