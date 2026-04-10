"use client";

import { Button, Input } from "@heroui/react";
import { useMemo, useState } from "react";

interface CourseLite {
	_id: string;
	course_code: string;
	title: string;
	credits?: { minimum?: number; maximum?: number };
}

export default function ScheduleBuilder() {
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<CourseLite[]>([]);
	const [selected, setSelected] = useState<CourseLite[]>([]);
	const [loading, setLoading] = useState(false);

	const totalCredits = useMemo(() => {
		return selected.reduce((sum, course) => sum + (course.credits?.minimum || 0), 0);
	}, [selected]);

	async function searchCourses() {
		setLoading(true);
		try {
			const response = await fetch("/api/courses/catalog", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, page: 1, pageSize: 10, filters: {} }),
			});

			const data = await response.json();
			setSearchResults(data.results || []);
		}
		finally {
			setLoading(false);
		}
	}

	function addCourse(course: CourseLite) {
		setSelected((previous) => {
			if (previous.some((item) => item._id === course._id)) {
				return previous;
			}

			return [...previous, course];
		});
	}

	function removeCourse(courseId: string) {
		setSelected((previous) => previous.filter((course) => course._id !== courseId));
	}

	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-10">
			<div className="rounded-xl border border-default-200 bg-content1/60 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row gap-2">
					<Input
						value={query}
						onValueChange={setQuery}
						placeholder="Search courses to add to your schedule"
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								void searchCourses();
							}
						}}
					/>
					<Button color="secondary" onPress={() => void searchCourses()} isLoading={loading}>
						Search
					</Button>
				</div>
			</div>

			<div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
				<section className="rounded-xl border border-default-200 bg-content1/60 p-4">
					<h2 className="font-semibold mb-3">Results</h2>
					<div className="space-y-2">
						{searchResults.map((course) => (
							<div key={course._id} className="rounded-lg border border-default-200 p-3 flex items-center justify-between gap-3">
								<div>
									<p className="font-medium">{course.course_code}</p>
									<p className="text-sm text-default-500">{course.title}</p>
								</div>
								<Button size="sm" variant="flat" onPress={() => addCourse(course)}>Add</Button>
							</div>
						))}
					</div>
				</section>

				<section className="rounded-xl border border-default-200 bg-content1/60 p-4">
					<div className="flex items-center justify-between mb-3">
						<h2 className="font-semibold">Your Schedule</h2>
						<span className="text-sm text-default-500">{totalCredits} credits</span>
					</div>
					<div className="space-y-2">
						{selected.length === 0 && (
							<p className="text-sm text-default-500">Add courses from the left to build your semester.</p>
						)}

						{selected.map((course) => (
							<div key={course._id} className="rounded-lg border border-default-200 p-3 flex items-center justify-between gap-3">
								<div>
									<p className="font-medium">{course.course_code}</p>
									<p className="text-sm text-default-500">{course.title}</p>
								</div>
								<Button size="sm" color="danger" variant="light" onPress={() => removeCourse(course._id)}>Remove</Button>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
