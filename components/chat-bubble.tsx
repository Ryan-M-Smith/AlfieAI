//
// Filename: chat-bubble.tsx
// Description: A chat bubble
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX, ReactNode } from "react"; 
import { TbTriangleInvertedFilled } from "react-icons/tb";

interface ChatBubbleProps {
	className?: string;
	children?: ReactNode;
	align?: "left" | "right";
}

export default function ChatBubble({ className, children, align }: ChatBubbleProps): JSX.Element {
	const justify = align === "left"? "justify-start" : "justify-end";
	const items = align === "left"? "items-start" : "items-end";
	const side = align === "left"? "-left-[1.5]" : "right-0";
	
	return (
		<div className={`${className} ${justify} flex w-full px-2 sm:px-4 my-1`}>
			<div className={`${items} flex flex-col relative max-w-[85%] sm:max-w-[75%]`}>
				{ /* Bubble */ }
				<div className="rounded-lg bg-default-100 px-3 sm:px-5 py-2 w-full break-words whitespace-normal overflow-hidden">
					{children}
				</div>

				{ /* Tail */}
				<TbTriangleInvertedFilled
					className={`relative top-[-13px] ${side} text-default-100 rotate-[3deg]`}
					size={30}
				/>
			</div>
		</div>
	);
}