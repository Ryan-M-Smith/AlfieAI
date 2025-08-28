//
// Filename: page.tsx
// Route: /courses
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";

import Navbar from "@/components/navbar";

export const metadata = {
	title: "Courses",
	description: "Create the perfect schedule for your next semester in seconds - powered by AlfieAI.",
};

export default function Courses(): JSX.Element {
	return (
		<div className="h-screen flex flex-col">
			<Navbar/>
			<main className="flex-1 flex justify-center items-center px-4 sm:px-0">
				
			</main>
		</div>
	);
}