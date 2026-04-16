import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { Course } from "@/lib/models/course";
import type {
	CreditLoadProfile,
	ScheduleCreditPreference,
	ScheduleCourseResult,
	ScheduleGenerationResult,
	ScheduleMeetingBlock,
	ScheduleModelCourseSelection,
	ScheduleRequirementsProgress,
	ScheduleSectionSummary,
	WeekdayCode,
} from "@/lib/schedule-ai";
import { extractTranscriptTextFromPdf } from "@/lib/transcript-parser";

export const maxDuration = 60;

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const transcriptParseTimeoutMs = Number(process.env.TRANSCRIPT_PARSE_TIMEOUT_MS || 25000);
const maxDegreeProgressPdfBytes = Number(process.env.MAX_DEGREE_PROGRESS_PDF_BYTES || 8 * 1024 * 1024);

const candidateModelIDs = ["gemini-3-flash-preview"];

const courseProjection = {
	_id: 1,
	course_code: 1,
	title: 1,
	description: 1,
	course_types: 1,
	credits: 1,
	requisites: 1,
	sections: 1,
} as const;

interface TranscriptEvidence {
	transcriptDetected: boolean;
	completedCourseCodes: string[];
	plannedCourseCodes: string[];
	transferCourseCodes: string[];
	excludedCourseCodes: string[];
	requirementMentions: string[];
	completedRequirementMentions: string[];
	transferMentions: string[];
	completedByTerm: Array<{
		term: string;
		count: number;
	}>;
}

interface ParsedTranscriptRecords {
	completed: Array<{
		term: string;
		courseCode: string;
		title: string;
		credits: string;
		grade: string;
	}>;
	planned: Array<{
		term: string;
		courseCode: string;
		title: string;
	}>;
	transfer: Array<{
		term: string;
		courseCode: string;
		title: string;
		credits: string;
	}>;
	requirements: Array<{
		label: string;
		status: "completed" | "pending" | "in-progress" | "unknown";
	}>;
}

interface ModelScheduleOutput {
	results: {
		courses: ScheduleModelCourseSelection[];
		reasoning: string;
	};
}

const CREDIT_LOAD_LABELS: Record<CreditLoadProfile, string> = {
	"part-time": "Part-time (<12 credits)",
	light: "Light (12-13 credits)",
	moderate: "Moderate (14-17 credits)",
	heavy: "Heavy (18+ credits)",
	custom: "Custom",
};

function parseOptionalNumber(value: string): number | null {
	if (!value.trim()) {
		return null;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		return null;
	}

	return parsed;
}

function clampCredits(value: number): number {
	return Math.min(24, Math.max(1, Math.round(value)));
}

function resolveCreditPreference(formData: FormData): ScheduleCreditPreference {
	const rawProfile = getString(formData, "creditLoadProfile").toLowerCase();
	const profile: CreditLoadProfile = rawProfile === "part-time"
		|| rawProfile === "light"
		|| rawProfile === "moderate"
		|| rawProfile === "heavy"
		|| rawProfile === "custom"
		? rawProfile
		: "moderate";

	if (profile === "part-time") {
		return {
			profile,
			label: CREDIT_LOAD_LABELS[profile],
			minCredits: 1,
			maxCredits: 11,
			targetCredits: 10,
		};
	}

	if (profile === "light") {
		return {
			profile,
			label: CREDIT_LOAD_LABELS[profile],
			minCredits: 12,
			maxCredits: 13,
			targetCredits: 12,
		};
	}

	if (profile === "heavy") {
		return {
			profile,
			label: CREDIT_LOAD_LABELS[profile],
			minCredits: 18,
			maxCredits: null,
			targetCredits: 18,
		};
	}

	if (profile === "custom") {
		const requested = parseOptionalNumber(getString(formData, "targetCredits"));
		const customTarget = clampCredits(requested ?? 15);
		return {
			profile,
			label: `${CREDIT_LOAD_LABELS[profile]} (${customTarget} credits)`,
			minCredits: customTarget,
			maxCredits: customTarget,
			targetCredits: customTarget,
		};
	}

	return {
		profile: "moderate",
		label: CREDIT_LOAD_LABELS.moderate,
		minCredits: 14,
		maxCredits: 17,
		targetCredits: 15,
	};
}

function getPrimaryCredits(courses: ScheduleCourseResult[]): number {
	return courses
		.filter((course) => course.primary)
		.reduce((sum, course) => sum + Number(course.credits || 0), 0);
}

function getRangeDistance(total: number, minCredits: number, maxCredits: number): number {
	if (total < minCredits) {
		return minCredits - total;
	}
	if (total > maxCredits) {
		return total - maxCredits;
	}
	return 0;
}

