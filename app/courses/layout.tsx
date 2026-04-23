import { ReactNode } from "react";

import CoursesSubnav from "@/components/courses-subnav";
import Navbar from "@/components/navbar";

export default function CoursesLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<CoursesSubnav />
			<main className="flex-1 pt-6">
				{children}
			</main>
		</div>
	);
}
