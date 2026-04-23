"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoIosSearch } from "react-icons/io";

import CourseView from "@/components/course-view";
import { Course } from "@/lib/models/course";

interface CatalogFilters {
	department: string;
	term: string;
	year: string;
	academicLevel: string;
	openOnly: boolean;
	minCredits: string;
	maxCredits: string;
}

interface CatalogResponse {
	results: Course[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
	facets: {
		departments: string[];
		terms: string[];
		academicLevels: string[];
	};
}

const defaultFilters: CatalogFilters = {
	department: "",
	term: "",
	year: "",
	academicLevel: "",
	openOnly: false,
	minCredits: "",
	maxCredits: "",
};

function parseYear(term: string): number {
	const match = term.match(/(19|20)\d{2}/);
	return match ? Number(match[0]) : 0;
}

function parseSemesterRank(term: string): number {
	const normalized = term.toLowerCase();

	if (normalized.includes("spring")) return 1;
	if (normalized.includes("summer")) return 2;
	if (normalized.includes("fall")) return 3;
	if (normalized.includes("winter")) return 4;

	return 9;
}

export default function CourseCatalogClient() {
	const searchParams = useSearchParams();
	const [query, setQuery] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalResults, setTotalResults] = useState(0);
	const [facets, setFacets] = useState<CatalogResponse["facets"]>({
		departments: [],
		terms: [],
		academicLevels: [],
	});
	const [insightsByCourseId, setInsightsByCourseId] = useState<Record<string, string>>({});
	const [insightsLoadingId, setInsightsLoadingId] = useState<string>("");
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const q = (searchParams.get("q") || "").trim();
		setQuery(q);
		setSearchInput(q);
		setPage(1);
	}, [searchParams]);

	const hasActiveFilters = useMemo(() => {
		return Boolean(
			query
			|| filters.department
			|| filters.term
			|| filters.year
			|| filters.academicLevel
			|| filters.openOnly
			|| filters.minCredits
			|| filters.maxCredits
		);
	}, [filters, query]);

	const sortedTerms = useMemo(() => {
		return [...facets.terms].sort((a, b) => {
			const yearDiff = parseYear(a) - parseYear(b);
			if (yearDiff !== 0) {
				return yearDiff;
			}

			const semesterDiff = parseSemesterRank(a) - parseSemesterRank(b);
			if (semesterDiff !== 0) {
				return semesterDiff;
			}

			return a.localeCompare(b);
		});
	}, [facets.terms]);

	const hasMorePages = page < totalPages;

	const yearOptions = useMemo(() => {
		const years = new Set<string>();

		for (const term of facets.terms) {
			const year = parseYear(term);
			if (year) {
				years.add(String(year));
			}
		}

		return [...years].sort((a, b) => Number(a) - Number(b));
	}, [facets.terms]);

	useEffect(() => {
		const controller = new AbortController();

		async function loadCourses() {
			setLoading(true);
			setError("");

			try {
				const response = await fetch("/api/courses/catalog", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					signal: controller.signal,
					body: JSON.stringify({
						query,
						page,
						pageSize: 12,
						filters: {
							department: filters.department || undefined,
							term: filters.term || undefined,
							year: filters.year || undefined,
							academicLevel: filters.academicLevel || undefined,
							openOnly: filters.openOnly || undefined,
							minCredits: filters.minCredits ? Number(filters.minCredits) : undefined,
							maxCredits: filters.maxCredits ? Number(filters.maxCredits) : undefined,
						},
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to load courses.");
				}

				const data = (await response.json()) as CatalogResponse;
				setCourses((previous) => {
					if (page === 1) {
						return data.results;
					}

					const merged = [...previous, ...data.results];
					const seen = new Set<string>();
					return merged.filter((course) => {
						const key = `${course._id}-${course.course_code}`;
						if (seen.has(key)) {
							return false;
						}

						seen.add(key);
						return true;
					});
				});
				setTotalPages(data.pagination.totalPages);
				setTotalResults(data.pagination.total);
				if (page === 1 || facets.departments.length === 0) {
					setFacets(data.facets);
				}
			}
			catch (fetchError) {
				if ((fetchError as Error).name === "AbortError") {
					return;
				}

				setError("Could not load course catalog. Please try again.");
			}
			finally {
				setLoading(false);
			}
		}

		void loadCourses();
		return () => controller.abort();
	}, [filters, page, query]);

	useEffect(() => {
		const node = loadMoreRef.current;
		if (!node) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const isVisible = entries[0]?.isIntersecting;
				if (!isVisible || loading || !hasMorePages || Boolean(error)) {
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
	}, [loading, hasMorePages, error]);

	async function handleGenerateInsights(course: Course) {
		setInsightsLoadingId(course._id);

		try {
			const response = await fetch("/api/courses/insights", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ course }),
			});

			if (!response.ok) {
				throw new Error("Failed to generate insights.");
			}

			const data = (await response.json()) as { insights: string };
			setInsightsByCourseId((previous) => ({ ...previous, [course._id]: data.insights }));
		}
		catch {
			setInsightsByCourseId((previous) => ({
				...previous,
				[course._id]: "AlfieAI could not generate insights right now. Please try again.",
			}));
		}
		finally {
			setInsightsLoadingId("");
		}
	}

	function updateFilters(next: Partial<CatalogFilters>) {
		setPage(1);
		setFilters((previous) => ({ ...previous, ...next }));
	}

	function handleDismissInsights(courseId: string) {
		setInsightsByCourseId((previous) => {
			const next = { ...previous };
			delete next[courseId];
			return next;
		});
	}

	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-10">
			<div className="rounded-2xl border border-default-200 bg-content1/60 p-4 sm:p-6 shadow-sm">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
					<div className="lg:col-span-7">
						<Input
							radius="full"
							value={searchInput}
							onValueChange={setSearchInput}
							placeholder="Search by code, title, description, or instructor"
							startContent={<IoIosSearch className="text-default-500" size={20} />}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									setPage(1);
									setQuery(searchInput.trim());
								}
							}}
						/>
					</div>

					<div className="lg:col-span-5 grid grid-cols-3 gap-2">
						<Button
							size="md"
							className="w-full"
							radius="full"
							variant="solid"
							color="secondary"
							onPress={() => {
								setPage(1);
								setQuery(searchInput.trim());
							}}
						>
							Search
						</Button>

						<Button
							size="md"
							className="w-full"
							radius="full"
							variant="flat"
							onPress={() => {
								setSearchInput("");
								setQuery("");
								setPage(1);
								setFilters(defaultFilters);
							}}
						>
							Reset
						</Button>

						<Button
							size="md"
							className="w-full"
							radius="full"
							variant={filters.openOnly ? "solid" : "flat"}
							color={filters.openOnly ? "success" : "default"}
							onPress={() => updateFilters({ openOnly: !filters.openOnly })}
						>
							Open seats only
						</Button>
					</div>
				</div>

				<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
					<Select
						aria-label="Department"
						placeholder="Department"
						selectedKeys={filters.department ? [filters.department] : []}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as string | undefined;
							updateFilters({ department: value || "" });
						}}
					>
					{facets.departments.map((dept) => (
						<SelectItem key={dept}>{dept}</SelectItem>
						))}
					</Select>

					<Select
						aria-label="Term"
						placeholder="Term"
						selectedKeys={filters.term ? [filters.term] : []}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as string | undefined;
							updateFilters({ term: value || "", year: value ? "" : filters.year });
						}}
					>
						{sortedTerms.map((term) => (
							<SelectItem key={term}>{term}</SelectItem>
						))}
					</Select>

					<Select
						aria-label="Year"
						placeholder="Year"
						selectedKeys={filters.year ? [filters.year] : []}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as string | undefined;
							updateFilters({ year: value || "", term: value ? "" : filters.term });
						}}
					>
						{yearOptions.map((year) => (
							<SelectItem key={year}>{year}</SelectItem>
						))}
					</Select>

					<Select
						aria-label="Academic Level"
						placeholder="Academic Level"
						selectedKeys={filters.academicLevel ? [filters.academicLevel] : []}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as string | undefined;
							updateFilters({ academicLevel: value || "" });
						}}
					>
					{facets.academicLevels.map((level) => (
						<SelectItem key={level}>{level}</SelectItem>
						))}
					</Select>

					<Input
						type="number"
						aria-label="Min Credits"
						placeholder="Min Credits"
						value={filters.minCredits}
						onValueChange={(value) => updateFilters({ minCredits: value })}
					/>

					<Input
						type="number"
						aria-label="Max Credits"
						placeholder="Max Credits"
						value={filters.maxCredits}
						onValueChange={(value) => updateFilters({ maxCredits: value })}
					/>
				</div>
			</div>

			<div className="mt-5 flex items-center justify-between text-sm text-default-600">
				<p>{totalResults} result{totalResults === 1 ? "" : "s"}</p>
				<p>{hasActiveFilters ? "Filtered view" : "All courses"}</p>
			</div>

			{loading && (
				<div className="mt-10 flex justify-center">
					<Spinner label="Loading catalog..." color="secondary" />
				</div>
			)}

			{error && !loading && (
				<p className="mt-6 text-center text-danger">{error}</p>
			)}

			{!loading && !error && courses.length === 0 && (
				<div className="flex flex-col mt-6 text-center text-default-500 gap-y-6">
					<p> No courses matched your filters. </p>
					<i className="text-default-200"> Note that courses with no registered sections will not be displayed. </i>
				</div>
			)}

			<div className="mt-4 grid grid-cols-1 gap-4">
				{courses.map((course, index) => (
					<CourseView
						key={`${course._id}-${course.course_code}-${index}`}
						course={course}
						onGenerateInsights={handleGenerateInsights}
						onDismissInsights={handleDismissInsights}
						insights={insightsByCourseId[course._id]}
						loadingInsights={insightsLoadingId === course._id}
					/>
				))}
			</div>

			<div ref={loadMoreRef} className="h-4" aria-hidden="true" />

			{loading && courses.length > 0 && (
				<div className="mt-6 flex justify-center">
					<Spinner label="Loading more courses..." color="secondary" />
				</div>
			)}

			{!loading && !hasMorePages && courses.length > 0 && (
				<p className="mt-6 text-center text-sm text-default-500">You&apos;ve reached the end of the catalog results.</p>
			)}
		</div>
	);
}
