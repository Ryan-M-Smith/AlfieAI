//
// Filename: page.tsx
// Route: /courses/catalog/search
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";

import Navbar from "@/components/navbar";

export const metadata = {
	title: "Course Search",
	description: "Search results for courses at Juniata College.",
};

export default function CourseSearch(): JSX.Element {
	return (
		<div className="h-screen flex flex-col">
			<Navbar/>
			<main className="flex-1 flex justify-center items-center px-4 sm:px-0">

			</main>
		</div>
	);
}
