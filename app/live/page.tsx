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
		<div className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#160507] via-[#2a080c] to-[#090203]">
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