"use client";

import { Button } from "@heroui/button";
import { useState } from "react";
import { LuExternalLink, LuGraduationCap, LuSparkles } from "react-icons/lu";

interface Offering {
	course_code: string;
	title: string;
	credits: string;
}

interface TermOfferings {
	term: string;
	courses: Offering[];
}

interface ProfessorDetail {
	firstName: string;
	lastName: string;
	fullName: string;
	department: string;
	primaryTitle?: string;
	titles?: string[];
	email?: string;
	phone?: string;
	biographyUrl?: string;
	headshotUrl?: string;
}

interface ProfessorDetailViewProps {
	professor: ProfessorDetail;
	offeringsByTerm: TermOfferings[];
}

function formatCreditsLabel(credits: string): string {
	const normalized = String(credits || "").trim();
	if (!normalized) {
		return "credits";
	}

	if (normalized.includes("-")) {
		return "credits";
	}

	const numeric = Number(normalized);
	if (!Number.isNaN(numeric) && numeric === 1) {
		return "credit";
	}

	return "credits";
}

export default function ProfessorDetailView({ professor, offeringsByTerm }: ProfessorDetailViewProps) {
	const [insights, setInsights] = useState("");
	const [loadingInsights, setLoadingInsights] = useState(false);

	async function generateInsights() {
		setLoadingInsights(true);

		try {
			const response = await fetch("/api/courses/professors/insights", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ professor }),
			});

			const data = await response.json();
			setInsights(data.insights || "No insight available.");
		}
		finally {
			setLoadingInsights(false);
		}
	}

	return (
		<>
			<div className="mt-4 rounded-xl border border-default-200 bg-content1/60 p-5 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-start gap-4">
					{professor.headshotUrl
						? <img src={professor.headshotUrl} alt={`Headshot of ${professor.fullName}`} className="w-24 h-24 rounded-full object-cover border border-default-200" />
						: <div className="w-24 h-24 rounded-full bg-default-100 border border-default-200 text-default-700 grid place-items-center text-2xl font-semibold">{professor.firstName.charAt(0)}{professor.lastName.charAt(0)}</div>
					}
					<div className="min-w-0 flex-1">
						<h1 className="text-3xl sm:text-4xl font-semibold leading-tight">{professor.fullName}</h1>
						<p className="text-default-600 mt-1">{professor.department || "Unknown"}</p>
						{professor.primaryTitle && <p className="text-sm text-default-500 mt-1">{professor.primaryTitle}</p>}

						<div className="mt-3 flex flex-wrap gap-2 text-sm">
							{professor.email && <a className="rounded-full bg-default-100 px-3 py-1" href={`mailto:${professor.email}`}>{professor.email}</a>}
							{professor.phone && <a className="rounded-full bg-default-100 px-3 py-1" href={`tel:${professor.phone}`}>{professor.phone}</a>}
							{professor.biographyUrl && (
								<a className="rounded-full bg-secondary-100 text-secondary-700 px-3 py-1 inline-flex items-center gap-1" href={professor.biographyUrl} target="_blank" rel="noreferrer">
									Official Bio
									<LuExternalLink size={13} />
								</a>
							)}
						</div>
					</div>
				</div>

				{Array.isArray(professor.titles) && professor.titles.length > 0 && (
					<div className="mt-5">
						<p className="text-xs uppercase tracking-wide text-default-500">Titles</p>
						<ul className="mt-2 list-none list-inside text-sm text-default-700 space-y-1">
							{professor.titles.map((title) => (
								<li key={title}>{title}</li>
							))}
						</ul>
					</div>
				)}

				<div className="mt-5">
					<Button
						size="sm"
						variant="flat"
						color="secondary"
						startContent={<LuSparkles size={14} />}
						onPress={() => void generateInsights()}
						isLoading={loadingInsights}
					>
						AI insights
					</Button>
				</div>

				{insights && (
					<div className="mt-3 rounded-lg border border-secondary-200 bg-secondary-50/60 p-3 text-sm whitespace-pre-wrap">
						{insights}
					</div>
				)}
			</div>

			<div className="mt-4 rounded-xl border border-default-200 bg-content1/60 p-5 sm:p-6">
				<h2 className="text-xl font-semibold">Course Offerings</h2>
				{offeringsByTerm.length === 0 && (
					<p className="mt-2 text-sm text-default-500">No matching offerings found in current catalog.</p>
				)}

				<div className="mt-3 space-y-3">
					{offeringsByTerm.map((termBlock, termIndex) => (
						<div key={termBlock.term} className="rounded-lg border border-default-200 p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-default-500">{termBlock.term}</p>
							<div className="mt-2 space-y-2 text-sm">
								{termBlock.courses.map((course, courseIndex) => (
									<div key={`${termBlock.term}-${course.course_code}-${course.title}-${termIndex}-${courseIndex}`} className="flex flex-wrap items-center gap-x-2 gap-y-1">
										<span className="font-medium">{course.course_code}</span>
										<span>-</span>
										<span className="mr-1">{course.title}</span>
										<span className="inline-flex items-center gap-1 rounded-full bg-default-100 px-2.5 py-1 text-xs font-medium text-default-700">
											<LuGraduationCap size={12} />
											{course.credits} {formatCreditsLabel(course.credits)}
										</span>
										<a
											href={`/courses/catalog?q=${encodeURIComponent(course.course_code)}`}
											className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2.5 py-1 text-xs font-medium text-secondary-700 hover:bg-secondary-200 transition-colors"
										>
											<LuExternalLink size={12} />
											View in course catalog
										</a>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}
