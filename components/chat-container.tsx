//
// Filename: chat-container.tsx
// Description: A container for chat bubbles
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX, ReactElement } from "react";

import Message from "@/components/message";

interface ChatContainerProps {
	className?: string;
	children: ReactElement<typeof Message>[];
}

export default function ChatContainer({ className, children }: ChatContainerProps): JSX.Element {
	return (
		<div
			className={`
				${className} bg-transparent flex flex-col justify-center items-center
				sm:items-start lg:w-3/4 sm:w-full mx-auto px-4 sm:px-6 md:px-8 snap-end
			`}
		>
			{children}
		</div>
	);
}