//
// Filename: search-box.tsx
// Describtion: The search box for the people site
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { Button } from "@heroui/button";
import { FaArrowCircleUp } from "react-icons/fa";
import { gsap } from "gsap";
import { IoSearch } from "react-icons/io5";
import { Dispatch, JSX, KeyboardEvent, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Textarea } from "@heroui/input";

import placeholders from "@/lib/placeholders";
import { delay } from "framer-motion";

interface SearchBoxProps {
	setIsSearching?: Dispatch<SetStateAction<boolean>>;
}

export default function SearchBox({ setIsSearching }: SearchBoxProps): JSX.Element {
	const router = useRouter();

	const [query, setQuery] = useState<string>("");
	const [canSend, setCanSend] = useState<boolean>(false);
	const [placeholder, setPlaceholder] = useState<string>("");
	const [isCleared, setIsCleared] = useState(false);

	/**
	 * Reset GSAP animations when the document visibility changes to avoid rendering issues
	 */
	const onChangeVisibility = useCallback(() => {
		if (document.visibilityState == "visible") {
			gsap.killTweensOf("*");         // Kill all tweens to prevent lingering animations
			setPlaceholder("");				// Clear the placeholder text
			setIsCleared(true); 			// Set the cleared state to true
			gsap.globalTimeline.clear(); 	// Pause all GSAP animations
		}
	}, []);

	// Apply the visibility change event listener
	useEffect(() => {
		document.addEventListener("visibilitychange", onChangeVisibility);
		return () => document.removeEventListener("visibilitychange", onChangeVisibility);
	}, [onChangeVisibility]);


	// Animate the placeholder text for the search box
	useEffect(() => {
		let intervalId: NodeJS.Timeout;
		let blinkInterval: NodeJS.Timeout | undefined = undefined;
		let clearTimeoutId: NodeJS.Timeout | undefined = undefined;
		
		let typewriterTween: gsap.core.Tween | undefined = undefined;
		let blinkTween: gsap.core.Tween | undefined = undefined;

		const animatePlaceholder = () => {
			const index = Math.floor(Math.random() * placeholders.length);
			const placeholder = placeholders[index];
			const totalDuration = placeholder.length * 0.04;
			const cursor = "\u258d";

			//
			// Reset before animating
			//

			setPlaceholder("");

			typewriterTween?.kill();
			blinkTween?.kill();

			if (blinkInterval) {
				clearInterval(blinkInterval);
			}

			// Animate the text
			placeholder.split("").forEach((char, i) => {
				typewriterTween = gsap.delayedCall(i * 0.04, () => {
					// Add the next character and move the cursor
					setPlaceholder(prev => `${prev}${char}${cursor}`);

					// Clear the cursor after a short delay
					delay(() => setPlaceholder(prev => prev.replace(cursor, "")), 0.04);
				});
			});

			
			// Start blinking cursor after typing is done
			blinkTween = gsap.delayedCall(totalDuration, () => {
				let visible = false;
				blinkInterval = setInterval(() => {
					setPlaceholder(_ => visible? `${placeholder} ${cursor}` : placeholder);
					visible = !visible;
				}, 200);
			});
		};

		// Only animate on mount if not cleared
		if (!isCleared) {
			animatePlaceholder();
			intervalId = setInterval(() => {
				animatePlaceholder();
			}, 4000);
		}

		// Clear all intervals and timeouts on unmount
		return () => {
			clearInterval(intervalId);

			if (blinkInterval) {
				clearInterval(blinkInterval);
			}

			if (clearTimeoutId) {
				clearTimeout(clearTimeoutId);
			}

			gsap.globalTimeline.clear();
		};
	}, [isCleared]);

	// Delay placeholder animation after the search box is cleared for visual effect
	useEffect(() => {
		if (!isCleared) {
			return;
		}

		const timeout = setTimeout(() => {
			setIsCleared(false);
		}, 2000);

		return () => clearTimeout(timeout);
	}, [isCleared]);

	/**
	 * The search button for the search box
	 * 
	 * @returns The search button component 
	 */
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

	/**
	 * Send a search query to the server and navigate to the results page
	 */
	const sendQuery = () => {
		if (!canSend) {
			return;
		}

		if (setIsSearching) {
			setIsSearching(true);
		}

		const encodedQuery = encodeURIComponent(query);
		router.push(`/people/search?query=${encodedQuery}`);
	}

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	return (
		<Textarea
			ref={textareaRef}
			className="flex justify-center items-center w-full sm:w-2/3 lg:w-1/3 mx-auto px-4 sm:px-0 sm:cursor-pointer cursor-text"
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

			onClick={() => textareaRef.current?.focus()}

			onValueChange={(value: string) => {
				setQuery(value);
				setCanSend(value.length > 0);

				if (value.length === 0) {
					setPlaceholder("");
					setIsCleared(true);
				}
			}}

			onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
				if (event.key === "Enter") {
					event.preventDefault();
					sendQuery();
				}
			}}
		/>
	);
}