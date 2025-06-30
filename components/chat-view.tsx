//
// Filename: chat-view.tsx
// Description: The chatbot interface
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { IoIosArrowDown } from "react-icons/io";
import { JSX, ReactNode, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Message from "@/components/message";
import ChatContainer from "@/components/chat-container";
import InputBar from "@/components/input-bar";
import Hero from "@/components/hero";
import Navbar from "@/components//navbar";
import { Button } from "@heroui/button";

interface MessageData {
	content: ReactNode;
	isLoading: boolean;
}

export default function ChatView(): JSX.Element {
	const [query, setQuery] = useState<string>("");
	const [response, setResponse] = useState<string>("");
	const [messages, setMessages] = useState<MessageData[]>([]);
	const [autoScroll, setAutoScroll] = useState<boolean>(true);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);

	const divRef = useRef<HTMLDivElement>(null);
	const lastManualScrollRef = useRef<number>(Date.now());
	const isManualScrollingRef = useRef<boolean>(false);
	const forceScrollRef = useRef<boolean>(false);
	const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null);

	// Scroll to top of last user message when a new prompt is added
	useEffect(() => {
		if (!messages.length || !divRef.current) return;
		const el = divRef.current;
		const userMessages = el.querySelectorAll("[data-role='user']");
		const lastUserEl = userMessages[userMessages.length - 1];

		if (lastUserEl && messages[messages.length - 1].isLoading) {
			const containerRect = el.getBoundingClientRect();
			const messageRect = lastUserEl.getBoundingClientRect();
			console.log(messageRect.top, containerRect.top, el.scrollTop);
			const offset = messageRect.top - containerRect.top + el.scrollTop - 40; // 40px padding from top
			el.scrollTo({ top: offset, behavior: "smooth" });
		}
	}, [messages]);

	// Track user scroll position to show/hide scroll-to-bottom button
	useEffect(() => {
		const el = divRef.current;

		if (!el) {
			return;
		}

		const handleScroll = () => {
			const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
			setAutoScroll(nearBottom);
		};
		el.addEventListener("scroll", handleScroll);

		return () => el.removeEventListener("scroll", handleScroll);
	}, []);

	// Post a message and wait for a response
	useEffect(() => {
		if (!query || query.length < 1) {
			return;
		}

		const userQuery: MessageData = { content: query, isLoading: false };
		const modelResponse: MessageData = { content: null, isLoading: true };

		setMessages(prev => [...prev, userQuery, modelResponse]);
		setAutoScroll(true);
		setResponse("");

		(async () => {
			const response = await fetch("/api/query", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query })
			});

			const reader = response.body?.getReader();
			const decoder = new TextDecoder("utf-8");

			while (true) {
				setIsGenerating(true);

				if (!reader) {
					continue;
				}

				const { done, value } = await reader.read();

				if (done) {
					break;
				}

				const text = decoder.decode(value);
				setResponse(prev => prev + text);
			}

			setIsGenerating(false);
		})();
	}, [query]);

	// Update the last message with the model's streamed response
	useEffect(() => {
		if (!response || response.length < 1) return;
		const newMessages = [...messages];
		newMessages[newMessages.length - 1] = {
			content: (
				<div className="flex justify-center items-center w-full mt-1">
					<span className={`
						prose text-default-foreground prose-p:my-0.5 prose-p:leading-snug prose-li:my-0.5
						prose-ul:leading-snug prose-ol:leading-snug prose-li:leading-snug prose-ul:pl-5 prose-li:pl-0
						prose-ul:list-disc dark:prose-a:text-blue-400 prose-a:text-primary prose-headings:text-default-foreground
						prose-strong:text-default-foreground prose-strong:font-bold prose-headings:leading-none
						prose-code:font-mono prose-li:marker:text-default-foreground
					`}>
						<Markdown
							remarkPlugins={[remarkGfm]}
							components={{
								a: ({ ...props }) => (
									<a {...props} href={props.href} rel="noopener noreferrer" onClick={(e) => {
										e.preventDefault();
										if (window.confirm(`Open this link? ${props.href}`)) {
											window.open(props.href, "_blank", "noopener,noreferrer");
										}
									}}>
										{props.children}
									</a>
							)
						}}
					>
						{response}
					</Markdown>
				</span>
			</div>
		),
			isLoading: false
		};
		setMessages(newMessages);
	}, [response]);

	// Show scroll-to-bottom button as soon as content is scrollable and user is not at the bottom
	useEffect(() => {
		if (!divRef.current) {
			return;
		}

		const el = divRef.current;
		const isScrollable = el.scrollHeight > el.clientHeight + 2; // Add a 2px buffer to account for scrollbar width
		const isAtBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 10;
		
		setAutoScroll(!isScrollable || isAtBottom);
	}, [messages]);

	const scrollToBottom = () => {
		const el = divRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
	};

	const ToBottomButton = () => (
		<Button
			className="absolute bottom-10 left-0 right-0 w-fit mx-auto text-default-500 backdrop-blur-md shadow-lg z-20 pt-1"
			size={window.innerWidth < 640? "sm" : "md"}
			radius="full"
			variant="ghost"
			startContent={<IoIosArrowDown size={30} />}
			onPress={scrollToBottom}
			isIconOnly
		/>
	)

	// Determine if the model is generating (last message is loading)
	// const isGenerating = messages.length > 0 && messages[messages.length - 1]?.isLoading;

	// Determine if we should show extra bottom padding (only during generation)
	const showExtraPadding = (
		messages.length > 1 &&
		messages[messages.length - 2] &&
		!messages[messages.length - 2].isLoading &&
		messages[messages.length - 1] &&
		messages[messages.length - 1].isLoading
	)

	useEffect(() => {
		if (!divRef.current) return;
		const element = divRef.current;

		const handleScroll = () => {
			if (!forceScrollRef.current) {
				lastManualScrollRef.current = Date.now();
				isManualScrollingRef.current = true;

				if (scrollDebounceRef.current) {
					clearTimeout(scrollDebounceRef.current);
				}

				scrollDebounceRef.current = setTimeout(() => {
					const scrollDelta = Math.ceil(element.scrollHeight - element.clientHeight - element.scrollTop);
					const isExactlyAtBottom = Math.abs(scrollDelta) < 10;
					const scrollableHeight = element.scrollHeight - element.clientHeight;

					const adaptiveThreshold = Math.min(
						Math.max(scrollableHeight * 0.15, 60),
						300
					);

					// Only update autoScroll if the value changes
					if (isExactlyAtBottom && !autoScroll) {
						setAutoScroll(true);
					}
					else if (!isExactlyAtBottom && autoScroll) {
						setAutoScroll(false);
					}

					isManualScrollingRef.current = false;
				}, 80);
			}
		};

		element.addEventListener("scroll", handleScroll);
		return () => element.removeEventListener("scroll", handleScroll);
	}, [autoScroll]);

	// Helper to determine if content is scrollable
	const isScrollable = divRef.current && divRef.current.scrollHeight > divRef.current.clientHeight + 2;

	return (
		<div className="w-full h-screen flex flex-col text-default-foreground overflow-hidden">
			<Navbar />
			<main className="flex-1 flex flex-col overflow-hidden">
				<div
					ref={divRef}
					className={`flex-1 px-4 sm:px-8 pt-0 space-y-6 overflow-y-auto ${showExtraPadding || isGenerating? "pb-[70vh]" : "pb-0"}`}
				>
					{messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center text-zinc-400">
							<Hero/>
						</div>
					) : (
						<ChatContainer className="space-y-4 sm:pb-10 pb-28">
							{ messages.map(({ content, isLoading }, i) => {
								const isUser = i % 2 === 0;

								return (
									<div key={i} className="w-full">
										<Message
											role={isUser? "user" : "model"}
											isLoading={isLoading}
											isFirst={isUser && i === 0}
										>
											{content}
										</Message>
									</div>
								);
							})}
						</ChatContainer>
					)}
				</div>

				{/* Only show ToBottom button if content is scrollable and autoScroll is false */}
				{!autoScroll && isScrollable && messages.length > 0 && <ToBottomButton/>}
			</main>
			<InputBar onSubmit={setQuery} />
		</div>
	);
}
