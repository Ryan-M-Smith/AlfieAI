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

	const divRef = useRef<HTMLDivElement>(null);

	// Track last manual scroll time
	const lastManualScrollRef = useRef<number>(0);
	const isManualScrollingRef = useRef<boolean>(false);
	const forceScrollRef = useRef<boolean>(false);
	
	// Scroll handling with adaptive threshold detection
	useEffect(() => {
		if (!divRef.current) {
			return;
		}

		const el = divRef.current;
		
		// Always scroll to bottom when messages change if autoScroll is true
		// or if we just added a new message (indicated by forceScrollRef)
		if (autoScroll || forceScrollRef.current) {
			// Reset the force scroll flag
			if (forceScrollRef.current) {
				forceScrollRef.current = false;
			}
			
			// Use smooth scrolling for better UX
			setTimeout(() => {
				if (el) {
					el.scrollTo({ 
						top: el.scrollHeight, 
						behavior: "smooth" 
					});
				}
			}, 50); // Small delay to ensure content has rendered
			
			return;
		}
		
		// For manual scrolling situations:
		// Calculate adaptive threshold based on container size
		const scrollableHeight = el.scrollHeight - el.clientHeight;
		const adaptiveThreshold = Math.min(
			Math.max(scrollableHeight * 0.15, 60), 	// 15% of scrollable area, minimum 60px
			300 									// Cap at 300px for larger chats
		);
		
		// Only auto-scroll if we're near the bottom and not actively scrolling
		const isNearBottom = el.scrollHeight - el.clientHeight - el.scrollTop < adaptiveThreshold;
		const timeSinceLastScroll = Date.now() - lastManualScrollRef.current;
		
		if (isNearBottom && timeSinceLastScroll > 100) {
			el.scrollTo({ 
				top: el.scrollHeight, 
				behavior: "smooth" 
			});
		}
	}, [messages, autoScroll]);

	// Add scroll listener to detect when user manually scrolls
	useEffect(() => {
		if (!divRef.current) {
			return;
		}

		const element = divRef.current;
		
		// Use an adaptive threshold based on container height
		const handleScroll = () => {
			// Only treat this as a manual scroll if we're not auto-scrolling
			// This prevents scroll events triggered by our auto-scroll from being detected as manual scrolls
			if (!forceScrollRef.current) {
				// Record manual scroll time and set active scrolling flag
				lastManualScrollRef.current = Date.now();
				isManualScrollingRef.current = true;
				
				// Calculate adaptive threshold based on container size
				const scrollableHeight = element.scrollHeight - element.clientHeight;
				const adaptiveThreshold = Math.min(
					Math.max(scrollableHeight * 0.15, 60), // 15% of scrollable area, minimum 60px 
					300 // Cap at 300px for larger chats
				);
				
				// Check if user is at the bottom
				const isAtBottom = element.scrollHeight - element.clientHeight - element.scrollTop < adaptiveThreshold;
				
				// Only update autoScroll state if it needs to change
				if (autoScroll !== isAtBottom) {
					setAutoScroll(isAtBottom);
				}
				
				// Reset scrolling flag after a short delay
				setTimeout(() => {
					isManualScrollingRef.current = false;
				}, 300);
			}
		};
		
		element.addEventListener("scroll", handleScroll);
		return () => element.removeEventListener("scroll", handleScroll);
	}, []);

	// Post a message and wait for a response
	useEffect(() => {
		if (!query || query.length < 1) {
			return;
		}

		// Create a message for the user's query
		const userQuery = {
			content: query,
			isLoading: false
		} satisfies MessageData;

		// Create a message for the model's response
		const modelResponse = {
			content: null,
			isLoading: true
		} satisfies MessageData;

		// Set force scroll flag to ensure we scroll down on new message
		forceScrollRef.current = true;
		setMessages(prev => [...prev, userQuery, modelResponse]);

		// Prompt the model for a response
		(async () => {
			setResponse("");

			const response = await fetch("/api/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					query: query
				})
			});

			const reader = response.body?.getReader();
			const decoder = new TextDecoder("utf-8");

			while (true) {
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
		})();
	}, [query]);

	// Update the message list with the model's response
	useEffect(() => {
		if (!response || response.length < 1) {
			return;
		}

		// Update the loading message incrementally with the response chunks
		const newMessages = [...messages];
		newMessages[newMessages.length - 1] = {
			content: (
				<div className="flex justify-center items-center w-full mt-1">
					<span className={`
						prose prose-headings:text-default-foreground prose-li:marker:text-default-foreground
						prose-strong:text-default-foreground prose-strong:font-bold text-default-foreground

						prose-p:my-0.5 prose-p:leading-snug
						prose-li:my-0.5 prose-ul:leading-none prose-li:leading-snug
						prose-ul:pl-5 prose-li:pl-0 prose-ul:list-disc prose-a:text-primary-500

						prose-headings:leading-none prose-code:font-mono
					`}>
						<Markdown
							remarkPlugins={[remarkGfm]}
							components={{
								a: ({ node, ...props }) => (
									<a
										{...props}
										href={props.href}
										rel="noopener noreferrer"
										onClick={(event) => {
											event.preventDefault();
											const canOpen = window.confirm(
												`Are you sure you want to open this link in a new tab?\n\n${props.href}`
											);
											if (canOpen) {
												window.open(props.href, "_blank", "noopener,noreferrer");
											}
										}}
									>
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
		} satisfies MessageData;

		setMessages(newMessages);
	}, [response]);

	const ToBottom = () => {
		return (
			<Button 
				className={`
					absolute bottom-20 right-8 bg-primary/90 dark:bg-default-100 bg-primary text-white p-2 rounded-full
					shadow-lg hover:bg-primary transition-colors z-20
				`}
				startContent={<IoIosArrowDown size={25}/>}
				onPress={() => {
					setAutoScroll(true);

					if (divRef.current) {
						divRef.current.scrollTo({ 
							top: divRef.current.scrollHeight, 
							behavior: "smooth" 
						});
					}
				}}
				isIconOnly
			/>
		)
	}

	return (
		<div className="w-full h-screen flex flex-col text-default-foreground overflow-hidden">
			<Navbar/>
			<main className="flex-1 flex flex-col relative overflow-hidden">
				{/* Chat area: scrollable between navbar and footer */}
				<div ref={divRef} className="absolute inset-0 px-4 sm:px-8 py-4 space-y-6 overflow-y-auto">
					{messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center text-zinc-400">
							<Hero />
						</div>
					) : (
						<ChatContainer className="space-y-4 pb-20">
							{ messages.map(({ content, isLoading }, i) => (
								<Message
									key={i}
									role={i % 2 === 0 ? "user" : "model"}
									isLoading={isLoading}
									isFirst={i % 2 === 0 && i === 0} // First message and is a user message
								>
									{content}
								</Message>
							))}
						</ChatContainer>
					)}
				</div>
				
				{/* Scroll to bottom button - only shows when user has scrolled up */}
				{ !autoScroll && messages.length > 0 && <ToBottom/> }
			</main>

			<InputBar onSubmit={setQuery}/>
		</div>
	);
}
