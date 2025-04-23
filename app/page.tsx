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
			const response = await fetch("/api/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					query: query
				})
			});

			const json = await response.json();
			setResponse(json.response);
		})();
	}, [query]);

	// Update the message list with the model's response
	useEffect(() => {
		if (!response || response.length < 1) {
			return;
		}

		// The most recent message should be the loading message for the model
		const newMessages = [...messages];
		newMessages[newMessages.length - 1] = {
			content: (
				<AIWriter>
					<span className="prose">
						<Markdown>
							{response}
						</Markdown>
					</span>
				</AIWriter>
			),
			isLoading: false
		} satisfies MessageData;

		setMessages(newMessages);
	}, [response]);

	// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
	// tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
	// quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
	// Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
	// fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
	// culpa qui officia deserunt mollit anim id est laborum.

	return (
		<div className="h-full w-full">
			<main className="md:mx-30 lg:mx-48 h-full flex flex-col">
				<div ref={divRef} className="flex-grow overflow-y-auto">
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
				</div>

				<InputBar onSubmit={setQuery}/>
			</main>
		</div>
	);
}
