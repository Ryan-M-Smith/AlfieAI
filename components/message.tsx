//
// Filename: message.tsx
// Description: A chat bubble
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import { JSX, ReactNode, useEffect, useState } from "react";
import thinkingVerbs from "@/lib/thinking-verbs";

type MessageRole = "user" | "model";

interface BubbleProps {
	light: 	string;
	dark: 	string;
}

interface MessageProps {
	className?: 	string;
	color?: 		BubbleProps;
	children?: 		ReactNode;
	role?: 			MessageRole;
	isLoading?: 	boolean;
	isFirst?: 		boolean;
}

const phraseIntervalMs = 2200;
const phraseRevealDurationMs = 560;
const dotsStartDelayMs = phraseRevealDurationMs + 80;
const dotsStepMs = 240;

function nextRandomVerbIndex(previousIndex: number): number {
	if (thinkingVerbs.length <= 1) {
		return previousIndex;
	}

	let nextIndex = previousIndex;
	while (nextIndex === previousIndex) {
		nextIndex = Math.floor(Math.random() * thinkingVerbs.length);
	}

	return nextIndex;
}

function ThinkingStatus(): JSX.Element {
	const [verbIndex, setVerbIndex] = useState(() => Math.floor(Math.random() * thinkingVerbs.length));
	const [phraseKey, setPhraseKey] = useState(0);
	const [dotCount, setDotCount] = useState(0);
	const phrase = `AlfieAI is ${thinkingVerbs[verbIndex]}`;
	const dots = `${".".repeat(dotCount)}${" ".repeat(3 - dotCount)}`;

	useEffect(() => {
		const intervalId = setInterval(() => {
			setVerbIndex((previous) => nextRandomVerbIndex(previous));
			setPhraseKey((previous) => previous + 1);
			setDotCount(0);
		}, phraseIntervalMs);

		return () => {
			clearInterval(intervalId);
		};
	}, []);

	useEffect(() => {
		let dotsIntervalId: ReturnType<typeof setInterval> | undefined;
		const startTimeoutId = setTimeout(() => {
			dotsIntervalId = setInterval(() => {
				setDotCount((previous) => (previous >= 3 ? 0 : previous + 1));
			}, dotsStepMs);
		}, dotsStartDelayMs);

		return () => {
			clearTimeout(startTimeoutId);
			if (dotsIntervalId) {
				clearInterval(dotsIntervalId);
			}
		};
	}, [phraseKey]);

	return (
		<div className="alfie-thinking" role="status" aria-live="polite" aria-label={phrase}>
			<span key={phraseKey} className="alfie-thinking-phrase">{`${phrase}${dots}`}</span>
		</div>
	);
}

export default function Message({ className, color: bubble, children, role, isLoading, isFirst = false }: MessageProps): JSX.Element {
	const defaultBubble = {
		light: "bg-linear-to-br from-sky-100 to-blue-50 border border-sky-200/80",
		dark: "dark:bg-linear-to-br dark:from-sky-900/45 dark:to-blue-900/30 dark:border-sky-700/50"
	} satisfies BubbleProps;

	const { light, dark } = bubble  || defaultBubble;

	const User = ({ children }: { children: ReactNode }) => {
		return (
			<div className={`${className} flex flex-col w-full justify-end px-2 sm:px-4 mt-4 mb-1`} data-role="user">
				{/* Horizontal divider bar - hidden for the first message */}
				{ !isFirst && (
					<div className="block w-full my-6">
						<hr className="border h-px border-default-400"/>
					</div>
				)}
				
				{/* User message */}
				<div className="flex justify-end w-full">
					<div className={`flex flex-col gap-[0.3em] items-end relative max-w-[88%] sm:max-w-[74%] lg:max-w-[64%] xl:max-w-[58%]`}>
						{/* Bubble */}
						<div className={`
							rounded-3xl rounded-tr-md shadow-sm ${light} ${dark} px-3 sm:px-5 py-2.5
							w-full wrap-break-word whitespace-normal overflow-hidden`
						}>
							{children}
						</div>

						{/* Message actions can be added here in a follow-up pass. */}
					</div>
				</div>
			</div>
		)
	}

	const Model = ({ children }: { children: ReactNode }) => {
		return (
			<div className={`flex w-full justify-center px-2 sm:px-4 my-4`} data-role="model">
				<div className="w-full max-w-3xl xl:max-w-4xl mx-auto text-left text-base sm:text-lg text-foreground whitespace-normal wrap-break-word">
					{isLoading ? (
						<div className="flex justify-start items-start py-1">
							<ThinkingStatus/>
						</div>
					) : children}
				</div>
			</div>
		);
	}

	return role === "user"?
		<User> {children} </User> :
		<Model> {children} </Model>;
}