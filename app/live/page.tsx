//
// Filename: page.tsx
// Route: /live
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { FaMicrophone } from "react-icons/fa";

import Navbar from "@/components/navbar";

export const metadata = {
	title: "Live",
	description: "Experience a live audio chat with AlfieAI.",
};

export default function Live() {
	return (
		<div className="flex flex-col overflow-hidden min-h-screen relative">
			<Navbar/>

			<span className="absolute inset-0 z-10 top-[12rem] text-center text-7xl font-big">
				<span className="flex justify-center items-center gap-x-1 relative text-white">
					<span
						className={`
							absolute left-1/2 -translate-x-1/2 bottom-0 w-[30%] h-6
							bg-red-500 opacity-40 blur-md rounded-full z-[-1]
						`}
					/>
					AlfieAI
					<FaMicrophone className="justify-center" size={45}/>
					<span className="text-red-500"> Live </span>
				</span>
			</span>

			<iframe
				className="flex-1 w-full border-none"
				src="/index.html"
				title="AlfieAI Live Chat"
			/>
		</div>
	);
}