//
// Filename: page.tsx
// Route: /live
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import { FaMicrophone } from "react-icons/fa";

import LiveVoiceStudio from "@/components/live-voice-studio";
import Navbar from "@/components/navbar";

export const metadata = {
	title: "Live",
	description: "Experience a live audio chat with AlfieAI.",
};

export default function Live() {
	return (
		<div className="relative w-full min-h-dvh flex flex-col overflow-hidden text-default-foreground bg-background">
			<div
				className="pointer-events-none absolute inset-0 opacity-70"
				style={{
					background:
						"radial-gradient(900px circle at 18% 18%, rgba(220,38,38,0.28), transparent 46%), radial-gradient(760px circle at 82% 10%, rgba(249,115,22,0.2), transparent 42%)",
				}}
			/>
			<div
				className="pointer-events-none absolute inset-0 opacity-55"
				style={{
					background:
						"radial-gradient(700px circle at 24% 72%, rgba(127,29,29,0.24), transparent 52%), radial-gradient(640px circle at 80% 78%, rgba(153,27,27,0.2), transparent 54%)",
				}}
			/>

			<Navbar />
			<span className="pointer-events-none absolute inset-x-0 top-20 z-20 text-center">
				<span className="inline-flex items-center gap-2 rounded-full border border-red-300/35 bg-black/45 px-4 py-2 text-xs uppercase tracking-[0.22em] text-red-50 backdrop-blur">
					AlfieAI <FaMicrophone size={13} /> Live Voice
				</span>
			</span>
			<LiveVoiceStudio />
		</div>
	);
}