function greedyAdjustCreditPreference(
	allSelectedCourses: ScheduleCourseResult[],
	creditPreference: ScheduleCreditPreference,
): string[] {
	const notes: string[] = [];
	const minCredits = creditPreference.minCredits ?? 0;
	const maxCredits = creditPreference.maxCredits ?? Number.POSITIVE_INFINITY;
	const targetCredits = creditPreference.targetCredits ?? minCredits;

	const refreshLists = () => ({
		primary: allSelectedCourses.filter((course) => course.primary),
		backup: allSelectedCourses.filter((course) => !course.primary),
	});

	let { primary } = refreshLists();
	let totalCredits = getPrimaryCredits(allSelectedCourses);

	while (totalCredits > maxCredits && primary.length > 1) {
		const sortedPrimary = [...primary].sort((left, right) => Number(right.credits || 0) - Number(left.credits || 0));
		const demotionCandidate = sortedPrimary.find((course) => {
			const nextCredits = totalCredits - Number(course.credits || 0);
			return nextCredits >= minCredits || primary.length > 1;
		});

		if (!demotionCandidate) {
			break;
		}

		demotionCandidate.primary = false;
		notes.push(`${demotionCandidate.courseCode} moved to backup to respect your requested credit load.`);
		({ primary } = refreshLists());
		totalCredits = getPrimaryCredits(allSelectedCourses);
	}

	while (totalCredits < minCredits) {
		const { backup } = refreshLists();
		const viableBackups = backup.filter((candidate) => !primary.some((course) => scheduleCoursesMeetingConflict(course, candidate)));
		if (viableBackups.length === 0) {
			break;
		}

		const scored = [...viableBackups].sort((left, right) => {
			const leftDistance = Math.abs((totalCredits + Number(left.credits || 0)) - targetCredits);
			const rightDistance = Math.abs((totalCredits + Number(right.credits || 0)) - targetCredits);
			if (leftDistance !== rightDistance) {
				return leftDistance - rightDistance;
			}

			const seatDiff = Number(right.section.openSeats || 0) - Number(left.section.openSeats || 0);
			if (seatDiff !== 0) {
				return seatDiff;
			}

			return normalizeCourseCode(left.courseCode).localeCompare(normalizeCourseCode(right.courseCode));
		});

		const promotionCandidate = scored[0];
		promotionCandidate.primary = true;
		notes.push(`${promotionCandidate.courseCode} promoted from backup to better match your requested credit load.`);
		({ primary } = refreshLists());
		totalCredits = getPrimaryCredits(allSelectedCourses);
	}

	if (totalCredits < minCredits) {
		notes.push(`Primary schedule reached ${totalCredits} credits, below your requested minimum of ${minCredits}.`);
	}
	if (totalCredits > maxCredits) {
		notes.push(`Primary schedule remained at ${totalCredits} credits, above your requested maximum of ${maxCredits}.`);
	}

	return notes;
}

function applyCreditPreferenceToSelection(
	allSelectedCourses: ScheduleCourseResult[],
	creditPreference: ScheduleCreditPreference,
): string[] {
	if (allSelectedCourses.length === 0) {
		return [];
	}

	// Safety valve: for very large candidate sets, keep the previous greedy behavior.
	if (allSelectedCourses.length > 18) {
		return greedyAdjustCreditPreference(allSelectedCourses, creditPreference);
	}

	const notes: string[] = [];
	const minCredits = creditPreference.minCredits ?? 0;
	const maxCredits = creditPreference.maxCredits ?? Number.POSITIVE_INFINITY;
	const initialPrimaryKeys = new Set(
		allSelectedCourses
			.filter((course) => course.primary)
			.map((course) => `${normalizeCourseCode(course.courseCode)}::${course.section.sectionName}`)
	);
	const originalTotalCredits = getPrimaryCredits(allSelectedCourses);
	const targetCredits = creditPreference.targetCredits ?? (
		Number.isFinite(minCredits) && Number.isFinite(maxCredits)
			? (minCredits + maxCredits) / 2
			: Number.isFinite(minCredits)
				? minCredits
				: Number.isFinite(maxCredits)
					? maxCredits
					: originalTotalCredits
	);

	const courseCount = allSelectedCourses.length;
	const conflictMatrix: boolean[][] = Array.from({ length: courseCount }, () => Array(courseCount).fill(false));
	for (let i = 0; i < courseCount; i += 1) {
		for (let j = i + 1; j < courseCount; j += 1) {
			const conflicts = scheduleCoursesMeetingConflict(allSelectedCourses[i], allSelectedCourses[j]);
			conflictMatrix[i][j] = conflicts;
			conflictMatrix[j][i] = conflicts;
		}
	}

	type CandidateState = {
		indices: number[];
		totalCredits: number;
		targetDistance: number;
		rangeDistance: number;
		preservedPrimaryCount: number;
		openSeatTotal: number;
		courseCount: number;
	};

	const compareCandidates = (left: CandidateState, right: CandidateState): number => {
		if (left.rangeDistance !== right.rangeDistance) {
			return left.rangeDistance < right.rangeDistance ? 1 : -1;
		}
		if (left.targetDistance !== right.targetDistance) {
			return left.targetDistance < right.targetDistance ? 1 : -1;
		}
		if (left.preservedPrimaryCount !== right.preservedPrimaryCount) {
			return left.preservedPrimaryCount > right.preservedPrimaryCount ? 1 : -1;
		}
		if (left.openSeatTotal !== right.openSeatTotal) {
			return left.openSeatTotal > right.openSeatTotal ? 1 : -1;
		}
		if (left.courseCount !== right.courseCount) {
			return left.courseCount > right.courseCount ? 1 : -1;
		}
		return 0;
	};

	let bestInRange: CandidateState | null = null;
	let bestOutOfRange: CandidateState | null = null;

	const chosen: number[] = [];

	const evaluateCurrent = (totalCreditsValue: number, preservedPrimaryCount: number, openSeatTotal: number): void => {
		if (chosen.length === 0) {
			return;
		}

		const rangeDistance = getRangeDistance(totalCreditsValue, minCredits, maxCredits);
		const candidate: CandidateState = {
			indices: [...chosen],
			totalCredits: totalCreditsValue,
			targetDistance: Math.abs(totalCreditsValue - targetCredits),
			rangeDistance,
			preservedPrimaryCount,
			openSeatTotal,
			courseCount: chosen.length,
		};

		if (rangeDistance === 0) {
			if (!bestInRange || compareCandidates(candidate, bestInRange) > 0) {
				bestInRange = candidate;
			}
			return;
		}

		if (!bestOutOfRange || compareCandidates(candidate, bestOutOfRange) > 0) {
			bestOutOfRange = candidate;
		}
	};

	const search = (index: number, totalCreditsValue: number, preservedPrimaryCount: number, openSeatTotal: number): void => {
		evaluateCurrent(totalCreditsValue, preservedPrimaryCount, openSeatTotal);

		if (index >= courseCount) {
			return;
		}

		search(index + 1, totalCreditsValue, preservedPrimaryCount, openSeatTotal);

		const conflicts = chosen.some((selectedIndex) => conflictMatrix[index][selectedIndex]);
		if (conflicts) {
			return;
		}

		const course = allSelectedCourses[index];
		const key = `${normalizeCourseCode(course.courseCode)}::${course.section.sectionName}`;
		chosen.push(index);
		search(
			index + 1,
			totalCreditsValue + Number(course.credits || 0),
			preservedPrimaryCount + (initialPrimaryKeys.has(key) ? 1 : 0),
			openSeatTotal + Number(course.section.openSeats || 0),
		);
		chosen.pop();
	};

	search(0, 0, 0, 0);

	let bestCandidate: CandidateState;
	if (bestInRange) {
		bestCandidate = bestInRange;
	} else if (bestOutOfRange) {
		bestCandidate = bestOutOfRange;
	} else {
		return notes;
	}

	const selectedIndices = new Set(bestCandidate.indices);
	for (let index = 0; index < allSelectedCourses.length; index += 1) {
		allSelectedCourses[index].primary = selectedIndices.has(index);
	}

	const currentPrimaryKeys = new Set(
		allSelectedCourses
			.filter((course) => course.primary)
			.map((course) => `${normalizeCourseCode(course.courseCode)}::${course.section.sectionName}`)
	);
	const promoted = allSelectedCourses
		.filter((course) => {
			const key = `${normalizeCourseCode(course.courseCode)}::${course.section.sectionName}`;
			return currentPrimaryKeys.has(key) && !initialPrimaryKeys.has(key);
		})
		.map((course) => course.courseCode);
	const demoted = allSelectedCourses
		.filter((course) => {
			const key = `${normalizeCourseCode(course.courseCode)}::${course.section.sectionName}`;
			return initialPrimaryKeys.has(key) && !currentPrimaryKeys.has(key);
		})
		.map((course) => course.courseCode);

	if (promoted.length > 0 || demoted.length > 0) {
		notes.push(
			`Credit optimization adjusted primary placements to better match your requested load (${originalTotalCredits} -> ${bestCandidate.totalCredits} credits).`
		);
	}
	if (promoted.length > 0) {
		notes.push(`${Array.from(new Set(promoted)).join(", ")} promoted from backup to improve credit fit.`);
	}
	if (demoted.length > 0) {
		notes.push(`${Array.from(new Set(demoted)).join(", ")} moved to backup to improve credit fit.`);
	}

	if (bestCandidate.totalCredits < minCredits) {
		notes.push(`Primary schedule reached ${bestCandidate.totalCredits} credits, below your requested minimum of ${minCredits}.`);
	}
	if (bestCandidate.totalCredits > maxCredits) {
		notes.push(`Primary schedule remained at ${bestCandidate.totalCredits} credits, above your requested maximum of ${maxCredits}.`);
	}

	return notes;
}

