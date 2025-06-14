//
// Filename: chat-bubble.tsx
// Description: A chat bubble
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX, ReactNode } from "react";
import { Spinner } from "@heroui/spinner";

interface ChatBubbleProps {
	className?: string;
	children?: 	ReactNode;
	role?: 		"user" | "model";
	isLoading?: boolean;
	isFirst?: boolean;
}

export default function Message({ className, children, role, isLoading, isFirst = false }: ChatBubbleProps): JSX.Element {
	const User = ({ children }: { children: ReactNode }) => {
		return (
			<div className={`${className} flex flex-col w-full px-2 sm:px-4 mt-4 mb-1`}>
				{/* Horizontal divider bar - hidden for the first message */}
				{ !isFirst && (
					<div className="block w-full my-6">
						<hr className="border-1 h-px border-default-400"/>
					</div>
				)}
				
				{/* User message */}
				<div className="flex justify-end w-full">
					<div className={`flex flex-col items-end relative max-w-[85%] sm:max-w-[75%]`}>
						{/* Bubble */}
						<div className="rounded-[16px] rounded-tr-none dark:bg-default-100 bg-blue-100 px-3 sm:px-5 py-2 w-full break-words whitespace-normal overflow-hidden">
							{isLoading ? (
								<Spinner
									className="flex justify-center items-center"
									label="AlfieAI is thinking"
									color="primary"
									variant="wave"
								/>
							) : children}
						</div>
					</div>
				</div>
			</div>
		)
	}

	const Model = ({ children }: { children: ReactNode }) => {
		return (
			<div className="w-full px-2 sm:px-4 my-4">
				<div className="text-left text-base sm:text-lg text-zinc-100 whitespace-pre-line">
					{isLoading ? (
						<Spinner
						className="flex justify-start items-center"
						label="AlfieAI is thinking"
						color="primary"
						variant="gradient"
						/>
					) : children}
				</div>
			</div>
		);
	}

	return role === "user"? (
		<User> {children} </User>
	) : (
		<Model> {children} </Model>
	);
}