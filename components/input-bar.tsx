//
// Filename: input-bar.tsx
// Description: The input bar used to prompt the AI
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { IoIosSearch, IoIosSend } from "react-icons/io";
import { JSX, KeyboardEvent, useEffect, useState } from "react";
import Link from "next/link";

interface InputBarProps {
	className?: string;
	onSubmit: 	(value: string) => void;
}

export default function InputBar({ className, onSubmit }: InputBarProps): JSX.Element {
	const [query, setQuery] = useState<string>("");
	const [canSend, setCanSend] = useState<boolean>(false);
	const [collapseButton, setCollapseButton] = useState<boolean>(false);
	
	useEffect(() => {
		const updateCollapse = () => {
			setCollapseButton(window.innerWidth < 640);
		};

		updateCollapse(); // run once on mount
		window.addEventListener("resize", updateCollapse);

		return () => window.removeEventListener("resize", updateCollapse);
	}, []);

	const sendQuery = () => {
		onSubmit(query);
		setQuery("");
	}

	const SendButton = () => {
		return (
			<Button
				className="absolute right-0"
				color="default"
				variant="light"
				radius="full"
				size="lg"
				startContent={<IoIosSend size={30}/>}
				isDisabled={!canSend}
				onPress={sendQuery}
				isIconOnly
			/>
		);
	}

	return (
		<div className={`${className} fixed bottom-10 left-0 w-full px-4 sm:px-48`}>
			{/* Backdrop blocker */}
			<div className="absolute inset-x-0 h-[150px] dark:bg-default-50 bg-blue-200 z-0"/>
	
			{/* Input wrapper */}
			<div className="flex gap-2 justify-center w-full relative z-10 pt-7">
				<div className="w-full shadow-lg dark:shadow-blue-300 shadow-gray-700 rounded-full">
					<Input
						className="opacity-50"
						radius="full"
						color="default"
						variant="faded"
						size="lg"
						placeholder="Enter a prompt..."
						endContent={<SendButton/>}

						value={query}
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
				</div>

				<div className="shadow-lg dark:shadow-blue-300 shadow-gray-700 rounded-full">
					<Link href="/people">
						<Button
							className="opacity-75"
							color="default"
							variant="faded"
							size="lg"
							radius="full"
							endContent={<IoIosSearch size={25}/>}
							isIconOnly={collapseButton}
						>
							<span className="hidden sm:inline">People Search</span>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);	
}