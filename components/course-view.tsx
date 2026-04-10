//
// Filename: course-view.tsx
// Description: A display widget for course data and associated sections
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { Button } from "@heroui/button";
import { JSX } from "react";
import { LuSparkles } from "react-icons/lu";

import { Course } from "@/lib/models/course";

interface CourseViewProps {
	className?: string;
	course: Course;
	onGenerateInsights: (course: Course) => Promise<void>;
	onDismissInsights: (courseId: string) => void;
	insights?: string;
	loadingInsights?: boolean;
}

function formatMeetingDays(days?: string[] | null) {
	if (!Array.isArray(days) || days.length === 0) {
		return "TBA";
	}

	const dayMap: Record<string, string> = {
		M: "Monday",
		MON: "Monday",
		MONDAY: "Monday",
		T: "Tuesday",
		TU: "Tuesday",
		TUE: "Tuesday",
		TUES: "Tuesday",
		TUESDAY: "Tuesday",
		W: "Wednesday",
		WED: "Wednesday",
		WEDNESDAY: "Wednesday",
		R: "Thursday",
		TH: "Thursday",
		THU: "Thursday",
		THUR: "Thursday",
		THURS: "Thursday",
		THURSDAY: "Thursday",
		F: "Friday",
		FRI: "Friday",
		FRIDAY: "Friday",
		S: "Saturday",
		SA: "Saturday",
		SAT: "Saturday",
		SATURDAY: "Saturday",
		SU: "Sunday",
		SUN: "Sunday",
		SUNDAY: "Sunday",
	};

	const expanded = days.flatMap((value) => {
		const token = String(value || "").trim().toUpperCase();
		if (!token) {
			return [];
		}

		if (dayMap[token]) {
			return [dayMap[token]];
		}

		if (/^[MTWRFSU]+$/.test(token) && token.length > 1) {
			return token
				.split("")
				.map((piece) => dayMap[piece])
				.filter(Boolean);
		}

		return [value];
	});

	return expanded.length > 0 ? expanded.join(", ") : "TBA";
}

function formatMeetingTime(value?: string | null): string {
	if (!value) {
		return "TBA";
	}

	const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
	if (!match) {
		return value;
	}

	const hours = Number(match[1]);
	const minutes = Number(match[2]);

	if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
		return value;
	}

	const suffix = hours >= 12 ? "PM" : "AM";
	const hour12 = hours % 12 || 12;

	return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatMeetingRange(start?: string | null, end?: string | null): string {
	const formattedStart = formatMeetingTime(start);
	const formattedEnd = formatMeetingTime(end);

	if (formattedStart === "TBA" && formattedEnd === "TBA") {
		return "TBA";
	}

	if (formattedStart === "TBA") {
		return formattedEnd;
	}

	if (formattedEnd === "TBA") {
		return formattedStart;
	}

	return `${formattedStart} - ${formattedEnd}`;
}

function parseYear(term?: string | null): number {
	if (!term) {
		return 0;
	}

	const match = term.match(/(19|20)\d{2}/);
	return match ? Number(match[0]) : 0;
}

function parseSemesterRank(term?: string | null): number {
	const normalized = (term || "").toLowerCase();

	if (normalized.includes("spring")) return 1;
	if (normalized.includes("summer")) return 2;
	if (normalized.includes("fall")) return 3;
	if (normalized.includes("winter")) return 4;

	return 9;
}

