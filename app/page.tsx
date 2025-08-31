//
// Filename: page.tsx
// Route: /
// Copyright (c) 2025 Ryan Smith
//

import ChatView from "@/components/chat-view";

export const metadata = {
	title: "Chat | AlfieAI",
	description: "Chat with AlfieAI - the AI expert on Juniata College"
};

export default function Chat() {
	return <ChatView/>;
}