interface ProfessorNameRecord {
	firstName?: string;
	lastName?: string;
}

const INSTRUCTOR_LOOKUP_TTL_MS = 5 * 60 * 1000;
let instructorLookupCache: {
	expiresAt: number;
	value: Map<string, string>;
} | null = null;

function getString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
}

function parseJsonStringArray(value: string): string[] {
	if (!value.trim()) {
		return [];
	}

	try {
		const parsed = JSON.parse(value) as unknown;
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.map((item) => (typeof item === "string" ? item.trim() : ""))
			.filter(Boolean);
	}
	catch {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}
}

function normalizeCourseCode(code: string): string {
	const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
	const match = normalized.match(/^([A-Z]{2,4})-?(\d{3})([A-Z]{0,3})$/);
	if (!match) {
		return normalized;
	}

	const prefix = match[1];
	const number = match[2];
	const suffix = match[3] || "";
	return `${prefix}-${number}${suffix}`;
}

function toBaseCourseCode(code: string): string {
	const normalized = normalizeCourseCode(code);
	const match = normalized.match(/^([A-Z]{2,4})-(\d{3})[A-Z]{1,3}$/);
	if (!match) {
		return normalized;
	}

	return `${match[1]}-${match[2]}`;
}

function getCourseCodeAliases(code: string): string[] {
	const normalized = normalizeCourseCode(code);
	const base = toBaseCourseCode(normalized);
	return Array.from(new Set([normalized, base].filter(Boolean)));
}

