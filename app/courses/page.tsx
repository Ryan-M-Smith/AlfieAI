//
// Filename: page.tsx
// Route: /courses
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";
import Link from "next/link";
import { GrSchedules } from "react-icons/gr";
import { LuBookOpen, LuCalendarClock, LuGraduationCap } from "react-icons/lu";

export const metadata = {
	title: "Courses",
	description: "Create the perfect schedule for your next semester in seconds - powered by AlfieAI.",
};

export default function Courses(): JSX.Element {
	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-10">
			<header className="mb-8">
				<h1 className="text-4xl sm:text-6xl flex items-center justify-center gap-3 text-center">
					<span>AlfieAI</span>
					<GrSchedules size={34} />
					<span className="font-chalkboard text-purple-400">Courses</span>
				</h1>
				<p className="mt-3 text-center text-default-500 max-w-2xl mx-auto">
					Plan your semester with three focused tools: browse the catalog, build a schedule, and evaluate professors with AI-enhanced insights.
				</p>
			</header>

			<section className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Link href="/courses/catalog" className="rounded-xl border border-default-200 bg-content1/60 p-5 hover:bg-content1 transition-colors">
					<div className="flex items-center gap-2 text-purple-400 mb-2">
						<LuBookOpen size={20} />
						<h2 className="font-semibold text-lg">Course Catalog</h2>
					</div>
					<p className="text-sm text-default-600">Search, filter, and compare courses by term, seats, credits, and level.</p>
				</Link>

				<Link href="/courses/schedule" className="rounded-xl border border-default-200 bg-content1/60 p-5 hover:bg-content1 transition-colors">
					<div className="flex items-center gap-2 text-purple-400 mb-2">
						<LuCalendarClock size={20} />
						<h2 className="font-semibold text-lg">Schedule Builder</h2>
					</div>
					<p className="text-sm text-default-600">Assemble a semester plan, track total credits, and avoid conflicts quickly.</p>
				</Link>

				<Link href="/courses/professors" className="rounded-xl border border-default-200 bg-content1/60 p-5 hover:bg-content1 transition-colors">
					<div className="flex items-center gap-2 text-purple-400 mb-2">
						<LuGraduationCap size={20} />
						<h2 className="font-semibold text-lg">AlfieAI Professors</h2>
					</div>
					<p className="text-sm text-default-600">Get AI summaries of teaching context based on current catalog data.</p>
				</Link>
			</section>
		</div>
	);
}