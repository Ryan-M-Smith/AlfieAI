//
// Filename: page.tsx
// Route: /courses/catalog
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { GrSchedules } from "react-icons/gr";
import { JSX, Suspense } from "react";

import CourseCatalogClient from "@/components/course-catalog-client";

export const metadata = {
	title: "Course Catalog",
	description: "Find and explore courses offered at Juniata College.",
};

export default function Catalog(): JSX.Element {
	return (
		<div>
			<div className="mb-6 px-4 sm:px-0">
				<h1 className="text-4xl sm:text-6xl flex justify-center items-center text-center">
					<span className="flex flex-row justify-center items-center gap-2 sm:gap-3">
						<span>AlfieAI</span>
						<GrSchedules size={36}/>
						<span className="font-chalkboard text-purple-400">Course Catalog</span>
					</span>
				</h1>
			</div>

			<Suspense
				fallback={(
					<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-10">
						<div className="mt-10 flex justify-center text-default-500">Loading catalog...</div>
					</div>
				)}
			>
				<CourseCatalogClient/>
			</Suspense>
		</div>
	);
}