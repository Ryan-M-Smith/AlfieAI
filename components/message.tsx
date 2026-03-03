//
// Filename: chat-bubble.tsx
// Description: A chat bubble
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import { JSX, ReactNode } from "react";
import { Spinner } from "@heroui/spinner";

type SpinnerColor = "primary" | "secondary" | "current" | "white" | "default" | "success" | "warning" | "danger" | undefined;
type SpinnerVariant = "spinner" | "default" | "wave" | "dots" | "gradient" | "simple" | undefined;

interface SpinnerProps {
	color: 	 SpinnerColor;
	variant: SpinnerVariant;
}

interface BubbleProps {
	light: 	string;
	dark: 	string;
}

interface MessageProps {
	className?: 	string;
	bubble?: 	BubbleProps;
	spinner?: 		SpinnerProps;
	children?: 		ReactNode;
	role?: 			"user" | "model";
	isLoading?: 	boolean;
	isFirst?: 		boolean;
}

export default function Message({ className, bubble, spinner, children, role, isLoading, isFirst = false }: MessageProps): JSX.Element {
	const defaultBubble = {
		light: "bg-blue-100",
		dark: "dark:bg-default-100"
	} satisfies BubbleProps;
	
	const defaultSpinner = {
		color: "primary",
		variant: "wave"
	} satisfies SpinnerProps;

	const { light, dark } 	 = bubble  || defaultBubble;
	const { color, variant } = spinner || defaultSpinner;

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
					<div className={`flex flex-col items-end relative max-w-[85%] sm:max-w-[75%]`}>
						{/* Bubble */}
						<div className={`
							rounded-2xl rounded-tr-none ${light} ${dark} px-3 sm:px-5 py-2
							w-full wrap-break-word whitespace-normal overflow-hidden`
						}>
							{isLoading ? (
								<Spinner
									className="flex justify-center items-center"
									label="AlfieAI is thinking"
									color={color}
									variant={variant}
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
			<div className={`flex w-full justify-center px-2 sm:px-4 my-4`} data-role="model">
				<div className="text-left text-base sm:text-lg text-zinc-100 whitespace-pre-line">
					{isLoading ? (
						<div className="flex gap-x-1 justify-start items-start">
							<p className="text-lg"> AlfieAI is thinking </p>
							<Spinner
								color={color}
								variant={variant}
							/>
						</div>
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