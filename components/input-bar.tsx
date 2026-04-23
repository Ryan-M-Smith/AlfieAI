//
// Filename: input-bar.tsx
// Description: The input bar used to prompt the AI
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

"use client";

import { ChangeEvent, JSX, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { FaArrowUp, FaMicrophone, FaPaperclip } from "react-icons/fa";

interface InputBarProps {
	className?: string;
	placeholder?: string;
	isDisabled?: boolean;
	placement?: "bottom" | "inline";
	onSubmit: (value: string, files: File[]) => void;
}

export default function InputBar({
	className,
	placeholder,
	isDisabled = false,
	placement = "bottom",
	onSubmit,
}: InputBarProps): JSX.Element {
	const router = useRouter();
	const isInline = placement === "inline";

	const [query, setQuery] = useState<string>("");
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [canSend, setCanSend] = useState<boolean>(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const maxTextareaHeight = 180;

	const resizeTextarea = useCallback(() => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return;
		}

		textarea.style.height = "0px";
		const nextHeight = Math.min(textarea.scrollHeight, maxTextareaHeight);
		textarea.style.height = `${nextHeight}px`;
		textarea.style.overflowY = textarea.scrollHeight > maxTextareaHeight ? "auto" : "hidden";
	}, [maxTextareaHeight]);

	const sendQuery = () => {
		const trimmed = query.trim();
		const fallbackPrompt = "Please analyze the attached files and help me with my request.";
		const payload = trimmed || (selectedFiles.length > 0 ? fallbackPrompt : "");

		if (!payload || isDisabled) {
			return;
		}

		onSubmit(payload, selectedFiles);
		setQuery("");
		setSelectedFiles([]);
		setCanSend(false);
		if (textareaRef.current) {
			textareaRef.current.style.height = "";
			textareaRef.current.style.overflowY = "hidden";
		}

		if (window.innerWidth < 640 && document.activeElement) {
			(document.activeElement as HTMLElement).blur();
		}
	};

	const triggerFilePicker = () => {
		if (isDisabled) {
			return;
		}

		fileInputRef.current?.click();
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		if (files.length === 0) {
			return;
		}

		setSelectedFiles((previous) => {
			const combined = [...previous, ...files];
			return combined.slice(0, 4);
		});

		event.target.value = "";
	};

	const removeFile = (index: number) => {
		setSelectedFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index));
	};

	useEffect(() => {
		setCanSend(query.trim().length > 0 || selectedFiles.length > 0);
	}, [query, selectedFiles]);

	useEffect(() => {
		resizeTextarea();
	}, [query, resizeTextarea]);

	return (
		<div
			className={`
				${className || ""}
				${isInline? "w-full flex justify-center items-center" : "w-full left-0 px-4 sm:px-48 flex justify-center items-center z-50 fixed bottom-0 sm:sticky sm:bottom-5 pb-[env(safe-area-inset-bottom)]"}
				sm:pb-0
			`}
		>
			{!isInline && (
				<div
					className="absolute inset-x-0 bg-background/ backdrop-blur-lg bg-linear-to-b from-background/10 to-background/20 z-0"
					style={{ height: "calc(100% + 10px)" }}
				/>
			)}

			<div
				className={`flex flex-col justify-center gap-2 relative z-10 cursor-text ${isInline ? "w-full max-w-4xl" : "w-full lg:w-2/3 pt-7"}`}
				onClick={(event) => {
					if (event.target === event.currentTarget) {
						textareaRef.current?.focus();
					}
				}}
				role="button"
				tabIndex={0}
				aria-label="Focus text input"
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						textareaRef.current?.focus();
					}
				}}
			>
				{selectedFiles.length > 0 && (
					<div className="flex flex-wrap gap-2 px-1">
						{selectedFiles.map((file, index) => (
							<button
								key={`${file.name}-${index}`}
								type="button"
								onClick={() => removeFile(index)}
								className="text-xs rounded-full border border-default-200 bg-content1/70 px-3 py-1 text-default-600 hover:bg-content1"
								title="Remove file"
							>
								{file.name.length > 28 ? `${file.name.slice(0, 25)}...` : file.name} x
							</button>
						))}
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					className="hidden"
					onChange={handleFileChange}
					multiple
				/>

				<div className="w-full min-h-13 rounded-[2rem] border border-default-300/70 bg-content1/85 dark:bg-zinc-900/85 backdrop-blur-md shadow-lg px-4 py-2 flex gap-3 items-end">
					<div className="flex h-10 self-end items-center gap-2">
						<Button
							variant="light"
							radius="full"
							size="sm"
							onPress={triggerFilePicker}
							isDisabled={isDisabled}
							isIconOnly
							aria-label="Attach files"
							className="text-foreground/90 min-w-8 h-8 w-8"
							style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
						>
							<FaPaperclip size={14} />
						</Button>

						<Button
							variant="light"
							radius="full"
							size="sm"
							onPress={() => router.push("/live")}
							isDisabled={isDisabled}
							isIconOnly
							aria-label="Open live chat"
							className="text-foreground/90 min-w-8 h-8 w-8"
							style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
						>
							<FaMicrophone size={14} />
						</Button>
					</div>

					<textarea
						ref={textareaRef}
						rows={1}
						placeholder={placeholder || "Enter a prompt..."}
						value={query}
						disabled={isDisabled}
						className="flex-1 bg-transparent outline-none border-0 text-foreground placeholder:text-default-500 resize-none py-2 leading-6 self-end"
						onChange={(event) => {
							setQuery(event.target.value);
						}}
						onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
							if (event.key === "Enter" && !event.shiftKey) {
								event.preventDefault();
								sendQuery();
							}
						}}
					/>

					<div className="flex h-10 self-end items-center">
						<Button
							variant="solid"
							radius="full"
							size="sm"
							onPress={sendQuery}
							isIconOnly
							isDisabled={!canSend || isDisabled}
							className="min-w-8 h-8 w-8 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-70"
							aria-label="Send message"
							style={{ cursor: (!canSend || isDisabled) ? "not-allowed" : "pointer" }}
						>
							<FaArrowUp size={14} />
						</Button>
					</div>
				</div>

				<h3 className="text-center text-xs italic font-sans text-default-500">
					Generative AI is experimental and may make mistakes. Remember to check all information.
				</h3>
			</div>
		</div>
	);
}
