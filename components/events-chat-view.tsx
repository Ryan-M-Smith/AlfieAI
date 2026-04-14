//
// Filename: event-chat-view.tsx
// Description: The chatbot interface for the Events page
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

"use client";

import { Button } from "@heroui/button";
import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

import ChatContainer from "@/components/chat-container";
import InputBar from "@/components/input-bar";
import MarkdownRenderer from "@/components/markdown-renderer";
import Message from "@/components/message";
import Navbar from "@/components/navbar";

interface ChatMessage {
	id: string;
	role: "user" | "model";
	content: string;
	isLoading: boolean;
}

function createMessageId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function EventsChatView(): JSX.Element {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [showJumpButton, setShowJumpButton] = useState<boolean>(false);
	const hasMessages = messages.length > 0;
	const [starterPrompts, setStarterPrompts] = useState<string[]>([
		"How do I submit a club event in Involve?",
		"Where can I find and manage Event PINs?",
		"What forms are required for event approvals?",
		"How should I track attendance in Presence?",
	]);

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const shouldAutoScrollRef = useRef<boolean>(true);
	const streamAbortRef = useRef<AbortController | null>(null);
	const activeAssistantIdRef = useRef<string | null>(null);
	const queuedTextRef = useRef<string>("");
	const assembledTextRef = useRef<string>("");
	const rafRef = useRef<number | null>(null);

	const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
		const element = scrollContainerRef.current;
		if (!element) {
			return;
		}

		element.scrollTo({ top: element.scrollHeight, behavior });
	}, []);

	const syncBottomState = useCallback(() => {
		const element = scrollContainerRef.current;
		if (!element) {
			return;
		}

		const remaining = element.scrollHeight - element.clientHeight - element.scrollTop;
		const isAtBottom = remaining < 48;

		shouldAutoScrollRef.current = isAtBottom;
		setShowJumpButton(!isAtBottom);
	}, []);

	const flushQueuedResponse = useCallback(() => {
		const activeAssistantId = activeAssistantIdRef.current;
		if (!activeAssistantId || !queuedTextRef.current) {
			return;
		}

		assembledTextRef.current += queuedTextRef.current;
		queuedTextRef.current = "";
		const snapshot = assembledTextRef.current;

		setMessages((previous) => previous.map((message) => {
			if (message.id !== activeAssistantId) {
				return message;
			}

			return {
				...message,
				content: snapshot,
				isLoading: false,
			};
		}));
	}, []);

	const scheduleResponseFlush = useCallback(() => {
		if (rafRef.current !== null) {
			return;
		}

		rafRef.current = window.requestAnimationFrame(() => {
			rafRef.current = null;
			flushQueuedResponse();
		});
	}, [flushQueuedResponse]);

	useEffect(() => {
		const element = scrollContainerRef.current;
		if (!element || !hasMessages) {
			return;
		}

		const handleScroll = () => {
			syncBottomState();
		};

		element.addEventListener("scroll", handleScroll, { passive: true });
		syncBottomState();

		return () => {
			element.removeEventListener("scroll", handleScroll);
		};
	}, [hasMessages, syncBottomState]);

	useEffect(() => {
		if (!messages.length || !shouldAutoScrollRef.current) {
			return;
		}

		scrollToBottom(isGenerating ? "auto" : "smooth");
	}, [messages, isGenerating, scrollToBottom]);

	useEffect(() => {
		let cancelled = false;

		async function loadStarterPrompts() {
			try {
				const response = await fetch("/api/events/prompts", { cache: "no-store" });
				if (!response.ok) {
					return;
				}

				const data = await response.json() as { prompts?: string[] };
				if (!cancelled && Array.isArray(data.prompts) && data.prompts.length >= 4) {
					setStarterPrompts(data.prompts.slice(0, 4));
				}
			}
			catch {
				// Keep static fallbacks when prompt generation fails.
			}
		}

		void loadStarterPrompts();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		return () => {
			if (streamAbortRef.current) {
				streamAbortRef.current.abort();
			}

			if (rafRef.current !== null) {
				window.cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	const submitQuery = async (query: string, files: File[] = []) => {
		if (!query.trim() || isGenerating) {
			return;
		}

		const userId = createMessageId();
		const assistantId = createMessageId();
		activeAssistantIdRef.current = assistantId;
		queuedTextRef.current = "";
		assembledTextRef.current = "";

		setMessages((previous) => [
			...previous,
			{ id: userId, role: "user", content: query, isLoading: false },
			{ id: assistantId, role: "model", content: "", isLoading: true },
		]);

		setIsGenerating(true);
		shouldAutoScrollRef.current = true;
		setShowJumpButton(false);
		scrollToBottom("smooth");

		const controller = new AbortController();
		streamAbortRef.current = controller;

		try {
			const formData = new FormData();
			formData.append("query", query);
			for (const file of files) {
				formData.append("files", file);
			}

			const response = await fetch("/api/events", {
				method: "POST",
				body: formData,
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`Events chat request failed with status ${response.status}.`);
			}

			if (!response.body) {
				throw new Error("No response stream was returned.");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}

				queuedTextRef.current += decoder.decode(value, { stream: true });
				scheduleResponseFlush();
			}

			queuedTextRef.current += decoder.decode();

			if (rafRef.current !== null) {
				window.cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}

			flushQueuedResponse();
			const finalContent = assembledTextRef.current.trim();

			setMessages((previous) => previous.map((message) => {
				if (message.id !== assistantId) {
					return message;
				}

				return {
					...message,
					content: finalContent || "I could not generate a response right now. Please try again.",
					isLoading: false,
				};
			}));
		}
		catch (error) {
			const fallback = error instanceof Error && error.name === "AbortError"
				? "This request was canceled."
				: "I ran into an issue while generating a response. Please try again.";

			setMessages((previous) => previous.map((message) => {
				if (message.id !== assistantId) {
					return message;
				}

				return {
					...message,
					content: fallback,
					isLoading: false,
				};
			}));
		}
		finally {
			setIsGenerating(false);
			streamAbortRef.current = null;
			activeAssistantIdRef.current = null;
			queuedTextRef.current = "";
			assembledTextRef.current = "";
			syncBottomState();
		}
	};

	return (
		<div className="relative w-full min-h-dvh flex flex-col overflow-hidden text-default-foreground bg-background">
			<div
				className="pointer-events-none absolute inset-0 opacity-60"
				style={{
					background: "radial-gradient(920px circle at 14% 16%, rgba(217,70,239,0.2), transparent 46%), radial-gradient(760px circle at 84% 10%, rgba(249,115,22,0.14), transparent 44%)",
				}}
			/>

			<Navbar/>
			<main className="relative flex-1 overflow-hidden">
				{!hasMessages ? (
					<section className="absolute inset-0 overflow-hidden px-4 sm:px-8 pt-6 pb-44 sm:pb-32">
						<div className="absolute inset-0 pointer-events-none opacity-75" style={{
							background: "radial-gradient(640px circle at 24% 12%, rgba(217,70,239,0.2), transparent 58%), radial-gradient(640px circle at 78% 15%, rgba(244,114,182,0.14), transparent 58%)",
						}} />

						<div className="relative mx-auto h-full w-full max-w-5xl flex flex-col items-center justify-center text-center">
							<p className="text-xs uppercase tracking-[0.22em] text-fuchsia-400 font-semibold">AlfieAI Events</p>
							<h2 className="mt-3 text-[clamp(1.1rem,4vw,2.6rem)] sm:whitespace-nowrap font-semibold leading-tight text-foreground px-2">
								Juniata Involve questions? I can walk you through every step.
							</h2>
							<p className="mt-3 max-w-2xl text-default-500 text-sm sm:text-base px-2">
								Ask about workflows, event registration, forms, attendance tracking, and approvals.
							</p>

							<div className="mt-8 w-full max-w-4xl px-2">
								<div className="mx-auto flex flex-wrap justify-center gap-2 sm:gap-3">
									{starterPrompts.map((prompt) => (
										<button
											key={prompt}
											type="button"
											onClick={() => {
												void submitQuery(prompt);
											}}
											className="rounded-full border border-default-200 bg-content1/70 backdrop-blur-md hover:bg-content1 px-3 sm:px-4 py-2 text-xs sm:text-sm text-default-700 transition-colors"
										>
											{prompt}
										</button>
									))}
								</div>
							</div>

							<div className="mt-6 w-full max-w-4xl px-2">
								<InputBar
									placement="inline"
									placeholder="Ask AlfieAI Events..."
									isDisabled={isGenerating}
									onSubmit={(value, files) => {
										void submitQuery(value, files);
									}}
								/>
							</div>
						</div>
					</section>
				) : (
					<div
						ref={scrollContainerRef}
						className="absolute inset-0 overflow-y-auto scroll-pb-36 sm:scroll-pb-32 px-4 sm:px-8 pt-2 pb-36 sm:pb-32"
					>
						<ChatContainer className="space-y-4 py-3 sm:py-5 sm:pb-10 pb-8">
							{messages.map((message, index) => {
								const isUser = message.role === "user";

								return (
									<div key={message.id} className="w-full">
										<Message
											role={isUser ? "user" : "model"}
											isLoading={message.isLoading}
											isFirst={isUser && index === 0}
											color={{
												light: "bg-linear-to-br from-fuchsia-100 to-rose-50 border border-fuchsia-200/80",
												dark: "dark:bg-linear-to-br dark:from-fuchsia-900/45 dark:to-rose-900/30 dark:border-fuchsia-700/50",
											}}
										>
											{isUser ? message.content : <MarkdownRenderer content={message.content} />}
										</Message>
									</div>
								);
							})}
						</ChatContainer>
					</div>
				)}

				{showJumpButton && hasMessages && (
					<Button
						className="absolute bottom-36 sm:bottom-10 left-1/2 -translate-x-1/2 text-default-600 backdrop-blur-lg shadow-lg z-20"
						radius="full"
						variant="ghost"
						onPress={() => {
							shouldAutoScrollRef.current = true;
							setShowJumpButton(false);
							scrollToBottom("smooth");
						}}
						startContent={<IoIosArrowDown size={24} />}
						isIconOnly
					/>
				)}
			</main>

			{hasMessages && (
				<InputBar
					placeholder="Ask AlfieAI Events..."
					isDisabled={isGenerating}
					onSubmit={(value, files) => {
						void submitQuery(value, files);
					}}
				/>
			)}
		</div>
	);
}