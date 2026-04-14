//
// Filename: chat-container.tsx
// Description: A container for chat bubbles
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
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
				${className} bg-transparent flex flex-col justify-center w-full max-w-5xl
				mx-auto px-2 sm:px-4 lg:px-6 snap-end
			`}
		>
			{children}
		</div>
	);
}