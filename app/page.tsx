//
// Filename: page.tsx
// Route: /
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import ChatView from "@/components/chat-view";

export const metadata = {
	title: "Chat | AlfieAI",
	description: "AlfieAI - the AI expert on Juniata College"
};

export default function Chat() {
	return <ChatView/>;
}
