//
// Filename: page.tsx
// Route: /
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import EventsChatView from "@/components/events-chat-view";

export const metadata = {
	title: "Chat | AlfieAI",
	description: "Chat with AlfieAI - the AI expert on Juniata College"
};

export default function Chat() {
	return <EventsChatView/>;
}
