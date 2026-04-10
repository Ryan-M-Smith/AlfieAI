"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Professor {
	firstName: string;
	lastName: string;
	fullName: string;
	slug: string;
	department: string;
	primaryTitle?: string;
	email?: string;
	phone?: string;
	headshotUrl?: string;
	totalCourses: number;
}

const ALL_DEPARTMENTS_KEY = "__all_departments__";

interface DepartmentOption {
	key: string;
	label: string;
}

interface ProfessorsResponse {
	results: Professor[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
	filters: {
		departments: string[];
	};
}

export default function ProfessorsView() {
	const [query, setQuery] = useState("");
	const [search, setSearch] = useState("");
	const [department, setDepartment] = useState("");
	const [page, setPage] = useState(1);
	const [totalResults, setTotalResults] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [departments, setDepartments] = useState<string[]>([]);
	const [results, setResults] = useState<Professor[]>([]);
	const [loading, setLoading] = useState(false);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const departmentOptions: DepartmentOption[] = [
		{ key: ALL_DEPARTMENTS_KEY, label: "All departments" },
		...departments.map((item) => ({ key: item, label: item })),
	];
	const hasMorePages = page < totalPages;

	useEffect(() => {
		const controller = new AbortController();

		async function load() {
			setLoading(true);

			try {
				const response = await fetch("/api/courses/professors", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					signal: controller.signal,
					body: JSON.stringify({ query: search, department, page, pageSize: 9 }),
				});

				const data = (await response.json()) as ProfessorsResponse;
				setResults((previous) => {
					const incoming = data.results || [];
					if (page === 1) {
						return incoming;
					}

					const merged = [...previous, ...incoming];
					const seen = new Set<string>();
					return merged.filter((professor) => {
						const key = professor.slug || `${professor.firstName}-${professor.lastName}`;
						if (seen.has(key)) {
							return false;
						}

						seen.add(key);
						return true;
					});
				});
				setTotalPages(data.pagination?.totalPages || 1);
				setTotalResults(data.pagination?.total || 0);
				setDepartments(data.filters?.departments || []);
			}
			finally {
				setLoading(false);
			}
		}

		void load();
		return () => controller.abort();
	}, [search, department, page]);

	useEffect(() => {
		const node = loadMoreRef.current;
		if (!node) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const isVisible = entries[0]?.isIntersecting;
				if (!isVisible || loading || !hasMorePages) {
					return;
				}

				setPage((previous) => previous + 1);
			},
			{ rootMargin: "400px 0px" }
		);

		observer.observe(node);

		return () => {
			observer.disconnect();
		};
	}, [loading, hasMorePages]);

	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-10">
			<div className="rounded-xl border border-default-200 bg-content1/60 p-4 sm:p-6 mb-4">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
					<div className="lg:col-span-8">
						<Input
							value={query}
							onValueChange={setQuery}
							placeholder="Search professors by name or department"
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									setPage(1);
									setSearch(query.trim());
								}
							}}
						/>
					</div>

					<div className="lg:col-span-4 grid grid-cols-2 gap-2">
						<Button color="secondary" onPress={() => {
							setPage(1);
							setSearch(query.trim());
						}}>
							Search
						</Button>

						<Button variant="flat" onPress={() => {
							setQuery("");
							setSearch("");
							setDepartment("");
							setPage(1);
						}}>
							Reset
						</Button>
					</div>
				</div>

				<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					<Select
						aria-label="Department"
						placeholder="Department"
						items={departmentOptions}
						selectedKeys={[department || ALL_DEPARTMENTS_KEY]}
						onSelectionChange={(keys) => {
							const selectedKey = keys === "all"
								? ALL_DEPARTMENTS_KEY
								: String(Array.from(keys)[0] || ALL_DEPARTMENTS_KEY);

							setDepartment(selectedKey === ALL_DEPARTMENTS_KEY ? "" : selectedKey);
							setPage(1);
						}}
					>
						{(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
					</Select>
				</div>
			</div>

			<div className="mt-5 flex items-center justify-between text-sm text-default-600">
				<p>{totalResults} result{totalResults === 1 ? "" : "s"}</p>
				<p>{department ? `Department: ${department}` : "All departments"}</p>
			</div>

			{loading && results.length === 0 && (
				<div className="mt-10 flex justify-center">
					<Spinner label="Loading professors..." color="secondary" />
				</div>
			)}

			{results.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
					{results.map((professor, index) => (
						<div key={`${professor.fullName}-${index}`} className="rounded-xl border border-default-200 bg-content1/60 p-4 h-full flex flex-col">
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-start gap-3 min-w-0">
									{professor.headshotUrl
										? <img src={professor.headshotUrl} alt={`Headshot of ${professor.fullName}`} className="w-12 h-12 rounded-full object-cover border border-default-200" />
										: <div className="w-12 h-12 rounded-full bg-default-100 border border-default-200 text-default-600 grid place-items-center text-xs font-semibold">{professor.firstName.charAt(0)}{professor.lastName.charAt(0)}</div>
									}
									<div className="min-w-0">
										<h2 className="font-semibold text-lg leading-tight truncate">{professor.fullName}</h2>
										<p className="text-xs text-default-500">{professor.department}</p>
										{professor.primaryTitle && <p className="text-xs text-default-400 mt-1 line-clamp-2">{professor.primaryTitle}</p>}
									</div>
								</div>
								<Link href={`/courses/professors/${professor.slug}`} className="text-xs px-3 py-1.5 rounded-md bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-colors whitespace-nowrap">Learn more</Link>
							</div>

							<p className="text-sm text-default-600 mt-2">
								{professor.totalCourses} courses offered in current catalog
							</p>
							{(professor.email || professor.phone) && (
								<p className="text-xs text-default-500 mt-1 truncate">
									{professor.email || professor.phone}
								</p>
							)}
						</div>
					))}
				</div>
			)}

			<div ref={loadMoreRef} className="h-4" aria-hidden="true" />

			{loading && results.length > 0 && (
				<div className="mt-6 flex justify-center">
					<Spinner label="Loading more professors..." color="secondary" />
				</div>
			)}

			{!loading && !hasMorePages && results.length > 0 && (
				<p className="mt-6 text-center text-sm text-default-500">You&apos;ve reached the end of professor results.</p>
			)}
		</div>
	);
}
