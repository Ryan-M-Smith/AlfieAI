//
// Filename: page.tsx
// Route: /live
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { FaMicrophone } from "react-icons/fa";
import Link from "next/link";

import Navbar from "@/components/navbar";

export const metadata = {
	title: "Live",
	description: "Experience a live audio chat with AlfieAI.",
};

export default function Live() {
	return (
		<div className="flex flex-col overflow-hidden min-h-screen relative bg-black">
			<Navbar/>

			<div className="pointer-events-none absolute inset-0 z-10 top-[12rem] text-center px-2 sm:px-0">
				<span className="flex justify-center items-center gap-x-1 relative text-4xl sm:text-7xl text-white font-big">
					<span
						className={`
							absolute left-1/2 -translate-x-1/2 bottom-0 w-[60vw] sm:w-[30%] h-6 sm:h-8
							bg-red-500 opacity-40 blur-md rounded-full z-[-1]
						`}
					/>
					AlfieAI
					<FaMicrophone className="justify-center" size={28}/>
					<span className="text-red-500"> Live </span>
				</span>
			</div>

			<iframe
				className="flex-1 w-full border-none min-h-[60vh] sm:min-h-0"
				src="/index.html"
				title="AlfieAI Live Chat"
				allow="microphone"
			/>

			<div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 text-center px-2 sm:px-0">
				<span className="flex justify-center items-center gap-x-1 relative text-[10px] sm:text-xs italic text-default-500 text-serif">
					Live audio chat powered by
					<Link
						className="underline pointer-events-auto whitespace-nowrap"
						href="https://gemini.google/overview/gemini-live/"
						rel="noopener noreferrer"
						target="_blank"
						passHref
					>
						Gemini Live.
					</Link>
					Generative AI is experimental and may make mistakes.
				</span>
			</div>
		</div>
	);
}