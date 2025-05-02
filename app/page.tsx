//
// Filename: page.tsx
// Route: /
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import AIWriter from "react-aiwriter";
import { JSX, ReactNode, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

import ChatBubble from "@/components/chat-bubble";
import ChatContainer from "@/components/chat-container";
import InputBar from "@/components/input-bar";
import Hero from "@/components/hero";

interface MessageData {
	content: 	ReactNode;
	isLoading: 	boolean;
}

export default function Chat(): JSX.Element {
	const [query, setQuery] = useState<string>("");
	const [response, setResponse] = useState<string>("");
	const [messages, setMessages] = useState<MessageData[]>([]);

	const divRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!divRef.current) {
			return;
		} 

		const el = divRef.current;
    	el.scrollTop = el.scrollHeight;
	}, [messages]);	

	// Post a message and wait for a response
	useEffect(() => {
		if (!query || query.length < 1) {
			return;
		}

		// Create a chat bubble for the user's query
		const userQuery = {
			content: query,
			isLoading: false
		} satisfies MessageData;

		// Create a chat bubble for the model's response
		const modelResponse = {
			content: null,
			isLoading: true
		} satisfies MessageData;

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

			while (true) {
				const { done, value } = await reader?.read() ?? {};

				if (done) {
					break;
				}

				const text = new TextDecoder("utf-8").decode(value);
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
				<span className={`
					prose prose-headings:text-default-foreground
					prose-strong:text-default-foreground prose-strong:font-bold text-default-foreground
				`}>
					<Markdown>
						{response}
					</Markdown>
				</span>
			),
			isLoading: false
		} satisfies MessageData;

		setMessages(newMessages);
	}, [response]);

	return (
		<div className="h-full w-full">
			<main className="md:mx-30 lg:mx-48 h-full flex flex-col">
				<div ref={divRef} className="flex-grow overflow-y-auto">
					{
						messages.length > 0? (
							<ChatContainer className="pb-28 pt-10 h-full">
								{
									messages.map(({content, isLoading}, i) => (
										<ChatBubble 
											key={i}
											align={i % 2 == 0 ? "right" : "left"} 
											isLoading={isLoading} 
										>
											{content}
										</ChatBubble>
									))
								}
							</ChatContainer>
						) : (
							<Hero/>
						)
					}
				</div>

				<InputBar onSubmit={setQuery}/>
			</main>
		</div>
	);
}
