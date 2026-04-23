"use client";

import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Switch,
} from "@heroui/react";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import {
	FiArrowLeft,
	FiBookOpen,
	FiClock,
	FiMapPin,
	FiMessageCircle,
	FiSearch,
	FiTrash2,
	FiUser,
	FiX,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";

import MarkdownRenderer from "@/components/markdown-renderer";
import Message from "@/components/message";
import LoadingCalendarShell from "@/components/schedule-results/loading-calendar-shell";
import NotesPanel from "@/components/schedule-results/notes-panel";
import RequirementsProgressPanel from "@/components/schedule-results/requirements-progress-panel";
import { inferRequirementCategories } from "@/lib/gen-ed-rules";
import {
	formatDisplayTime,
	formatHourLabel,
	formatMeeting,
	getCourseInstanceKey,
	getMeetingDays,
	normalizeCourseCode,
	normalizeCoursesForDisplay,
	parseTimeToMinutes,
} from "@/lib/schedule-results-display";
import { Course } from "@/lib/models/course";
import type {
	ScheduleCourseResult,
	ScheduleGenerationResult,
	ScheduleMeetingBlock,
	WeekdayCode,
} from "@/lib/schedule-ai";

interface ScheduleBuilderResultProps {
	result: ScheduleGenerationResult | null;
	loading: boolean;
	error: string;
	onBack: () => void;
}

interface CatalogResponse {
	results: Course[];
	pagination: {
		page: number;
		totalPages: number;
	};
}

interface CalendarEvent {
	course: ScheduleCourseResult;
	day: WeekdayCode;
	startMinutes: number;
	endMinutes: number;
	colorClassName: string;
}

interface ReplacementSuggestionState {
	removedCourse: ScheduleCourseResult;
	suggestions: ScheduleCourseResult[];
}

interface ResultsAssistantMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
}

type ResultTab = "schedule" | "requirements" | "notes";

const calendarDays: Array<{ key: WeekdayCode; label: string }> = [
	{ key: "M", label: "Mon" },
	{ key: "T", label: "Tue" },
	{ key: "W", label: "Wed" },
	{ key: "Th", label: "Thu" },
	{ key: "F", label: "Fri" },
];

const COURSE_COLOR_CLASSES = [
	"border-cyan-300/55 bg-cyan-950/92 shadow-cyan-950/40",
	"border-emerald-300/55 bg-emerald-950/92 shadow-emerald-950/40",
	"border-fuchsia-300/55 bg-fuchsia-950/92 shadow-fuchsia-950/40",
	"border-amber-300/55 bg-amber-950/92 shadow-amber-950/40",
	"border-sky-300/55 bg-sky-950/92 shadow-sky-950/40",
	"border-rose-300/55 bg-rose-950/92 shadow-rose-950/40",
];

const HOUR_ROW_HEIGHT = 88;

const ASSISTANT_QUICK_PROMPTS = [
	"Check for art courses",
	"What gen eds are on my calendar?",
	"Which backup should I promote first?",
];

const modelBubble = {
	light: "bg-linear-to-br from-white to-secondary-50 border border-secondary-100/90",
	dark: "dark:bg-linear-to-br dark:from-zinc-950/92 dark:to-secondary-950/24 dark:border-secondary-900/35",
};

function selectBestSectionForTerm(course: Course, term: string): ScheduleCourseResult["section"] | null {
	const termSections = (course.sections || []).filter((section) => section.term === term);
	if (termSections.length === 0) {
		return null;
	}

	const openSections = termSections.filter((section) => Number(section.availability?.available || 0) > 0 && /open/i.test(section.status || ""));
	const source = openSections.length > 0 ? openSections : termSections;
	const sorted = [...source].sort((left, right) => {
		const openDiff = Number(right.availability?.available || 0) - Number(left.availability?.available || 0);
		if (openDiff !== 0) {
			return openDiff;
		}

		const waitDiff = Number(left.availability?.waitlisted || 0) - Number(right.availability?.waitlisted || 0);
		if (waitDiff !== 0) {
			return waitDiff;
		}

		return (left.section_name || "").localeCompare(right.section_name || "");
	});

	const chosen = sorted[0];
	const meetingBlocks: ScheduleMeetingBlock[] = (chosen.meeting_info || []).map((meeting) => ({
		days: getMeetingDays(meeting.days),
		startTime: (meeting.start_time || "").trim(),
		endTime: (meeting.end_time || "").trim(),
		location: (meeting.classroom || chosen.location || "").trim(),
		startMinutes: parseTimeToMinutes(meeting.start_time || ""),
		endMinutes: parseTimeToMinutes(meeting.end_time || ""),
	}));

	return {
		sectionName: chosen.section_name || "TBA",
		term,
		status: chosen.status || "Unknown",
		location: (chosen.location || "").trim() || "TBA",
		openSeats: Number(chosen.availability?.available || 0),
		capacity: Number(chosen.availability?.capacity || 0),
		waitlisted: Number(chosen.availability?.waitlisted || 0),
		instructors: (chosen.instructors || []).map((instructor) => instructor.name).filter(Boolean),
		meetings: (chosen.meeting_info || []).map(formatMeeting),
		meetingBlocks,
	};
}

function convertCatalogCourse(course: Course, term: string): ScheduleCourseResult | null {
	const section = selectBestSectionForTerm(course, term);
	if (!section) {
		return null;
	}

	return {
		courseCode: course.course_code,
		title: course.title,
		description: course.description,
		credits: Number(course.credits?.minimum || 0),
		categories: course.course_types || [],
		primary: true,
		section,
	};
}

function convertAllCourseSections(course: Course, term: string): ScheduleCourseResult[] {
	return normalizeCoursesForDisplay((course.sections || [])
		.filter((section) => section.term === term)
		.map((section) => {
			const meetingBlocks: ScheduleMeetingBlock[] = (section.meeting_info || []).map((meeting) => ({
				days: getMeetingDays(meeting.days),
				startTime: formatDisplayTime(meeting.start_time || ""),
				endTime: formatDisplayTime(meeting.end_time || ""),
				location: (meeting.classroom || section.location || "").trim(),
				startMinutes: parseTimeToMinutes(meeting.start_time || ""),
				endMinutes: parseTimeToMinutes(meeting.end_time || ""),
			}));

			return {
				courseCode: course.course_code,
				title: course.title,
				description: course.description,
				credits: Number(course.credits?.minimum || 0),
				categories: course.course_types || [],
				primary: true,
				section: {
					sectionName: section.section_name || "TBA",
					term,
					status: section.status || "Unknown",
					location: (section.location || "").trim() || "TBA",
					openSeats: Number(section.availability?.available || 0),
					capacity: Number(section.availability?.capacity || 0),
					waitlisted: Number(section.availability?.waitlisted || 0),
					instructors: (section.instructors || []).map((i) => i.name).filter(Boolean),
					meetings: (section.meeting_info || []).map(formatMeeting),
					meetingBlocks,
				},
			};
		}));
}