function normalizeWhitespace(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

function normalizeRequirementStatus(value: string): "completed" | "pending" | "in-progress" | "unknown" {
	const normalized = normalizeWhitespace(value).toLowerCase();
	if (!normalized) {
		return "unknown";
	}

	if (/(?:complete(?:d)?|fulfilled|satisfied|met|waived|[✓✔☑])/.test(normalized)) {
		return "completed";
	}
	if (/(?:in[-\s]?progress|ip\b)/.test(normalized)) {
		return "in-progress";
	}
	if (/(?:pending|remaining|incomplete|not\s+met)/.test(normalized)) {
		return "pending";
	}

	return "unknown";
}

function normalizeNameToken(value: string): string {
	return normalizeWhitespace(value)
		.toLowerCase()
		.replace(/[^a-z\s]/g, "")
		.trim();
}

function buildInstructorLookup(professors: ProfessorNameRecord[]): Map<string, string> {
	const lookup = new Map<string, string>();

	for (const professor of professors) {
		const firstRaw = normalizeWhitespace(String(professor.firstName || ""));
		const lastRaw = normalizeWhitespace(String(professor.lastName || ""));
		if (!firstRaw || !lastRaw) {
			continue;
		}

		const firstToken = normalizeNameToken(firstRaw).split(" ")[0] || "";
		const lastToken = normalizeNameToken(lastRaw).split(" ")[0] || "";
		if (!firstToken || !lastToken) {
			continue;
		}

		const fullName = `${firstRaw} ${lastRaw}`;
		lookup.set(`${firstToken} ${lastToken}`, fullName);

		const initial = firstToken.charAt(0);
		if (initial) {
			lookup.set(`${initial} ${lastToken}`, fullName);
		}
	}

	return lookup;
}

function instructorLookupKey(value: string): string {
	const stripped = normalizeWhitespace(value)
		.replace(/^(dr\.?|prof\.?|professor)\s+/i, "")
		.replace(/[^a-zA-Z\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();

	if (!stripped) {
		return "";
	}

	const parts = stripped.split(" ").filter(Boolean);
	if (parts.length < 2) {
		return "";
	}

	const first = parts[0];
	const last = parts[parts.length - 1];
	if (!first || !last) {
		return "";
	}

	return `${first} ${last}`;
}

async function getInstructorLookup(professorsCollection: ReturnType<typeof import("mongodb").Db.prototype.collection<ProfessorNameRecord>>) {
	const now = Date.now();

	if (instructorLookupCache && instructorLookupCache.expiresAt > now) {
		return instructorLookupCache.value;
	}

	const professorNameDocs = await professorsCollection
		.find({}, { projection: { _id: 0, firstName: 1, lastName: 1 } })
		.toArray();

	const lookup = buildInstructorLookup(professorNameDocs);
	instructorLookupCache = {
		expiresAt: now + INSTRUCTOR_LOOKUP_TTL_MS,
		value: lookup,
	};

	return lookup;
}

function resolveCourseInstructorNames(courses: Course[], instructorLookup: Map<string, string>): Course[] {
	return courses.map((course) => ({
		...course,
		sections: (course.sections || []).map((section) => ({
			...section,
			instructors: (section.instructors || []).map((instructor) => {
				const rawName = String(instructor.name || "");
				const key = instructorLookupKey(rawName);
				const resolvedName = key ? instructorLookup.get(key) : undefined;

				if (!resolvedName) {
					return instructor;
				}

				return {
					...instructor,
					name: resolvedName,
				};
			}),
		})),
	}));
}

function isMissingModelError(error: unknown): boolean {
	return error instanceof Error && /models\/.+(not found|not supported)/i.test(error.message);
}

function isRetryableModelError(error: unknown): boolean {
	return error instanceof Error && /(UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|quota|429|503)/i.test(error.message);
}

function parseTimeToMinutes(rawTime: string): number | null {
	const text = (rawTime || "").trim();
	if (!text) {
		return null;
	}

	if (/^noon$/i.test(text)) {
		return 12 * 60;
	}

	if (/^midnight$/i.test(text)) {
		return 0;
	}

	const meridianMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)$/i);
	if (meridianMatch) {
		let hours = Number(meridianMatch[1]);
		const minutes = Number(meridianMatch[2]);
		const suffix = meridianMatch[3].toUpperCase();

		if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) {
			return null;
		}

		if (suffix === "PM" && hours !== 12) {
			hours += 12;
		}
		if (suffix === "AM" && hours === 12) {
			hours = 0;
		}

		return hours * 60 + minutes;
	}

	const twentyFourHourMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
	if (twentyFourHourMatch) {
		const hours = Number(twentyFourHourMatch[1]);
		const minutes = Number(twentyFourHourMatch[2]);
		if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
			return null;
		}

		return hours * 60 + minutes;
	}

	return null;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutLabel: string): Promise<T> {
	let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutHandle = setTimeout(() => {
			reject(new Error(`${timeoutLabel} timed out after ${timeoutMs}ms`));
		}, timeoutMs);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	}
	finally {
		if (timeoutHandle) {
			clearTimeout(timeoutHandle);
		}
	}
}

function trimForPrompt(value: string | undefined, maxChars = 320): string {
	const text = (value || "").trim();
	if (!text) {
		return "";
	}

	if (text.length <= maxChars) {
		return text;
	}

	return `${text.slice(0, maxChars)}...`;
}

function normalizeWeekday(rawValue: string): WeekdayCode | null {
	const value = rawValue.trim().toUpperCase();
	if (!value) {
		return null;
	}

	if (value === "M" || value === "MON" || value === "MONDAY") {
		return "M";
	}
	if (value === "T" || value === "TU" || value === "TUE" || value === "TUES" || value === "TUESDAY") {
		return "T";
	}
	if (value === "W" || value === "WED" || value === "WEDNESDAY") {
		return "W";
	}
	if (value === "TH" || value === "THU" || value === "THUR" || value === "THURS" || value === "THURSDAY" || value === "R") {
		return "Th";
	}
	if (value === "F" || value === "FRI" || value === "FRIDAY") {
		return "F";
	}

	return null;
}

function parseWeekdayToken(rawValue: string): WeekdayCode[] {
	const value = rawValue.trim();
	if (!value) {
		return [];
	}

	const direct = normalizeWeekday(value);
	if (direct) {
		return [direct];
	}

	const compact = value.toUpperCase().replace(/[^A-Z]/g, "");
	if (!compact) {
		return [];
	}

	const parsed = new Set<WeekdayCode>();
	let working = compact;

	if (working.includes("TH")) {
		parsed.add("Th");
		working = working.replace(/TH/g, "");
	}

	if (working.includes("R")) {
		parsed.add("Th");
		working = working.replace(/R/g, "");
	}

	for (const char of working) {
		if (char === "M") {
			parsed.add("M");
		}
		if (char === "T") {
			parsed.add("T");
		}
		if (char === "W") {
			parsed.add("W");
		}
		if (char === "F") {
			parsed.add("F");
		}
	}

	return Array.from(parsed);
}

function getMeetingDays(meeting: { days?: string[] }): WeekdayCode[] {
	const source = Array.isArray(meeting.days) ? meeting.days : [];
	const parsed = source.flatMap((day) => parseWeekdayToken(day));
	return Array.from(new Set(parsed));
}

function formatMeeting(meeting: { days?: string[]; start_time?: string; end_time?: string; classroom?: string }): string {
	const dayText = getMeetingDays(meeting).join("/") || "TBA";
	const startTime = (meeting.start_time || "").trim() || "TBA";
	const endTime = (meeting.end_time || "").trim() || "TBA";
	const location = (meeting.classroom || "").trim();
	const locationText = location ? ` • ${location}` : "";
	return `${dayText} ${startTime}-${endTime}${locationText}`;
}

function normalizeSelection(courses: ScheduleModelCourseSelection[]): ScheduleModelCourseSelection[] {
	const merged = new Map<string, ScheduleModelCourseSelection>();

	for (const item of courses) {
		const normalizedCode = normalizeCourseCode(item.course_code || "");
		if (!normalizedCode) {
			continue;
		}

		const existing = merged.get(normalizedCode);
		if (existing) {
			existing.primary = existing.primary || Boolean(item.primary);
			continue;
		}

		merged.set(normalizedCode, {
			course_code: normalizedCode,
			primary: Boolean(item.primary),
		});
	}

	return Array.from(merged.values());
}

