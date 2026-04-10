"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const COURSE_FEATURES = [
	{ href: "/courses", label: "Overview" },
	{ href: "/courses/catalog", label: "Catalog" },
	{ href: "/courses/schedule", label: "Schedule Builder" },
	{ href: "/courses/professors", label: "AlfieAI Professors" },
];

export default function CoursesSubnav() {
	const pathname = usePathname();

	return (
		<nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 mt-5">
			<div className="flex flex-wrap items-center gap-2 rounded-xl border border-default-200 bg-content1/50 p-2">
				{COURSE_FEATURES.map((item) => {
					const isActive = pathname === item.href || (item.href !== "/courses" && pathname.startsWith(`${item.href}/`));

					return (
						<Link
							key={item.href}
							href={item.href}
							className={[
								"rounded-full px-4 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-purple-500 text-white"
									: "bg-default-100 text-default-700 hover:bg-default-200",
							].join(" ")}
						>
							{item.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
