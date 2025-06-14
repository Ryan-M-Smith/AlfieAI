//
// Filename: input-bar.tsx
// Description: The input bar used to prompt the AI
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { Button } from "@heroui/button";
import { FaArrowCircleUp } from "react-icons/fa";
import { JSX, KeyboardEvent, useEffect, useState, useRef } from "react";
import { Textarea } from "@heroui/input";

interface InputBarProps {
	className?: string;
	onSubmit: 	(value: string) => void;
}

export default function InputBar({ className, onSubmit }: InputBarProps): JSX.Element {
	const [query, setQuery] = useState<string>("");
	const [canSend, setCanSend] = useState<boolean>(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const sendQuery = () => {
		onSubmit(query);
		setQuery("");
		setCanSend(false); // Disable the send button after clearing input
	}

	const SendButton = () => (
		<Button
			className="relative right-0 sm:right-auto sm:top-0 pointer-events-auto"
			variant="light"
			radius="full"
			startContent={<FaArrowCircleUp className="-z-5" size={30}/>} 
			onPress={sendQuery}
			isIconOnly
			isDisabled={!canSend}
		/>
	)

	// Keep canSend state in sync with query
	useEffect(() => {
		setCanSend(query.length > 0);
	}, [query]);

	return (
		<div className={`${className} sticky flex justify-center items-center bottom-5 left-0 px-4 sm:px-48`}>
			{/* Backdrop blocker */}
			<div
				className={`
					absolute inset-x-0 bg-background/ backdrop-blur-lg bg-gradient-to-b
					from-background/10 to-background/20 z-0
				`}
				
				// Size the backdrop to cover the input bar
				style={{ height: "calc(100% + 24px)" }}
			/>

			{/* Input wrapper */}
			<div 
				className="flex justify-center gap-2 w-full lg:w-2/3 relative z-10 pt-7 cursor-text" 
				onClick={ (event) => {
					console.log(event.target, event.currentTarget);
					if (event.target === event.currentTarget) {
						textareaRef.current?.focus();
					}
				}}
				role="button"
				tabIndex={0}
				aria-label="Focus text input"
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						textareaRef.current?.focus();
					}
				}}
			>
				<Textarea
					ref={textareaRef}
					radius="full"
					variant="faded"
					size="lg"
					placeholder="Enter a prompt..."
					value={query}
					endContent={ <SendButton/> }

					onValueChange={ (value: string) => {
						console.log("Input value changed:", value);
						setQuery(value);
						setCanSend(value.length > 0);
					}}

					onKeyDown={ (event: KeyboardEvent<HTMLInputElement>) => {
						if (event.key === "Enter") {
							event.preventDefault();
							sendQuery();
						}
					}}
				/>
			</div>
		</div>
	);	
}