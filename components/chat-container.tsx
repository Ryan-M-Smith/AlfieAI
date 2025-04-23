//
// Filename: chat-container.tsx
// Description: A container for chat bubbles
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX, ReactElement } from "react";

import ChatBubble from "./chat-bubble";

interface ChatContainerProps {
	className?: string;
	children: ReactElement<typeof ChatBubble>[];
}

export default function ChatContainer({ className, children }: ChatContainerProps): JSX.Element {
	return (
		<div className={`
			${className} flex flex-col scroll-smooth snap-end items-center
			sm:items-start px-4 sm:px-6 md:px-8
		`}>
			{children}
		</div>
	);
}