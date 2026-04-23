//
// Filename: message.tsx
// Description: A chat bubble
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import { JSX, ReactNode } from "react";

import ThinkingStatus from "@/components/thinking-status";

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
	showDivider?: 	boolean;
}

export default function Message({ className, color, children, role, isLoading, isFirst = false, showDivider = true }: MessageProps): JSX.Element {
	const defaultBubble = {
		light: "bg-linear-to-br from-sky-100 to-blue-50 border border-sky-200/80",
		dark: "dark:bg-linear-to-br dark:from-sky-900/45 dark:to-blue-900/30 dark:border-sky-700/50"
	} satisfies BubbleProps;

	const { light, dark } = color || defaultBubble;

	const User = ({ children }: { children: ReactNode }) => {
		return (
			<div className={`${className} flex w-full flex-col justify-end px-2 sm:px-4 mt-4 mb-1`} data-role="user">
				{showDivider && !isFirst ? (
					<div className="block w-full my-6">
						<hr className="border h-px border-default-400" />
					</div>
				) : null}

				<div className="flex justify-end w-full">
					<div className="relative flex max-w-[88%] flex-col items-end gap-[0.3em] sm:max-w-[74%] lg:max-w-[64%] xl:max-w-[58%]">
						<div className={`rounded-3xl rounded-tr-md shadow-sm ${light} ${dark} px-3 py-2.5 w-full wrap-break-word whitespace-normal overflow-hidden sm:px-5`}>
							{children}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const Model = ({ children }: { children: ReactNode }) => {
		return (
			<div className="flex w-full justify-center px-2 sm:px-4 my-4" data-role="model">
				<div className="mx-auto w-full max-w-3xl text-left text-base text-foreground whitespace-normal wrap-break-word sm:text-lg xl:max-w-4xl">
					{isLoading ? (
						<div className="flex items-start justify-start py-1">
							<ThinkingStatus />
						</div>
					) : children}
				</div>
			</div>
		);
	};

	return role === "user" ? <User>{children}</User> : <Model>{children}</Model>;
}