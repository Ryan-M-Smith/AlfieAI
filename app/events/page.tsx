//
// Filename: page.tsx
// Route: /events
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import EventsChatView from "@/components/events-chat-view";

export const metadata = {
	title: "Events | AlfieAI",
	description: "Get targeted help with Juniata's Involve platform"
};

export default function Chat() {
	return <EventsChatView/>;
}