function parseStructuredTranscriptRecords(transcriptText: string): ParsedTranscriptRecords {
	const parsed: ParsedTranscriptRecords = {
		completed: [],
		planned: [],
		transfer: [],
		requirements: [],
	};

	for (const line of transcriptText.split(/\r?\n+/)) {
		const parts = line.split("|").map((part) => part.trim());
		const kind = (parts[0] || "").toUpperCase();

		if (kind === "COMPLETED") {
			parsed.completed.push({
				term: parts[1] || "Unknown Term",
				courseCode: normalizeCourseCode(parts[2] || ""),
				title: parts[3] || "",
				credits: parts[4] || "",
				grade: parts[5] || "",
			});
			continue;
		}

		if (kind === "PLANNED") {
			parsed.planned.push({
				term: parts[1] || "Unknown Term",
				courseCode: normalizeCourseCode(parts[2] || ""),
				title: parts[3] || "",
			});
			continue;
		}

		if (kind === "TRANSFER") {
			parsed.transfer.push({
				term: parts[1] || "Unknown Term",
				courseCode: normalizeCourseCode(parts[2] || ""),
				title: parts[3] || "",
				credits: parts[4] || "",
			});
			continue;
		}

		if (kind === "REQUIREMENT" && parts[1]) {
			parsed.requirements.push({
				label: parts[1],
				status: normalizeRequirementStatus(parts[2] || ""),
			});
		}
	}

	return parsed;
}

function collectTranscriptEvidence(transcriptText: string): TranscriptEvidence {
	if (!transcriptText.trim()) {
		return {
			transcriptDetected: false,
			completedCourseCodes: [],
			plannedCourseCodes: [],
			transferCourseCodes: [],
			excludedCourseCodes: [],
			requirementMentions: [],
			completedRequirementMentions: [],
			transferMentions: [],
			completedByTerm: [],
		};
	}

	const records = parseStructuredTranscriptRecords(transcriptText);
	const completed = new Set<string>();
	const planned = new Set<string>();
	const transferCourseCodes = new Set<string>();
	const requirements = new Set<string>();
	const completedRequirements = new Set<string>();
	const transfers = new Set<string>();
	const completedByTermCounter = new Map<string, number>();

	for (const item of records.completed) {
		if (!item.courseCode) {
			continue;
		}

		completed.add(item.courseCode);
		const term = item.term || "Unknown Term";
		completedByTermCounter.set(term, Number(completedByTermCounter.get(term) || 0) + 1);
	}

	for (const item of records.transfer) {
		if (item.courseCode) {
			transferCourseCodes.add(item.courseCode);
			transfers.add(item.courseCode);
		}
	}

	for (const item of records.planned) {
		if (item.courseCode) {
			planned.add(item.courseCode);
		}
	}

	for (const requirement of records.requirements) {
		requirements.add(requirement.label);
		if (requirement.status === "completed") {
			completedRequirements.add(requirement.label);
		}
	}

	const excludedCourseCodes = Array.from(new Set([
		...completed,
		...planned,
		...transferCourseCodes,
	]));

	const completedByTerm = Array.from(completedByTermCounter.entries())
		.map(([term, count]) => ({ term, count }))
		.sort((left, right) => left.term.localeCompare(right.term));

	return {
		transcriptDetected: true,
		completedCourseCodes: Array.from(completed),
		plannedCourseCodes: Array.from(planned),
		transferCourseCodes: Array.from(transferCourseCodes),
		excludedCourseCodes,
		requirementMentions: Array.from(requirements),
		completedRequirementMentions: Array.from(completedRequirements),
		transferMentions: Array.from(transfers),
		completedByTerm,
	};
}