function buildCalendarWindow(courses: ScheduleCourseResult[]): { startMinutes: number; endMinutes: number } {
	const allMeetingMinutes = courses.flatMap((course) =>
		course.section.meetingBlocks.flatMap((meeting) => [meeting.startMinutes, meeting.endMinutes]),
	).filter((value): value is number => typeof value === "number");

	if (allMeetingMinutes.length === 0) {
		return { startMinutes: 8 * 60, endMinutes: 18 * 60 };
	}

	const earliest = Math.min(...allMeetingMinutes);
	const latest = Math.max(...allMeetingMinutes);
	const startMinutes = Math.max(8 * 60, Math.floor(earliest / 60) * 60);
	const endMinutes = Math.min(21 * 60, Math.max(18 * 60, Math.ceil(latest / 60) * 60 + 60));

	return { startMinutes, endMinutes };
}

function buildCalendarEvents(courses: ScheduleCourseResult[]): CalendarEvent[] {
	return courses.flatMap((course, courseIndex) =>
		course.section.meetingBlocks.flatMap((meeting) => {
			if (meeting.startMinutes === null || meeting.endMinutes === null) {
				return [];
			}

			return meeting.days
				.filter((day) => calendarDays.some((calendarDay) => calendarDay.key === day))
				.map((day) => ({
					course,
					day,
					startMinutes: meeting.startMinutes as number,
					endMinutes: meeting.endMinutes as number,
					colorClassName: COURSE_COLOR_CLASSES[courseIndex % COURSE_COLOR_CLASSES.length],
				}));
		}),
	);
}

function blocksOverlap(left: ScheduleMeetingBlock, right: ScheduleMeetingBlock): boolean {
	const leftStart = left.startMinutes;
	const leftEnd = left.endMinutes;
	const rightStart = right.startMinutes;
	const rightEnd = right.endMinutes;

	if (leftStart === null || leftEnd === null || rightStart === null || rightEnd === null) {
		return false;
	}

	const dayOverlap = left.days.some((day) => right.days.includes(day));
	if (!dayOverlap) {
		return false;
	}

	return leftStart < rightEnd && rightStart < leftEnd;
}

function coursesConflict(left: ScheduleCourseResult, right: ScheduleCourseResult): boolean {
	for (const leftBlock of left.section.meetingBlocks) {
		for (const rightBlock of right.section.meetingBlocks) {
			if (blocksOverlap(leftBlock, rightBlock)) {
				return true;
			}
		}
	}

	return false;
}

function fitsCurrentSchedule(candidate: ScheduleCourseResult, schedule: ScheduleCourseResult[]): boolean {
	return schedule.every((scheduled) => !coursesConflict(candidate, scheduled));
}

function timeSimilarityScore(removed: ScheduleCourseResult, candidate: ScheduleCourseResult): number {
	let best = 0;

	for (const left of removed.section.meetingBlocks) {
		for (const right of candidate.section.meetingBlocks) {
			const leftStart = left.startMinutes;
			const leftEnd = left.endMinutes;
			const rightStart = right.startMinutes;
			const rightEnd = right.endMinutes;

			if (leftStart === null || leftEnd === null || rightStart === null || rightEnd === null) {
				continue;
			}

			const daysOverlap = left.days.some((day) => right.days.includes(day));
			if (!daysOverlap) {
				continue;
			}

			const overlap = Math.max(0, Math.min(leftEnd, rightEnd) - Math.max(leftStart, rightStart));
			const maxDuration = Math.max(leftEnd - leftStart, rightEnd - rightStart, 1);
			best = Math.max(best, overlap / maxDuration);
		}
	}

	return best;
}

function replacementScore(removed: ScheduleCourseResult, candidate: ScheduleCourseResult): number {
	const overlapCategories = candidate.categories.filter((category) => removed.categories.includes(category)).length;
	const creditDelta = Math.abs(candidate.credits - removed.credits);
	const seatBonus = candidate.section.openSeats > 0 ? 1 : 0;
	const timeScore = timeSimilarityScore(removed, candidate);

	return overlapCategories * 2 + Math.max(0, 3 - creditDelta) + seatBonus + timeScore * 4;
}

function buildReplacementSuggestions(
	removed: ScheduleCourseResult,
	currentPrimary: ScheduleCourseResult[],
	catalogCourses: ScheduleCourseResult[],
	selectedCourseCodes: Set<string>,
): ScheduleCourseResult[] {
	const candidates = catalogCourses
		.filter((course) => normalizeCourseCode(course.courseCode) !== normalizeCourseCode(removed.courseCode))
		.filter((course) => !selectedCourseCodes.has(normalizeCourseCode(course.courseCode)))
		.filter((course) => fitsCurrentSchedule(course, currentPrimary));

	const sorted = [...candidates].sort((left, right) => {
		const scoreDiff = replacementScore(removed, right) - replacementScore(removed, left);
		if (scoreDiff !== 0) {
			return scoreDiff;
		}
		return normalizeCourseCode(left.courseCode).localeCompare(normalizeCourseCode(right.courseCode));
	});

	return sorted.slice(0, 3);
}

