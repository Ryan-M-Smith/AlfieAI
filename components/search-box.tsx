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

	// Reset the query state on mount
	useEffect(() => {
		if (!canSend) {
			setQuery("");
		}
	}, [canSend]);

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
			className="relative right-0 sm:right-auto sm:top-0 pointer-events-auto"
			variant="light"
			radius="full"
			startContent={<FaArrowCircleUp className="-z-5" size={30}/>} 
			onPress={sendQuery}
			isIconOnly
			isDisabled={!canSend}
		/>
	);

	/**
	 * Send a search query to the server and navigate to the results page
	 */
	const sendQuery = () => {
		if (!canSend) {
			return;
		}

		if (query === "") {
			router.push("/people");
		}

		if (setIsSearching) {
			setIsSearching(true);
			setIsCleared(true);
		}

		const encodedQuery = encodeURIComponent(query);
		router.push(`/people/search?query=${encodedQuery}`);

		setCanSend(false);
	}

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	return (
		<div onClick={ () => textareaRef.current?.focus() } className="w-full px-2 sm:px-0">
			<Textarea
				className="flex flex-col sm:flex-row justify-center items-center w-full sm:w-2/3 lg:w-1/3 mx-auto px-0 sm:px-0 cursor-text"
				ref={textareaRef}
				variant="faded"
				placeholder={placeholder}
				startContent={ <IoSearch size={20}/> }
				value={query}
				endContent={ <SearchButton/> }
				autoFocus

				onValueChange={ (value: string) => {
					setQuery(value);
					setCanSend(value.length > 0);

					if (value.length === 0) {
						setPlaceholder("");
						setIsCleared(true);
					}
				}}

				onKeyDown={ (event: KeyboardEvent<HTMLInputElement>) => {
					if (event.key === "Enter") {
						event.preventDefault();
						sendQuery();
						setPlaceholder("");
						setIsCleared(true);
					}
				}}
			/>
		</div>
	);
}