function extractModelJson(text: string): ModelScheduleOutput {
	const rawText = text.trim();
	if (!rawText) {
		throw new Error("Model returned an empty response.");
	}

	const normalized = rawText
		.replace(/^```json\s*/i, "")
		.replace(/^```\s*/i, "")
		.replace(/\s*```$/i, "")
		.trim();

	const parsed = JSON.parse(normalized) as ModelScheduleOutput;
	if (!parsed || typeof parsed !== "object" || !parsed.results || typeof parsed.results !== "object") {
		throw new Error("Model response is missing results object.");
	}

	if (!Array.isArray(parsed.results.courses)) {
		throw new Error("Model response is missing results.courses array.");
	}

	if (typeof parsed.results.reasoning !== "string") {
		throw new Error("Model response is missing reasoning string.");
	}

	const normalizedCourses = parsed.results.courses
		.filter((item): item is ScheduleModelCourseSelection => Boolean(item) && typeof item.course_code === "string")
		.map((item) => ({
			course_code: normalizeCourseCode(item.course_code),
			primary: Boolean(item.primary),
		}))
		.filter((item) => Boolean(item.course_code));

	return {
		results: {
			courses: normalizedCourses,
			reasoning: parsed.results.reasoning.trim(),
		},
	};
}

function buildPromptCourses(courses: Course[]) {
	return courses.map((course) => ({
		course_code: course.course_code,
		title: course.title,
		description: trimForPrompt(course.description),
		credits: {
			minimum: course.credits?.minimum || 0,
			maximum: course.credits?.maximum || 0,
		},
		course_types: course.course_types || [],
		requisites: course.requisites || [],
		sections: (course.sections || []).slice(0, 4).map((section) => ({
			section_name: section.section_name,
			status: section.status,
			available_seats: Number(section.availability?.available || 0),
			capacity: Number(section.availability?.capacity || 0),
			waitlisted: Number(section.availability?.waitlisted || 0),
			meeting_info: (section.meeting_info || []).slice(0, 4).map((meeting) => ({
				days: meeting.days || [],
				start_time: meeting.start_time,
				end_time: meeting.end_time,
				classroom: meeting.classroom,
			})),
			instructors: (section.instructors || []).map((instructor) => instructor.name).filter(Boolean).slice(0, 3),
		})),
	}));
}

async function generateModelSchedule(payload: {
	term: string;
	primaryPoes: string[];
	secondaryEmphases: string[];
	creditPreference: ScheduleCreditPreference;
	guidance: string;
	transcriptEvidence: TranscriptEvidence;
	availableCourses: ReturnType<typeof buildPromptCourses>;
}): Promise<ModelScheduleOutput> {
	const outputSchema = {
		type: "object",
		additionalProperties: false,
		required: ["results"],
		properties: {
			results: {
				type: "object",
				additionalProperties: false,
				required: ["courses", "reasoning"],
				properties: {
					courses: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: false,
							required: ["course_code", "primary"],
							properties: {
								course_code: { type: "string" },
								primary: { type: "boolean" },
							},
						},
					},
					reasoning: { type: "string" },
				},
			},
		},
	};

	const creditPreference = payload.creditPreference;
	const targetCreditsText = creditPreference.targetCredits === null
		? "not specified"
		: String(creditPreference.targetCredits);
	const creditRangeText = creditPreference.minCredits !== null && creditPreference.maxCredits !== null
		? `${creditPreference.minCredits}-${creditPreference.maxCredits}`
		: creditPreference.minCredits !== null
			? `${creditPreference.minCredits}+`
			: creditPreference.maxCredits !== null
				? `<=${creditPreference.maxCredits}`
				: "open";

	const schedulerPrompt = [
		"You are AlfieAI Courses.",
		"Build one term schedule recommendations using only the available course catalog data provided.",
		"Return ONLY valid JSON that matches the required schema.",
		"Do not include markdown, prose outside JSON, or extra keys.",
		`Student-selected credit profile: ${creditPreference.profile} (${creditPreference.label}).`,
		`Required credit range for primary schedule: ${creditRangeText}.`,
		`Target credits for primary schedule: ${targetCreditsText}.`,
		"Rules:",
		"1) Include both primary and backup courses in results.courses.",
		"2) Use primary=true for recommended first-choice schedule courses.",
		"3) Use primary=false for backup or nice-to-have options.",
		"4) Use only course codes present in availableCourses.",
		"5) NEVER include any course whose course_code appears in transcriptEvidence.excludedCourseCodes. This includes completed, planned/in-progress, and transfer-equivalent courses.",
		"6) Choose primary courses so that no two of them share a day with overlapping start/end times — time conflicts are not allowed in the primary schedule.",
		"7) Aim for coherent schedule fit using term, primary POEs, secondary emphases, transcript evidence, and user guidance.",
		"8) Treat the student-selected credit profile, range, and target as required constraints; only deviate if impossible with the provided catalog and explain why.",
		"9) When transcriptEvidence.completedRequirementMentions includes requirement categories, de-prioritize courses whose course_types appear to map to those already-completed categories.",
		"10) results.reasoning should explain how the choices satisfy the student's goals and constraints.",
		"Input payload follows as JSON:",
		"11) If someone has taken a Connections course (CONN-XXX) either in progress or completed previously, do not recommend Connections courses at all.",
		JSON.stringify(payload),
	].join("\n");

	let lastError: unknown;
	for (const modelID of candidateModelIDs) {
		try {
			const response = await genAI.models.generateContent({
				model: modelID,
				contents: schedulerPrompt,
				config: {
					responseMimeType: "application/json",
					responseJsonSchema: outputSchema,
					temperature: 0.2,
					thinkingConfig: {
						thinkingBudget: 2048,
					},
				},
			});

			return extractModelJson(response.text || "");
		}
		catch (error) {
			lastError = error;
			if (!isMissingModelError(error) && !isRetryableModelError(error)) {
				throw error;
			}
		}
	}

	throw lastError;
}

function selectBestSection(course: Course, term: string, preferOpenSections: boolean): ScheduleSectionSummary {
	const termSections = (course.sections || []).filter((section) => section.term === term);
	if (termSections.length === 0) {
		return {
			sectionName: "TBA",
			term,
			status: "Unknown",
			location: "TBA",
			openSeats: 0,
			capacity: 0,
			waitlisted: 0,
			instructors: [],
			meetings: [],
			meetingBlocks: [],
		};
	}

	const openSections = termSections.filter((section) => Number(section.availability?.available || 0) > 0 && /open/i.test(section.status || ""));
	const source = preferOpenSections && openSections.length > 0 ? openSections : termSections;

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

	const winner = sorted[0];
	const meetingBlocks: ScheduleMeetingBlock[] = (winner.meeting_info || []).map((meeting) => ({
		days: getMeetingDays(meeting),
		startTime: (meeting.start_time || "").trim(),
		endTime: (meeting.end_time || "").trim(),
		location: (meeting.classroom || winner.location || "").trim(),
		startMinutes: parseTimeToMinutes(meeting.start_time || ""),
		endMinutes: parseTimeToMinutes(meeting.end_time || ""),
	}));

	return {
		sectionName: winner.section_name || "TBA",
		term: winner.term || term,
		status: winner.status || "Unknown",
		location: (winner.location || "").trim() || "TBA",
		openSeats: Number(winner.availability?.available || 0),
		capacity: Number(winner.availability?.capacity || 0),
		waitlisted: Number(winner.availability?.waitlisted || 0),
		instructors: (winner.instructors || []).map((instructor) => instructor.name).filter(Boolean),
		meetings: (winner.meeting_info || []).map(formatMeeting),
		meetingBlocks,
	};
}

function meetingBlocksConflict(a: ScheduleMeetingBlock, b: ScheduleMeetingBlock): boolean {
	if (a.startMinutes === null || a.endMinutes === null || b.startMinutes === null || b.endMinutes === null) {
		return false;
	}
	const sharedDay = a.days.some((d) => b.days.includes(d));
	if (!sharedDay) {
		return false;
	}
	return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

function scheduleCoursesMeetingConflict(a: ScheduleCourseResult, b: ScheduleCourseResult): boolean {
	for (const blockA of a.section.meetingBlocks) {
		for (const blockB of b.section.meetingBlocks) {
			if (meetingBlocksConflict(blockA, blockB)) {
				return true;
			}
		}
	}
	return false;
}

function toScheduleCourse(course: Course, primary: boolean, term: string, preferOpenSections: boolean): ScheduleCourseResult {
	return {
		courseCode: course.course_code,
		title: course.title,
		description: course.description,
		credits: Number(course.credits?.minimum || 0),
		categories: course.course_types || [],
		primary,
		section: selectBestSection(course, term, preferOpenSections),
	};
}

export async function POST(request: NextRequest) {
	try {
		const contentType = request.headers.get("content-type") || "";
		if (!contentType.includes("multipart/form-data")) {
			return NextResponse.json({ error: "Schedule generation expects multipart form data." }, { status: 400 });
		}

		const formData = await request.formData();
		const term = getString(formData, "term");
		const primaryPoes = Array.from(new Set([
			...parseJsonStringArray(getString(formData, "primaryPoes")),
			getString(formData, "poe"),
		].map((item) => item.trim()).filter(Boolean)));
		const poe = primaryPoes[0] || "";
		const guidance = getString(formData, "guidance");
		const secondaryEmphases = parseJsonStringArray(getString(formData, "secondaryEmphases"));
		const preferOpenSections = getString(formData, "openSeatsOnly") === "true";
		const creditPreference = resolveCreditPreference(formData);

		if (!term) {
			return NextResponse.json({ error: "A term is required to generate a schedule." }, { status: 400 });
		}
		if (primaryPoes.length === 0) {
			return NextResponse.json({ error: "Please choose at least one primary POE before generating your schedule." }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
		const collection = db.collection<Course>(process.env.MONGODB_COURSES_COLLECTION || "courses");
		const professorsCollection = db.collection<ProfessorNameRecord>(process.env.MONGODB_PROFESSORS_COLLECTION || "professors");

		const transcriptFile = formData.get("degreeProgressFile") || formData.get("transcriptFile");
		if (transcriptFile instanceof File && transcriptFile.size > 0) {
			const lowerName = transcriptFile.name.toLowerCase();
			const isPdf = transcriptFile.type === "application/pdf" || lowerName.endsWith(".pdf");
			if (!isPdf) {
				return NextResponse.json({ error: "Self-Service Degree Progress uploads must be PDF files." }, { status: 400 });
			}
		}

		if (transcriptFile instanceof File && transcriptFile.size > maxDegreeProgressPdfBytes) {
			return NextResponse.json(
				{ error: `Self-Service Degree Progress PDF is too large. Maximum size is ${Math.round(maxDegreeProgressPdfBytes / (1024 * 1024))}MB.` },
				{ status: 400 },
			);
		}

		const availableCoursesPromise = collection.aggregate<Course>([
			{
				$match: {
					sections: {
						$elemMatch: { term },
					},
				},
			},
			{
				$project: {
					...courseProjection,
					sections: {
						$filter: {
							input: "$sections",
							as: "section",
							cond: { $eq: ["$$section.term", term] },
						},
					},
				},
			},
		]).toArray();

		const transcriptPromise = (async () => {
			let transcriptText = getString(formData, "transcriptText");
			let transcriptWarning = "";

			if (!(transcriptFile instanceof File) || transcriptFile.size <= 0) {
				return {
					transcriptText,
					transcriptWarning,
				};
			}

			const fileBuffer = new Uint8Array(await transcriptFile.arrayBuffer());
			try {
				transcriptText = await withTimeout(
					extractTranscriptTextFromPdf(fileBuffer),
					transcriptParseTimeoutMs,
					"Degree progress parsing",
				);

				if (!transcriptText || transcriptText === "UNREADABLE TRANSCRIPT") {
					transcriptText = "";
					transcriptWarning = "The uploaded Self-Service Degree Progress PDF could not be read clearly, so degree-progress recognition may be incomplete.";
				}
			}
			catch (error) {
				console.error("Failed to parse degree progress PDF", error);
				transcriptText = "";
				transcriptWarning = "Degree progress parsing timed out or failed, so planning continued with live course data and your text preferences.";
			}

			return {
				transcriptText,
				transcriptWarning,
			};
		})();

		const [{ transcriptText, transcriptWarning }, availableCourses, instructorLookup] = await Promise.all([
			transcriptPromise,
			availableCoursesPromise,
			getInstructorLookup(professorsCollection),
		]);

		const availableCoursesWithResolvedInstructors = resolveCourseInstructorNames(availableCourses, instructorLookup);

		const transcriptEvidence = collectTranscriptEvidence(transcriptText);
		const completedAliases = new Set(transcriptEvidence.completedCourseCodes.flatMap((courseCode) => getCourseCodeAliases(courseCode)));
		const plannedAliases = new Set(transcriptEvidence.plannedCourseCodes.flatMap((courseCode) => getCourseCodeAliases(courseCode)));
		const transferAliases = new Set(transcriptEvidence.transferCourseCodes.flatMap((courseCode) => getCourseCodeAliases(courseCode)));
		const excludedAliases = new Set(transcriptEvidence.excludedCourseCodes.flatMap((courseCode) => getCourseCodeAliases(courseCode)));
		const transcriptEvidenceForModel: TranscriptEvidence = {
			...transcriptEvidence,
			completedCourseCodes: Array.from(completedAliases),
			plannedCourseCodes: Array.from(plannedAliases),
			transferCourseCodes: Array.from(transferAliases),
			excludedCourseCodes: Array.from(excludedAliases),
			transferMentions: Array.from(transferAliases),
		};

		if (availableCoursesWithResolvedInstructors.length === 0) {
			return NextResponse.json({ error: `No course offerings were found for ${term}.` }, { status: 404 });
		}

		// Remove completed/planned/transfer-equivalent courses from the catalog sent to the model
		const filteredCourses = excludedAliases.size > 0
			? availableCoursesWithResolvedInstructors.filter((c) => {
				const aliases = getCourseCodeAliases(c.course_code);
				return !aliases.some((alias) => excludedAliases.has(alias));
			})
			: availableCoursesWithResolvedInstructors;

		if (filteredCourses.length === 0) {
			return NextResponse.json(
				{ error: "All available courses for this term appear to already be completed, planned, or transfer-equivalent based on your transcript." },
				{ status: 422 },
			);
		}

		const modelOutput = await generateModelSchedule({
			term,
			primaryPoes,
			secondaryEmphases,
			creditPreference,
			guidance: guidance || "No explicit student guidance provided.",
			transcriptEvidence: transcriptEvidenceForModel,
			availableCourses: buildPromptCourses(filteredCourses),
		});

		const normalizedSelection = normalizeSelection(modelOutput.results.courses);
		if (normalizedSelection.length === 0) {
			return NextResponse.json(
				{ error: "AlfieAI did not return any course recommendations for this request." },
				{ status: 422 }
			);
		}

		const selectedCodes = normalizedSelection.map((item) => item.course_code);
		const selectedCourses = await collection.aggregate<Course>([
			{
				$match: {
					course_code: { $in: selectedCodes },
					sections: {
						$elemMatch: { term },
					},
				},
			},
			{
				$project: {
					...courseProjection,
					sections: {
						$filter: {
							input: "$sections",
							as: "section",
							cond: { $eq: ["$$section.term", term] },
						},
					},
				},
			},
		]).toArray();

		const selectedCoursesWithResolvedInstructors = resolveCourseInstructorNames(selectedCourses, instructorLookup);

		const selectedMap = new Map(
			selectedCoursesWithResolvedInstructors.map((course) => [normalizeCourseCode(course.course_code), course])
		);

		const warnings: string[] = [];
		if (transcriptWarning) {
			warnings.push(transcriptWarning);
		}

		const allSelectedCourses: ScheduleCourseResult[] = [];
		for (const item of normalizedSelection) {
			const course = selectedMap.get(item.course_code);
			if (!course) {
				warnings.push(`Model recommended ${item.course_code}, but it was not found in ${term} offerings.`);
				continue;
			}

			allSelectedCourses.push(toScheduleCourse(course, item.primary, term, preferOpenSections));
		}

		if (allSelectedCourses.length === 0) {
			return NextResponse.json(
				{ error: "No model-selected courses could be matched to term offerings." },
				{ status: 422 }
			);
		}

		let primaryCourses = allSelectedCourses.filter((course) => course.primary);
		if (primaryCourses.length === 0 && allSelectedCourses.length > 0) {
			allSelectedCourses[0].primary = true;
			primaryCourses = [allSelectedCourses[0]];
			warnings.push("No primary courses were marked by the model, so the first selected course was promoted to primary.");
		}

		// Enforce no-overlap among primary courses — demote conflicting ones to backup
		const confirmedPrimary: ScheduleCourseResult[] = [];
		for (const candidate of primaryCourses) {
			const conflicting = confirmedPrimary.find((placed) =>
				scheduleCoursesMeetingConflict(placed, candidate)
			);
			if (conflicting) {
				candidate.primary = false;
				warnings.push(
					`${candidate.courseCode} was moved to backup — it conflicts with ${conflicting.courseCode}.`
				);
			} else {
				confirmedPrimary.push(candidate);
			}
		}
		primaryCourses = confirmedPrimary;

		const creditAdjustmentNotes = applyCreditPreferenceToSelection(allSelectedCourses, creditPreference);
		warnings.push(...creditAdjustmentNotes);
		primaryCourses = allSelectedCourses.filter((course) => course.primary);

		const backupCourses = allSelectedCourses.filter((course) => !course.primary);
		const finalPrimaryCredits = primaryCourses.reduce((sum, course) => sum + Number(course.credits || 0), 0);
		const creditRangeText = creditPreference.minCredits !== null && creditPreference.maxCredits !== null
			? `${creditPreference.minCredits}-${creditPreference.maxCredits}`
			: creditPreference.minCredits !== null
				? `${creditPreference.minCredits}+`
				: creditPreference.maxCredits !== null
					? `<=${creditPreference.maxCredits}`
					: "open";
		const notes = [
			`Term catalog grounding used ${availableCoursesWithResolvedInstructors.length} available course records for ${term}.`,
			`Primary POEs used for planning: ${primaryPoes.join(", ")}.`,
			`Credit load preference: ${creditPreference.label} (target range ${creditRangeText}, planned primary total ${finalPrimaryCredits}).`,
			`AlfieAI selected ${allSelectedCourses.length} matched courses (${primaryCourses.length} primary, ${backupCourses.length} backup).`,
			transcriptEvidence.transcriptDetected
				? `Degree-progress evidence recognized ${transcriptEvidence.completedCourseCodes.length} completed, ${transcriptEvidence.plannedCourseCodes.length} planned, and ${transcriptEvidence.transferCourseCodes.length} transfer-equivalent courses; ${transcriptEvidence.completedRequirementMentions.length} completed requirement categories were also deprioritized.`
				: "No parsed degree-progress evidence was available for this run.",
		];

		const response: ScheduleGenerationResult = {
			term,
			poe,
			primaryPoes,
			secondaryEmphases,
			creditPreference,
			guidance,
			reasoning: modelOutput.results.reasoning,
			primaryCourses,
			backupCourses,
			allSelectedCourses,
			requirementsProgress: {
				transcriptDetected: transcriptEvidence.transcriptDetected,
				completedCourseCodes: transcriptEvidence.completedCourseCodes,
				requirementMentions: transcriptEvidence.requirementMentions,
				transferMentions: transcriptEvidence.transferMentions,
				completedByTerm: transcriptEvidence.completedByTerm,
			} satisfies ScheduleRequirementsProgress,
			notes,
			warnings,
			modelSelection: normalizedSelection,
		};

		return NextResponse.json(response);
	}
	catch (error) {
		console.error("Failed to generate schedule", error);

		if (isRetryableModelError(error)) {
			return NextResponse.json(
				{ error: "AlfieAI scheduling is temporarily busy. Please try again in a moment." },
				{ status: 503 }
			);
		}

		return NextResponse.json(
			{ error: "Could not generate a schedule right now." },
			{ status: 500 }
		);
	}
}
