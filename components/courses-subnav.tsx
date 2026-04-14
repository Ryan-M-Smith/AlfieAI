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
		<nav className="w-full mt-5 px-4 sm:px-6">
			<div className="mx-auto max-w-7xl">
				<div className="mx-auto w-fit max-w-full overflow-x-auto">
					<div className="inline-flex items-center gap-2 rounded-2xl border border-default-200 bg-content1/60 p-2 shadow-sm">
						{COURSE_FEATURES.map((item) => {
							const isActive = pathname === item.href || (item.href !== "/courses" && pathname.startsWith(`${item.href}/`));

							return (
								<Link
									key={item.href}
									href={item.href}
									className={[
										"rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
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
				</div>
			</div>
		</nav>
	);
}