export default function ScheduleBuilderResult({ result, loading, error, onBack }: ScheduleBuilderResultProps): JSX.Element {
	const [selectedCourse, setSelectedCourse] = useState<ScheduleCourseResult | null>(null);
	const [activeTab, setActiveTab] = useState<ResultTab>("schedule");
	const [editableCourses, setEditableCourses] = useState<ScheduleCourseResult[]>(() => normalizeCoursesForDisplay(result?.allSelectedCourses || []));
	const [replacementState, setReplacementState] = useState<ReplacementSuggestionState | null>(null);
	const [catalogModalOpen, setCatalogModalOpen] = useState(false);
	const [catalogFitOnly, setCatalogFitOnly] = useState(true);
	const [catalogQuery, setCatalogQuery] = useState("");
	const [catalogCourses, setCatalogCourses] = useState<ScheduleCourseResult[]>([]);
	const [catalogLoading, setCatalogLoading] = useState(false);
	const [catalogError, setCatalogError] = useState("");
	const [assistantOpen, setAssistantOpen] = useState(false);
	const [assistantMessages, setAssistantMessages] = useState<ResultsAssistantMessage[]>([]);
	const [assistantDraft, setAssistantDraft] = useState("");
	const [assistantLoading, setAssistantLoading] = useState(false);
	const catalogLoadPromiseRef = useRef<Promise<ScheduleCourseResult[]> | null>(null);
	const catalogGenRef = useRef(0);
	const assistantScrollRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!result) {
			return;
		}

		setEditableCourses(normalizeCoursesForDisplay(result.allSelectedCourses.map((course) => ({
			...course,
			section: {
				...course.section,
				instructors: [...course.section.instructors],
				meetings: [...course.section.meetings],
				meetingBlocks: course.section.meetingBlocks.map((meeting) => ({
					...meeting,
					days: [...meeting.days],
				})),
			},
		}))));
		setReplacementState(null);
		setCatalogCourses([]);
		catalogLoadPromiseRef.current = null;
		catalogGenRef.current += 1;
	}, [result]);

	useEffect(() => {
		setAssistantMessages([]);
		setAssistantDraft("");
		setAssistantLoading(false);
	}, [result?.term]);

	useEffect(() => {
		if (!assistantOpen) {
			return;
		}

		assistantScrollRef.current?.scrollTo({ top: assistantScrollRef.current.scrollHeight, behavior: "smooth" });
	}, [assistantMessages, assistantLoading, assistantOpen]);

	const primaryCourses = useMemo(() => editableCourses.filter((course) => course.primary), [editableCourses]);
	const backupCourses = useMemo(() => editableCourses.filter((course) => !course.primary), [editableCourses]);
	const originalPrimaryCourseKeys = useMemo(
		() => new Set((result?.primaryCourses || []).map((course) => getCourseInstanceKey(course))),
		[result?.primaryCourses]
	);
	const selectedCodes = useMemo(() => new Set(editableCourses.map((course) => normalizeCourseCode(course.courseCode))), [editableCourses]);
	const primaryPoeValues = useMemo(() => result?.primaryPoes || [], [result?.primaryPoes]);
	const primaryPoeText = useMemo(() => {
		const values = primaryPoeValues;
		if (values.length > 0) {
			return values.join(", ");
		}

		return result?.poe || "";
	}, [primaryPoeValues, result?.poe]);
	const creditPreferenceText = useMemo(() => {
		if (!result) {
			return "";
		}

		const preference = result.creditPreference;
		if (preference.profile === "custom") {
			if (preference.maxCredits === null && preference.minCredits !== null) {
				return `${preference.label} (at least ${preference.minCredits} credits)`;
			}
			if (preference.minCredits !== null && preference.maxCredits !== null) {
				return `${preference.label} (${preference.minCredits}-${preference.maxCredits} credits)`;
			}
		}

		return preference.label;
	}, [result]);
	const scheduleSummaryChips = useMemo(() => {
		const totalCredits = primaryCourses.reduce((sum, course) => sum + Number(course.credits || 0), 0);
		const genEdCourses = primaryCourses.filter((course) => inferRequirementCategories(course.categories).length > 0).length;
		const poeCoreCourses = Math.max(0, primaryCourses.length - genEdCourses);

		const chips = [
			{
				label: "Courses",
				value: primaryCourses.length,
				className: "border-cyan-300/70 bg-cyan-100/90 text-cyan-800 dark:border-cyan-400/35 dark:bg-cyan-500/12 dark:text-cyan-100",
			},
			{
				label: "Credits",
				value: totalCredits,
				className: "border-emerald-300/70 bg-emerald-100/90 text-emerald-800 dark:border-emerald-400/35 dark:bg-emerald-500/12 dark:text-emerald-100",
			},
			{
				label: "POE/Core",
				value: poeCoreCourses,
				className: "border-fuchsia-300/70 bg-fuchsia-100/90 text-fuchsia-800 dark:border-fuchsia-400/35 dark:bg-fuchsia-500/12 dark:text-fuchsia-100",
			},
			{
				label: "Gen Eds",
				value: genEdCourses,
				className: "border-amber-300/70 bg-amber-100/90 text-amber-800 dark:border-amber-400/35 dark:bg-amber-500/12 dark:text-amber-100",
			},
		];

		const prePlannedCount = primaryCourses.filter((c) => c.selectionSource === "user").length;

		if (prePlannedCount > 0) {
			chips.push({
				label: "Pre-planned",
				value: prePlannedCount,
				className: "border-violet-300/70 bg-violet-100/90 text-violet-800 dark:border-violet-400/35 dark:bg-violet-500/12 dark:text-violet-300",
			});
		}

		return chips;
	}, [primaryCourses]);

	const conflictingCourseKeys = useMemo(() => {
		const keys = new Set<string>();
		for (let i = 0; i < primaryCourses.length; i++) {
			for (let j = i + 1; j < primaryCourses.length; j++) {
				if (coursesConflict(primaryCourses[i], primaryCourses[j])) {
					keys.add(getCourseInstanceKey(primaryCourses[i]));
					keys.add(getCourseInstanceKey(primaryCourses[j]));
				}
			}
		}
		return keys;
	}, [primaryCourses]);

	const calendarWindow = useMemo(() => buildCalendarWindow(primaryCourses), [primaryCourses]);
	const calendarEvents = useMemo(() => buildCalendarEvents(primaryCourses), [primaryCourses]);
	const calendarHeight = ((calendarWindow.endMinutes - calendarWindow.startMinutes) / 60) * HOUR_ROW_HEIGHT;
	const hourTicks = useMemo(() => {
		const ticks: number[] = [];
		for (let minutes = calendarWindow.startMinutes; minutes <= calendarWindow.endMinutes; minutes += 60) {
			ticks.push(minutes);
		}
		return ticks;
	}, [calendarWindow.endMinutes, calendarWindow.startMinutes]);

	const filteredCatalogCourses = useMemo(() => {
		const query = catalogQuery.trim().toLowerCase();
		const primaryWithoutTarget = primaryCourses;
		return catalogCourses
			.filter((course) => !selectedCodes.has(normalizeCourseCode(course.courseCode)))
			.filter((course) => {
				if (!query) {
					return true;
				}

				return normalizeCourseCode(course.courseCode).toLowerCase().includes(query)
					|| (course.title || "").toLowerCase().includes(query)
					|| (course.description || "").toLowerCase().includes(query);
			})
			.filter((course) => {
				if (!catalogFitOnly) {
					return true;
				}
				return fitsCurrentSchedule(course, primaryWithoutTarget);
			});
	}, [catalogCourses, catalogFitOnly, catalogQuery, primaryCourses, selectedCodes]);

	const groupedCatalog = useMemo(() => {
		const groups = new Map<string, ScheduleCourseResult[]>();
		for (const entry of filteredCatalogCourses) {
			const key = normalizeCourseCode(entry.courseCode);
			if (!groups.has(key)) {
				groups.set(key, []);
			}
			groups.get(key)!.push(entry);
		}
		return Array.from(groups.values());
	}, [filteredCatalogCourses]);

	async function loadCatalogCoursesForTerm(): Promise<ScheduleCourseResult[]> {
		if (!result) {
			return [];
		}

		if (catalogCourses.length > 0) {
			return catalogCourses;
		}

		if (catalogLoadPromiseRef.current) {
			return catalogLoadPromiseRef.current;
		}

		const gen = catalogGenRef.current;
		const loadPromise = (async () => {
			setCatalogLoading(true);
			setCatalogError("");

			try {
				const term = result.term;
				const seen = new Set<string>();
				const merged: ScheduleCourseResult[] = [];
				let page = 1;
				let totalPages = 1;

				do {
					const response = await fetch("/api/courses/catalog", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							query: "",
							page,
							pageSize: 50,
							filters: { term },
						}),
					});

					if (!response.ok) {
						throw new Error("Failed to load catalog courses for this term.");
					}

					const payload = (await response.json()) as CatalogResponse;
					totalPages = payload.pagination.totalPages || 1;

					for (const course of payload.results || []) {
						const expanded = convertAllCourseSections(course, term);
						for (const entry of expanded) {
							const key = `${normalizeCourseCode(entry.courseCode)}::${entry.section.sectionName}`;
							if (seen.has(key)) {
								continue;
							}
							seen.add(key);
							merged.push(entry);
						}
					}

					page += 1;
				}
				while (page <= totalPages);

				// Discard result if a newer schedule was generated while loading
				if (catalogGenRef.current === gen) {
					setCatalogCourses(merged);
				}
				return merged;
			}
			catch (fetchError) {
				const message = (fetchError as Error).message || "Could not load catalog courses.";
				if (catalogGenRef.current === gen) {
					setCatalogError(message);
				}
				return [];
			}
			finally {
				if (catalogGenRef.current === gen) {
					setCatalogLoading(false);
				}
				catalogLoadPromiseRef.current = null;
			}
		})();

		catalogLoadPromiseRef.current = loadPromise;
		return loadPromise;
	}

	async function openCatalogModal() {
		setCatalogModalOpen(true);
		void loadCatalogCoursesForTerm();
	}

	function addCourseToSchedule(course: ScheduleCourseResult, asPrimary = true) {
		setEditableCourses((previous) => {
			const existingIndex = previous.findIndex((item) => normalizeCourseCode(item.courseCode) === normalizeCourseCode(course.courseCode));
			if (existingIndex >= 0) {
				if (!asPrimary) {
					return previous;
				}

				return previous.map((item, index) => index === existingIndex ? { ...item, primary: true } : item);
			}

			return [...previous, { ...course, primary: asPrimary }];
		});
	}

	function removeCourseFromCalendar(targetCourse: ScheduleCourseResult) {
		const targetKey = getCourseInstanceKey(targetCourse);
		setEditableCourses((previous) => previous.map((course) => {
			if (getCourseInstanceKey(course) !== targetKey) {
				return course;
			}

			return {
				...course,
				primary: false,
			};
		}));
	}

	async function removeCourseFromSchedule(targetCourse: ScheduleCourseResult) {
		const targetKey = getCourseInstanceKey(targetCourse);
		const nextCourses = editableCourses.filter((course) => getCourseInstanceKey(course) !== targetKey);
		setEditableCourses(nextCourses);

		if (selectedCourse && getCourseInstanceKey(selectedCourse) === targetKey) {
			setSelectedCourse(null);
		}

		const nextPrimary = nextCourses.filter((course) => course.primary);
		const catalogSource = await loadCatalogCoursesForTerm();
		const nextSelectedCodes = new Set(nextCourses.map((course) => normalizeCourseCode(course.courseCode)));
		const suggestions = buildReplacementSuggestions(targetCourse, nextPrimary, catalogSource, nextSelectedCodes);

		setReplacementState({
			removedCourse: targetCourse,
			suggestions,
		});
	}

	async function respondToAssistantQuery(query: string): Promise<string> {
		const trimmed = query.trim();
		if (!trimmed) {
			return "Ask me something about this schedule first.";
		}

		const addMatch = trimmed.match(/\badd\s+([a-z]{2,4}[\s-]?\d{3})\b/i);
		if (addMatch) {
			const normalizedTarget = normalizeCourseCode(addMatch[1]).replace(/\s+/, "-");
			const existing = editableCourses.find((course) => normalizeCourseCode(course.courseCode) === normalizedTarget);
			if (existing) {
				addCourseToSchedule(existing, true);
				return `${existing.courseCode} is already in your selections, so I promoted it onto the calendar if it was a backup.`;
			}

			const catalogSource = await loadCatalogCoursesForTerm();
			const match = catalogSource.find((course) => normalizeCourseCode(course.courseCode) === normalizedTarget);
			if (!match) {
				return `I couldn't find ${normalizedTarget} in the ${result?.term || "current"} catalog.`;
			}

			addCourseToSchedule(match, true);
			return `Added ${match.courseCode}: ${match.title} to your calendar.`;
		}

		const removeMatch = trimmed.match(/\bremove\s+([a-z]{2,4}[\s-]?\d{3})\b/i);
		if (removeMatch) {
			const normalizedTarget = normalizeCourseCode(removeMatch[1]).replace(/\s+/, "-");
			const existing = editableCourses.find((course) => normalizeCourseCode(course.courseCode) === normalizedTarget);
			if (!existing) {
				return `${normalizedTarget} is not currently in this schedule.`;
			}

			await removeCourseFromSchedule(existing);
			return `Removed ${existing.courseCode}: ${existing.title} from your selections.`;
		}

		const scheduleContext = [
			`You are AlfieAI helping a student with a generated schedule for ${result?.term || "the selected term"}.`,
			`Primary POEs: ${primaryPoeText || "Not specified"}.`,
			result?.secondaryEmphases.length ? `Secondary emphases: ${result.secondaryEmphases.join(", ")}.` : "Secondary emphases: none.",
			`Requested credit load: ${creditPreferenceText || "Not specified"}.`,
			"Current calendar courses:",
			...primaryCourses.map((course) => `- ${course.courseCode}: ${course.title} (${course.credits} credits) | ${course.section.meetings.join(" | ") || "TBA"}`),
			backupCourses.length ? "Backup courses:" : "Backup courses: none.",
			...backupCourses.map((course) => `- ${course.courseCode}: ${course.title} (${course.credits} credits)`),
			result?.reasoning ? `Planner reasoning: ${result.reasoning}` : "",
			result?.warnings.length ? `Warnings: ${result.warnings.join(" | ")}` : "Warnings: none.",
			"Answer the student's question directly in concise markdown with short paragraphs or bullets.",
			"Do not greet the user, do not say hello, do not reintroduce yourself, and do not add a conversational preamble.",
			"Do not use tables or code fences. If a specific course code is relevant, mention it.",
			`Student question: ${trimmed}`,
		].filter(Boolean).join("\n");

		const response = await fetch("/api/query", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query: scheduleContext }),
		});

		if (!response.ok) {
			throw new Error("AlfieAI couldn't respond right now.");
		}

		const text = (await response.text()).trim();
		return text || "I couldn't generate a response just now, but you can ask me to add or remove a course by code.";
	}

	async function handleAssistantSubmit(value: string): Promise<void> {
		const trimmed = value.trim();
		if (!trimmed || assistantLoading) {
			return;
		}

		setAssistantOpen(true);
		setAssistantMessages((previous) => [...previous, { id: `user-${Date.now()}`, role: "user", content: trimmed }]);
		setAssistantLoading(true);

		try {
			const reply = await respondToAssistantQuery(trimmed);
			setAssistantMessages((previous) => [...previous, { id: `assistant-${Date.now()}`, role: "assistant", content: reply }]);
		}
		catch (assistantError) {
			setAssistantMessages((previous) => [...previous, {
				id: `assistant-error-${Date.now()}`,
				role: "assistant",
				content: (assistantError as Error).message || "AlfieAI couldn't respond right now.",
			}]);
		}
		finally {
			setAssistantLoading(false);
		}
	}

	function submitAssistantDraft(): void {
		const trimmed = assistantDraft.trim();
		if (!trimmed || assistantLoading) {
			return;
		}

		setAssistantDraft("");
		void handleAssistantSubmit(trimmed);
	}

	return (
		<div
			style={{ transition: "max-width 600ms cubic-bezier(0.4,0,0.2,1)" }}
			className={`w-full ${loading? "max-w-7xl" : "max-w-[90vw]"} mx-auto ${loading ? "" : "lg:h-[calc(85dvh-2rem)]"}`}
		>
			{loading ? (
				<LoadingCalendarShell onBack={onBack} />
			) : !result ? (
				<div className="rounded-3xl border border-danger-200 bg-danger-50/80 p-8 shadow-sm dark:border-danger-500/30 dark:bg-danger-500/10">
					<Button startContent={<FiArrowLeft size={16} />} variant="light" onPress={onBack}>Back to planner</Button>
					<h2 className="mt-6 text-2xl font-semibold text-danger-700 dark:text-danger-300">Schedule generation did not finish</h2>
					<p className="mt-3 text-danger-700 dark:text-danger-200">{error || "Something went wrong while generating the schedule."}</p>
				</div>
			) : (
			<>
			<div className="schedule-results-reveal rounded-3xl border border-default-200 bg-content1/85 p-4 shadow-sm dark:border-default-600 dark:bg-zinc-900/80 sm:p-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
				<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
					<div>
						<Button startContent={<FiArrowLeft size={16} />} variant="light" onPress={onBack}>Back to planner</Button>
						<p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-purple-500 dark:text-purple-300">Generated Schedule</p>
						<h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{result.term}</h2>
						<p className="mt-1.5 text-sm text-default-600 dark:text-default-500">
							POE{primaryPoeValues.length === 1 ? "" : "s"}: {primaryPoeText}
							{result.secondaryEmphases.length > 0 ? ` • Secondary emphases: ${result.secondaryEmphases.join(", ")}` : ""}
							{creditPreferenceText ? ` • Credit load: ${creditPreferenceText}` : ""}
						</p>
						<div className="mt-3 flex flex-wrap gap-2 text-sm">
							{scheduleSummaryChips.map((chip) => (
								<span
									className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium shadow-sm ${chip.className}`}
									key={chip.label}
								>
									<span className="text-[11px] uppercase tracking-[0.18em] opacity-80">{chip.label}</span>
									<span className="text-sm font-semibold">{chip.value}</span>
								</span>
							))}
						</div>
					</div>
					<div className="hidden xl:block" />
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					<Button variant={activeTab === "schedule" ? "solid" : "flat"} color="secondary" onPress={() => setActiveTab("schedule")}>Schedule View</Button>
					<Button variant={activeTab === "requirements" ? "solid" : "flat"} color="secondary" onPress={() => setActiveTab("requirements")}>Requirements Progress</Button>
					<Button variant={activeTab === "notes" ? "solid" : "flat"} color="secondary" onPress={() => setActiveTab("notes")}>AlfieAI Notes</Button>
					<Button
						variant={assistantOpen ? "solid" : "flat"}
						color="secondary"
						startContent={<FiMessageCircle size={14} />}
						onPress={() => setAssistantOpen((previous) => !previous)}
					>
						AlfieAI Chat
					</Button>
				</div>

				<div className="mt-5 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
				{activeTab === "schedule" && (
					<div className="grid grid-cols-1 items-stretch gap-5 2xl:grid-cols-[360px_minmax(0,1fr)] lg:h-full lg:min-h-0 lg:overflow-hidden">
						<section className="flex min-h-0 min-w-0 flex-col rounded-3xl border border-default-200 bg-content1/80 p-4 dark:border-default-700 dark:bg-zinc-950/70 sm:p-5">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-default-600 dark:text-default-500">Courses</p>
									<h3 className="mt-1 text-xl font-semibold text-foreground">Your courses</h3>
								</div>
								
								<Button
									color="secondary"
									variant="flat"
									startContent={<FiSearch className="shrink-0" size={14} />}
									onPress={() => void openCatalogModal()}
								>
									Browse catalog
								</Button>
							</div>

							<div className="mt-4 space-y-4 pr-1 2xl:pr-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
								{result.detectedPreRegisteredCourses && result.detectedPreRegisteredCourses.length > 0 && (
									<div className="flex items-start gap-2.5 rounded-2xl border border-success-300/50 bg-success-50/80 px-4 py-3 dark:border-success-500/20 dark:bg-success-500/8">
										<FiUser className="mt-0.5 shrink-0 text-success-600 dark:text-success-400" size={14} />
										<p className="text-xs text-success-700 dark:text-success-400">
											<span className="font-semibold">Detected from your transcript: </span>
											{result.detectedPreRegisteredCourses.join(", ")} — already registered for {result.term}. Locked in as User&apos;s Choice.
										</p>
									</div>
								)}
								{primaryCourses.map((course) => {
									const isUserChoice = course.selectionSource === "user";
									const isAlfieChoice = course.selectionSource === "alfie" || (!course.selectionSource && originalPrimaryCourseKeys.has(getCourseInstanceKey(course)));

									return (
									<div
										className={`rounded-2xl border px-4 py-3 shadow-sm ${
											isUserChoice
												? "border-success-300/45 bg-success-50/75 dark:border-success-500/20 dark:bg-success-500/8"
												: isAlfieChoice
													? "border-secondary-300/45 bg-secondary-50/75 dark:border-secondary-500/20 dark:bg-secondary-500/8"
													: "border-default-300 bg-default-50/70 dark:border-default-700 dark:bg-zinc-900/70"
										}`}
										key={getCourseInstanceKey(course)}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<p className="text-sm font-semibold text-foreground">{course.courseCode}: {course.title}</p>
													{isUserChoice ? (
														<span className="inline-flex items-center gap-1 rounded-full border border-success-300/70 bg-success-100/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-success-700 dark:border-success-400/35 dark:bg-success-500/12 dark:text-success-400">
															<FiUser size={11} />
															User's choice
														</span>
													) : isAlfieChoice ? (
														<span className="inline-flex items-center gap-1 rounded-full border border-secondary-300/70 bg-secondary-100/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary-600 dark:border-secondary-400/35 dark:bg-secondary-500/12 dark:text-secondary-500">
															<LuSparkles size={11} />
															Alfie's choice
														</span>
													) : null}
												</div>
												<p className="mt-1 text-xs text-default-600 dark:text-default-500">Section {course.section.sectionName} • {course.credits} credits</p>
												<p className="mt-1 text-xs text-default-600 dark:text-default-500">{course.section.meetings[0] || course.section.meetings.join(" | ") || "TBA"}</p>
											</div>
											<div className="flex flex-col gap-2">
												<Button size="sm" variant="flat" onPress={() => setSelectedCourse(course)}>Details</Button>
												{!isUserChoice && (
													<Button size="sm" color="danger" variant="flat" startContent={<FiTrash2 size={13} />} onPress={() => void removeCourseFromSchedule(course)}>Remove</Button>
												)}
											</div>
										</div>
									</div>
									);
								})}

								{backupCourses.length > 0 && (
									<div className="pt-2">
										<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-default-500 dark:text-default-600">Backup pool</p>
										<div className="space-y-3">
											{backupCourses.map((course) => (
												<div className="rounded-2xl border border-dashed border-default-300 bg-default-50/70 px-4 py-3 dark:border-default-700 dark:bg-zinc-900/70" key={getCourseInstanceKey(course)}>
													<div className="flex items-start justify-between gap-2">
														<div className="min-w-0 flex-1">
															<p className="text-sm font-semibold text-foreground">{course.courseCode}: {course.title}</p>
															<p className="mt-1 text-xs text-default-600 dark:text-default-500">Section {course.section.sectionName} • {course.section.meetings[0] || "TBA"}</p>
														</div>
														<div className="flex flex-col gap-2">
															<Button size="sm" variant="flat" onPress={() => addCourseToSchedule(course, true)}>Promote</Button>
															<Button size="sm" color="danger" variant="flat" onPress={() => void removeCourseFromSchedule(course)}>Remove</Button>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</section>

						<section className="flex min-h-0 min-w-0 flex-col rounded-3xl border border-default-200 bg-content1/80 p-4 dark:border-default-700 dark:bg-zinc-950/70 sm:p-5">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-default-500 dark:text-zinc-400">Calendar</p>
									<h3 className="mt-1 text-xl font-semibold text-foreground">Current primary schedule</h3>
								</div>
								<p className="text-xs text-justify justify-end text-default-500 dark:text-zinc-400 max-w-sm">
									Optimal schedule based on user input, designed with generative AI. Please
									double-check all suggestions and consult your advisor before making any
									scheudling decisions.
								</p>
							</div>

							{calendarEvents.length === 0 ? (
								<div className="mt-5 rounded-2xl border border-dashed border-default-300 bg-default-50/60 px-5 py-5 text-sm text-default-500 dark:border-default-600 dark:bg-zinc-900/50 dark:text-default-600">
									No primary courses with timed meetings are currently on the schedule.
								</div>
							) : (
								<div className="mt-5 overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-auto">
									<div style={{ minWidth: "820px" }}>
										<div className="grid grid-cols-[84px_repeat(5,minmax(0,1fr))] border-b border-default-200 dark:border-white/10 pb-2">
											<div />
											{calendarDays.map((day) => (
												<div className="px-4 text-sm font-semibold tracking-wide text-default-700 dark:text-zinc-300" key={day.key}>{day.label}</div>
											))}
										</div>
										<div className="grid grid-cols-[84px_repeat(5,minmax(0,1fr))]">
											<div className="relative" style={{ height: `${calendarHeight}px` }}>
												{hourTicks.slice(0, -1).map((tick) => (
													<div className="absolute right-3 rounded-full border border-default-300 bg-content1 px-2 py-0.5 text-[11px] font-medium text-default-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-zinc-300" key={tick} style={{ top: `${((tick - calendarWindow.startMinutes) / 60) * HOUR_ROW_HEIGHT}px`, transform: "translateY(-50%)" }}>
														{formatHourLabel(tick)}
													</div>
												))}
											</div>
											{calendarDays.map((day) => (
												<div className="relative border-l border-default-200 dark:border-white/10" key={day.key} style={{ height: `${calendarHeight}px` }}>
													{hourTicks.map((tick) => (
														<div className="absolute inset-x-0 border-t border-default-200/70 dark:border-white/10" key={`${day.key}-${tick}`} style={{ top: `${((tick - calendarWindow.startMinutes) / 60) * HOUR_ROW_HEIGHT}px`, zIndex: 0 }} />
													))}
													{calendarEvents.filter((event) => event.day === day.key).map((event, eventIdx) => {
														const top = ((event.startMinutes - calendarWindow.startMinutes) / 60) * HOUR_ROW_HEIGHT;
														const height = Math.max(46, ((event.endMinutes - event.startMinutes) / 60) * HOUR_ROW_HEIGHT - 6);
														const durationMinutes = event.endMinutes - event.startMinutes;
														const showMeeting = durationMinutes >= 65;
														const isConflicting = conflictingCourseKeys.has(getCourseInstanceKey(event.course));
														const colorClass = isConflicting
															? "border-red-600/60 bg-red-600 shadow-red-900/40"
															: event.colorClassName;
														return (
															<div
																className={`group absolute inset-x-2 overflow-hidden rounded-2xl border shadow-lg transition hover:scale-[1.01] hover:shadow-xl ${colorClass}`}
																key={`${event.course.courseCode}-${event.course.section.sectionName}-${event.day}-${event.startMinutes}-${eventIdx}`}
																style={{ top: `${top + 3}px`, height: `${height}px`, zIndex: 1 }}
															>
																<button
																	className="absolute inset-0 px-3 py-1 text-left"
																	onClick={() => setSelectedCourse(event.course)}
																	type="button"
																>
																	<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{event.course.courseCode}</p>
																	<p className="mt-1 text-base font-semibold leading-tight text-white">{event.course.title}</p>
																	{showMeeting ? <p className="mt-1 text-[10px] leading-snug text-white/75">{event.course.section.meetings[0] || "TBA"}</p> : null}
																</button>
																<button
																	aria-label={`Remove ${event.course.courseCode} from calendar`}
																	className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition hover:bg-black/55 group-hover:opacity-100"
																	onClick={(e) => { e.stopPropagation(); removeCourseFromCalendar(event.course); }}
																	type="button"
																>
																	<FiX size={11} />
																</button>
															</div>
														);
													})}
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</section>
					</div>
				)}

				{activeTab === "requirements" && (
					<RequirementsProgressPanel
						progress={result.requirementsProgress}
					/>
				)}

				{activeTab === "notes" && (
					<NotesPanel
						reasoning={result.reasoning}
						notes={result.notes}
						warnings={result.warnings}
					/>
				)}
				</div>
			</div>

			{assistantOpen ? (
				<div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end">
					<div className="pointer-events-auto relative w-full max-w-xl overflow-hidden rounded-[1.9rem] border border-default-200 bg-content1/95 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl dark:border-secondary-900/45 dark:bg-zinc-950/92">
							<div className="relative flex items-center justify-between gap-3 border-b border-default-200/80 px-4 py-3 dark:border-default-800">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-600">AlfieAI Chat</p>
									<p className="mt-1 text-sm text-default-600 dark:text-default-400">Ask about this result set or add/remove courses by code.</p>
								</div>
								<Button isIconOnly radius="full" size="sm" variant="light" onPress={() => setAssistantOpen(false)}>
									<FiX size={16} />
								</Button>
							</div>

							<div className="relative border-b border-default-200/80 px-4 py-3 dark:border-default-800">
								<div className="flex flex-wrap gap-2">
									{ASSISTANT_QUICK_PROMPTS.map((prompt) => (
										<button
											className="rounded-full border border-secondary-300/45 bg-secondary-50/90 px-3 py-2 text-xs font-medium text-secondary-900 backdrop-blur-md transition-colors hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-700/40 dark:bg-secondary-950/55 dark:text-zinc-100"
											key={prompt}
											onClick={() => void handleAssistantSubmit(prompt)}
											disabled={assistantLoading}
											type="button"
										>
											{prompt}
										</button>
									))}
								</div>
							</div>

							<div ref={assistantScrollRef} className="relative max-h-[46vh] space-y-3 overflow-y-auto px-4 py-4">
								{assistantMessages.map((message) => {
									const isUser = message.role === "user";

									return (
										<div key={message.id} className="w-full">
											<Message
												role={isUser? "user" : "model"}
												color={modelBubble}
												showDivider={false}
												
											>
												{isUser ? (
													<p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary-950 dark:text-zinc-50">{message.content}</p>
												) : (
													<MarkdownRenderer content={message.content} />
												)}
											</Message>
										</div>
									);
								})}

								{assistantLoading ? (
									<div className="w-full">
										<Message role="model" color={modelBubble} showDivider={false} isLoading>
											<span />
										</Message>
									</div>
								) : null}
							</div>

							<div className="relative border-t border-default-200/80 px-3 py-3 dark:border-default-800">
								<form
									onSubmit={(event) => {
										event.preventDefault();
										submitAssistantDraft();
									}}
								>
									<div className="w-full min-h-11 rounded-[1.8rem] border border-default-300/70 bg-content1/88 px-4 py-2 shadow-lg backdrop-blur-md transition dark:bg-zinc-900/88">
										<textarea
											className="min-h-12 w-full resize-none bg-transparent py-1 text-[15px] leading-5 text-foreground outline-none placeholder:text-default-500"
											placeholder="Ask AlfieAI about this schedule..."
											value={assistantDraft}
											onChange={(event) => setAssistantDraft(event.target.value)}
											onKeyDown={(event) => {
												if (event.key === "Enter" && !event.shiftKey) {
													event.preventDefault();
													submitAssistantDraft();
												}
											}}
											disabled={assistantLoading}
										/>
										<div className="mt-2 flex items-center justify-between gap-3">
											<p className="text-xs text-default-500">Press Enter to send. Use Shift+Enter for a new line.</p>
											<Button
												isIconOnly
												radius="full"
												type="submit"
												isDisabled={assistantLoading || assistantDraft.trim().length === 0}
												className="h-8 w-8 min-w-8 bg-foreground text-background hover:bg-foreground/90 data-[disabled=true]:bg-default-300 data-[disabled=true]:text-default-500 dark:data-[disabled=true]:bg-default-700"
											>
												<FaArrowUp size={13} />
											</Button>
										</div>
									</div>
									<p className="px-1 pt-2 text-center text-xs italic text-default-500 dark:text-zinc-500">Generative AI is experimental and may make mistakes. Remember to check all information.</p>
								</form>
							</div>
					</div>
				</div>
			) : null}

			<Modal isOpen={catalogModalOpen} onOpenChange={setCatalogModalOpen} size="5xl" placement="center">
				<ModalContent className="bg-content1 text-foreground dark:bg-zinc-950/95 dark:text-zinc-100">
					{(closeCatalog) => (
						<>
							<ModalHeader className="flex flex-col gap-2">
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-default-500 dark:text-zinc-400">Course Catalog</p>
								<h3 className="text-2xl font-semibold text-foreground dark:text-zinc-100">Add courses directly to your schedule</h3>
							</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
									<Input
										label="Search catalog"
										labelPlacement="outside"
										placeholder="Search by course code, title, or keyword"
										startContent={<FiSearch size={14} />}
										value={catalogQuery}
										onValueChange={setCatalogQuery}
									/>
									<Switch isSelected={catalogFitOnly} onValueChange={setCatalogFitOnly} color="secondary" size="sm">
										<div className="text-left">
											<p className="font-medium text-foreground dark:text-zinc-100">Only show courses that fit open time slots</p>
											<p className="text-xs text-default-500 dark:text-zinc-400">Filters out courses that conflict with your current primary schedule.</p>
										</div>
									</Switch>
								</div>

								<div className="mt-2 max-h-[55vh] overflow-y-auto space-y-3 pr-1">
									{catalogLoading && <p className="text-sm text-default-600 dark:text-zinc-300">Loading term catalog...</p>}
									{catalogError && <p className="text-sm text-danger-600 dark:text-danger-300">{catalogError}</p>}
									{!catalogLoading && !catalogError && groupedCatalog.length === 0 && (
										<p className="text-sm text-default-500 dark:text-zinc-400">No catalog courses match the current filters.</p>
									)}
									{groupedCatalog.map((sections) => {
										const first = sections[0];
										const openSections = sections.filter((section) => section.section.openSeats > 0).length;
										return (
											<div key={normalizeCourseCode(first.courseCode)} className="rounded-xl border border-default-200 bg-default-50/40 p-4 sm:p-5 dark:border-default-700 dark:bg-zinc-900/55">
												<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
													<div>
														<p className="text-xs uppercase tracking-wider text-default-500 dark:text-zinc-400">{first.courseCode} · {first.credits} credits</p>
														<h4 className="mt-1 text-xl font-semibold leading-tight text-foreground dark:text-zinc-100">{first.title}</h4>
													</div>
													<div className="flex flex-wrap gap-2 text-xs">
														<span className="rounded-full bg-default-100 px-3 py-1 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">{sections.length} section{sections.length === 1 ? "" : "s"}</span>
														<span className="rounded-full bg-default-100 px-3 py-1 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">{openSections} open</span>
													</div>
												</div>
												{first.description ? <p className="mt-3 text-sm leading-relaxed text-default-700 dark:text-zinc-300">{first.description}</p> : null}
												<div className="mt-4 rounded-lg border border-default-200 bg-content1/60 p-4 dark:border-default-700 dark:bg-zinc-950/70">
													<p className="text-xs font-semibold uppercase tracking-wide text-default-500 dark:text-zinc-400">Available sections</p>
													<div className="mt-3 divide-y divide-default-200 dark:divide-default-800">
													{sections.map((section) => (
															<div key={section.section.sectionName} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
																<div>
																	<p className="text-sm font-semibold text-foreground dark:text-zinc-100">Section {section.section.sectionName}</p>
																	<p className="mt-1 text-xs text-default-500 dark:text-zinc-400">{section.section.meetings.join(" | ") || "TBA"}</p>
																	<p className="mt-1 text-xs text-default-500 dark:text-zinc-500">{section.section.instructors[0] || "TBA"} • {section.section.location || "TBA"}</p>
																</div>
																<div className="flex items-center gap-3 self-start sm:self-center">
																	<span className="rounded-full bg-default-100 px-3 py-1 text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">{section.section.openSeats} open</span>
																	<Button size="sm" color="secondary" variant="flat" onPress={() => addCourseToSchedule(section, true)}>Add</Button>
																</div>
														</div>
													))}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="flat" onPress={closeCatalog}>Close</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal isOpen={Boolean(selectedCourse)} onOpenChange={(isOpen) => {
				if (!isOpen) {
					setSelectedCourse(null);
				}
			}} placement="center" size="3xl">
				<ModalContent className="bg-content1 text-foreground dark:bg-zinc-950/95 dark:text-zinc-100">
					{(onClose) => (
						selectedCourse ? (
							<>
								<ModalHeader className="flex flex-col gap-2">
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-default-500 dark:text-zinc-400">Course details</p>
									<h3 className="text-2xl font-semibold text-foreground dark:text-zinc-100">{selectedCourse.courseCode}: {selectedCourse.title}</h3>
								</ModalHeader>
								<ModalBody>
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div className="rounded-2xl border border-default-200 bg-default-50/70 p-4 dark:border-default-700 dark:bg-zinc-900/70">
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500 dark:text-zinc-400">Section</p>
											<div className="mt-3 space-y-2 text-sm text-default-700 dark:text-zinc-300">
												<p><FiBookOpen className="mr-2 inline-block" size={14} />Section {selectedCourse.section.sectionName}</p>
												<p><FiClock className="mr-2 inline-block" size={14} />{selectedCourse.credits} credits</p>
												<p><FiMapPin className="mr-2 inline-block" size={14} />{selectedCourse.section.location || "TBA"}</p>
												<p><FiUser className="mr-2 inline-block" size={14} />{selectedCourse.section.instructors.join(", ") || "TBA"}</p>
											</div>
										</div>
										<div className="rounded-2xl border border-default-200 bg-default-50/70 p-4 dark:border-default-700 dark:bg-zinc-900/70">
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500 dark:text-zinc-400">Availability</p>
											<div className="mt-3 space-y-2 text-sm text-default-700 dark:text-zinc-300">
												<p>{selectedCourse.section.openSeats} open / {selectedCourse.section.capacity} seats</p>
												<p>{selectedCourse.section.waitlisted} waitlisted</p>
												<p>Status: {selectedCourse.section.status}</p>
											</div>
										</div>
									</div>
									<div className="mt-4 rounded-2xl border border-default-200 bg-default-50/70 p-4 dark:border-default-700 dark:bg-zinc-900/70">
										<p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500 dark:text-zinc-400">Meetings</p>
										<div className="mt-3 space-y-2 text-sm text-default-700 dark:text-zinc-300">
											{selectedCourse.section.meetings.length > 0 ? selectedCourse.section.meetings.map((meeting) => (
												<p key={meeting}>{meeting}</p>
											)) : <p>TBA</p>}
										</div>
									</div>
									<div className="mt-4 rounded-2xl border border-default-200 bg-default-50/70 p-4 dark:border-default-700 dark:bg-zinc-900/70">
										<p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500 dark:text-zinc-400">Course context</p>
										<p className="mt-2 text-sm leading-relaxed text-default-700 dark:text-zinc-300">{selectedCourse.description || "No description provided."}</p>
										<div className="mt-3 flex flex-wrap gap-2">
											{selectedCourse.categories.map((category) => (
												<span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-medium text-secondary-600 dark:bg-secondary-500/15 dark:text-secondary-500" key={category}>{category}</span>
											))}
										</div>
									</div>
								</ModalBody>
								<ModalFooter>
									<Button variant="flat" onPress={onClose}>Close</Button>
								</ModalFooter>
							</>
						) : null
					)}
				</ModalContent>
			</Modal>
			</>
		)}
		</div>
	);
}