function asDate(value?: string | null): Date | null {
	if (!value) {
		return null;
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function prettyDate(value?: string | null): string {
	const date = asDate(value);
	if (!date) {
		return "TBA";
	}

	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function enrollmentTone(available: number, capacity: number, waitlisted: number) {
	if (capacity <= 0) {
		return "text-default-700 bg-default-100";
	}

	if (available <= 0) {
		if (waitlisted > 0) {
			return "text-danger-700 bg-danger-100";
		}

		return "text-warning-700 bg-warning-100";
	}

	const ratio = available / capacity;
	if (ratio <= 0.15) {
		return "text-warning-700 bg-warning-100";
	}

	return "text-success-700 bg-success-100";
}

export default function CourseView({ className, course, onGenerateInsights, onDismissInsights, insights, loadingInsights }: CourseViewProps): JSX.Element {
	const credits = `${course.credits.minimum}${course.credits.maximum !== course.credits.minimum ? `-${course.credits.maximum}` : ""}`;
	const sortedSections = [...(course.sections || [])].sort((a, b) => {
		const yearDiff = parseYear(a.term) - parseYear(b.term);
		if (yearDiff !== 0) {
			return yearDiff;
		}

		const semesterDiff = parseSemesterRank(a.term) - parseSemesterRank(b.term);
		if (semesterDiff !== 0) {
			return semesterDiff;
		}

		return (a.section_name || "").localeCompare(b.section_name || "");
	});

	const termsOffered = [...new Set(sortedSections.map((section) => section.term).filter(Boolean))];
	const genEdTags = [...new Set((course.course_types || []).filter(Boolean))];
	const gradingModes = [...new Set(sortedSections.flatMap((section) => section.grading || []).filter(Boolean))];
	const requisites = (course.requisites || []).filter(Boolean);

	const startDates = sortedSections.map((section) => asDate(section.start_date)).filter((value): value is Date => Boolean(value));
	const endDates = sortedSections.map((section) => asDate(section.end_date)).filter((value): value is Date => Boolean(value));

	const overallStart = startDates.length > 0 ? new Date(Math.min(...startDates.map((date) => date.getTime()))) : null;
	const overallEnd = endDates.length > 0 ? new Date(Math.max(...endDates.map((date) => date.getTime()))) : null;

	const totalOpenSeats = sortedSections.reduce((sum, section) => sum + (section.availability?.available || 0), 0);
	const totalCapacity = sortedSections.reduce((sum, section) => sum + (section.availability?.capacity || 0), 0);
	const totalWaitlisted = sortedSections.reduce((sum, section) => sum + (section.availability?.waitlisted || 0), 0);
	const courseAvailabilityTone = enrollmentTone(totalOpenSeats, totalCapacity, totalWaitlisted);

	return (
		<div className={`${className} flex flex-col w-full rounded-xl border border-default-200 bg-default-50/40 p-4 sm:p-5`}>
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-wider text-default-500">{course.academic_level}</p>
					<h2 className="text-xl sm:text-2xl font-semibold leading-tight">{course.course_code}: {course.title}</h2>
				</div>

				<div className="flex items-center gap-2 text-sm">
					<span className="rounded-full bg-default-100 px-3 py-1">{credits} credits</span>
					<Button
						size="sm"
						color="secondary"
						variant="flat"
						startContent={<LuSparkles size={14} />}
						onPress={() => void onGenerateInsights(course)}
						isLoading={loadingInsights}
					>
						AI insights
					</Button>
				</div>
			</div>

			<hr className="border-1 h-px border-default-300 my-3"/>

			<p className="text-default-700 text-sm sm:text-base">{course.description}</p>

			<div className="mt-3 flex flex-wrap gap-2 text-xs">
				<span className="rounded-full bg-default-100 px-3 py-1">{sortedSections.length} section{sortedSections.length === 1 ? "" : "s"}</span>
				<span className={`rounded-full px-3 py-1 ${courseAvailabilityTone}`}>{totalOpenSeats} open / {totalCapacity} capacity</span>
				{totalWaitlisted > 0 && (
					<span className="rounded-full bg-warning-100 text-warning-700 px-3 py-1">{totalWaitlisted} waitlisted</span>
				)}
				{termsOffered.map((term, index) => (
					<span key={`${course._id}-term-${term}-${index}`} className="rounded-full bg-default-100 px-3 py-1">{term}</span>
				))}
			</div>

			<div className="mt-4 rounded-lg border border-default-200 bg-content1/60 p-4">
				<p className="text-xs font-semibold uppercase tracking-wide text-default-500">Course Snapshot</p>
				<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
					<div className="space-y-1">
						<p className="text-xs uppercase tracking-wide text-default-500">Runs</p>
						<p>{overallStart ? prettyDate(overallStart.toISOString()) : "TBA"} to {overallEnd ? prettyDate(overallEnd.toISOString()) : "TBA"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs uppercase tracking-wide text-default-500">Grading</p>
						<p>{gradingModes.length > 0 ? gradingModes.join(", ") : "TBA"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs uppercase tracking-wide text-default-500">Gen Ed / Types</p>
						<p>{genEdTags.length > 0 ? genEdTags.join(", ") : "None listed"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs uppercase tracking-wide text-default-500">Requisites</p>
						<p>{requisites.length > 0 ? requisites.join("; ") : "None listed"}</p>
					</div>
				</div>
			</div>

			{insights && (
				<div className="mt-4 rounded-lg border border-secondary-200 bg-secondary-50/60 p-3">
					<div className="flex items-center justify-between gap-2">
						<p className="text-xs font-semibold uppercase tracking-wide text-secondary-700">AlfieAI Insights</p>
						<Button
							size="sm"
							variant="light"
							onPress={() => onDismissInsights(course._id)}
						>
							Dismiss
						</Button>
					</div>
					<p className="whitespace-pre-wrap text-sm mt-1 text-secondary-900">{insights}</p>
				</div>
			)}

			<div className="mt-4">
				<Accordion
					className="px-0!"
					variant="splitted"
					selectionMode="multiple"
					itemClasses={{
						base: "!px-0",
						trigger: "px-5 py-5",
						content: "px-5 pb-5 pt-2",
					}}
				>
					{sortedSections.map((section, sectionIndex) => (
						(() => {
							const sectionNumberInTerm = sortedSections
								.slice(0, sectionIndex + 1)
								.filter((item) => (item.term || "") === (section.term || ""))
								.length;
							const available = section.availability?.available || 0;
							const capacity = section.availability?.capacity || 0;
							const waitlisted = section.availability?.waitlisted || 0;
							const sectionTone = enrollmentTone(available, capacity, waitlisted);

							return (
						<AccordionItem
							key={`${course._id}-${section.section_name}-${section.term}-${sectionIndex}`}
							title={`Section ${sectionNumberInTerm} • ${section.term}`}
							subtitle={`${available} seats open / ${capacity} capacity${waitlisted > 0 ? ` • ${waitlisted} waitlisted` : ""}`}
						>
							<div className="grid gap-2 text-sm">
								<p>
									<span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${sectionTone}`}>
										Enrollment: {available > 0 ? "Open" : waitlisted > 0 ? "Waitlisted" : "Closed"}
									</span>
								</p>
								<p><strong>Status:</strong> {section.status}</p>
								{waitlisted > 0 && <p><strong>Waitlist:</strong> {waitlisted} student{waitlisted === 1 ? "" : "s"}</p>}
								<p><strong>Dates:</strong> {prettyDate(section.start_date)} to {prettyDate(section.end_date)}</p>
								<p><strong>Location:</strong> {section.location}</p>
								{(section.meeting_info || []).map((meeting, meetingIndex) => (
									<p key={`${course._id}-${section.section_name}-${sectionIndex}-meeting-${meetingIndex}`}>
										<strong>Meeting {meetingIndex + 1}:</strong> {formatMeetingDays(meeting.days)} • {formatMeetingRange(meeting.start_time, meeting.end_time)} • {meeting.classroom}
									</p>
								))}
								<p>
									<strong>Instructors:</strong> {(section.instructors || []).map((instructor) => instructor.name).join(", ") || "TBA"}
								</p>
							</div>
						</AccordionItem>
							);
						})()
					))}
				</Accordion>
			</div>
		</div>
	);
}