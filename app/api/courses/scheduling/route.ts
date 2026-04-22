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
	SchedulingMode,
	TranscriptCourseRecord,
	TranscriptTransferRecord,
	TranscriptPlannedRecord,
	GenEdCategoryStatus,
	WeekdayCode,
	PoeProgressSummary,
	PoeGroupProgress,
} from "@/lib/schedule-ai";
import { extractTranscriptTextFromPdf } from "@/lib/transcript-parser";
import { RequirementCategoryId, CATEGORY_LABELS, FIXED_REQUIREMENT_ORDER, WK_CATEGORIES, SW_CATEGORIES, normalizeRequirementLabel, getPoeWaiverOptions } from "@/lib/gen-ed-rules";
import { getPoeRequirementProfile, evaluatePoeRequirements, getPoeCapstoneCourseCodes } from "@/lib/poe-requirements";

export const maxDuration = 60;

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const transcriptParseTimeoutMs = Number(process.env.TRANSCRIPT_PARSE_TIMEOUT_MS || 25000);
const maxDegreeProgressPdfBytes = Number(process.env.MAX_DEGREE_PROGRESS_PDF_BYTES || 8 * 1024 * 1024);

const model = "gemini-3-flash-preview";

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
		status: "completed" | "waived" | "pending" | "in-progress" | "unknown";
	}>;
	/** POE requirement sections parsed directly from the degree progress PDF */
	poeSections: Array<{
		sectionLabel: string;
		courses: Array<{
			courseCode: string;
			title: string;
			status: "completed" | "in_progress" | "remaining";
			term: string;
			credits: string;
			grade: string;
		}>;
	}>;
	/** Parsed from "CREDIT_TOTALS | <total> | <school>" line in structured output */
	totalCredits?: number;
	schoolCredits?: number;
	/** Parsed from "STUDENT_ID | <id>" line in structured output */
	studentId?: string;
}

interface ModelScheduleOutput {
	results: {
		courses: ScheduleModelCourseSelection[];
		reasoning: string;
	};
}

const creditLoadLabels: Record<CreditLoadProfile, string> = {
	"part-time": "Part-time (<12 credits)",
	light: "Light (12-13 credits)",
	moderate: "Moderate (14-16 credits)",
	heavy: "Heavy (17+ credits)",
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

	switch (profile) {
		case "part-time":
			return {
				profile,
				label: creditLoadLabels[profile],
				minCredits: 1,
				maxCredits: 11,
				targetCredits: 10,
			};
		
		case "light":
			return {
				profile,
				label: creditLoadLabels[profile],
				minCredits: 12,
				maxCredits: 13,
				targetCredits: 12,
			};
		
		case "moderate":
			return {
				profile,
				label: creditLoadLabels[profile],
				minCredits: 14,
				maxCredits: 16,
				targetCredits: 15,
			};
		
		case "heavy":
			return {
				profile,
				label: creditLoadLabels[profile],
				minCredits: 17,
				maxCredits: null,
				targetCredits: 17,
			};
		
		default:
			const requested = parseOptionalNumber(getString(formData, "targetCredits"));
			const customTarget = clampCredits(requested ?? 15);
			return {
				profile,
				label: `${creditLoadLabels[profile]} (${customTarget} credits)`,
				minCredits: customTarget,
				maxCredits: customTarget,
				targetCredits: customTarget,
			};
	}
}

function getPrimaryCredits(courses: ScheduleCourseResult[]): number {
	return courses
		.filter((course) => course.primary)
		.reduce((sum, course) => sum + Number(course.credits || 0), 0);
}

function getRangeDistance(total: number, minCredits: number, maxCredits: number): number {
	if (total < minCredits) {
		return minCredits - total;
	} else if (total > maxCredits) {
		return total - maxCredits;
	} else {
		return 0;
	}
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
		notes.push(`Credit optimization adjusted primary placements to better match your requested load (${originalTotalCredits} -> ${bestCandidate.totalCredits} credits).`);
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

function extractCourseCodesFromText(value: string): string[] {
	if (!value.trim()) {
		return [];
	}

	const matches = value.match(/\b[A-Za-z]{2,4}\s*-?\s*\d{3}[A-Za-z]{0,3}\b/g) || [];
	const normalized = matches
		.map((token) => normalizeCourseCode(token))
		.filter((token) => /^([A-Z]{2,4})-(\d{3})([A-Z]{0,3})$/.test(token));

	return Array.from(new Set(normalized));
}

function normalizeWhitespace(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

function normalizeRequirementStatus(value: string): "completed" | "waived" | "pending" | "in-progress" | "unknown" {
	const normalized = normalizeWhitespace(value).toLowerCase();
	if (!normalized) {
		return "unknown";
	}

	if (/(?:waived|equivalency|noncourse)/.test(normalized)) {
		return "waived";
	}

	if (/(?:completed|fulfilled|satisfied|met|[✓✔☑])/.test(normalized)) {
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

function inferFoundationalTopicKey(courseCode: string, title: string): string | null {
	const normalizedCode = normalizeCourseCode(courseCode);
	const lowerTitle = normalizeWhitespace(title).toLowerCase();
	const mathCodeMatch = normalizedCode.match(/^MATH-(\d{3})/);
	const mathNumber = mathCodeMatch ? Number(mathCodeMatch[1]) : null;

	const isPrecalculus = /^MATH-(0\d{2}|1\d{2})/.test(normalizedCode)
		&& /\b(pre[-\s]?calculus|college\s+algebra|trigonometry)\b/.test(lowerTitle);
	if (isPrecalculus) {
		return "precalculus";
	}

	const isStatistics = /^STAT-\d{3}/.test(normalizedCode)
		|| /\b(statistics?|statistical|stats?)\b/.test(lowerTitle);
	if (isStatistics) {
		return "statistics";
	}

	const isCalculusOne = /\bcalculus\b/.test(lowerTitle)
		&& /(?:\bi\b|\b1\b|\bone\b)/.test(lowerTitle)
		&& !/(?:\bii\b|\b2\b|\btwo\b)/.test(lowerTitle);
	if (isCalculusOne) {
		return "calculus-1";
	}

	const isAdvancedCalculus = /\bcalculus\b/.test(lowerTitle)
		&& (/(?:\bii\b|\biii\b|\biv\b|\b2\b|\b3\b|\b4\b|multivariable|vector)/.test(lowerTitle)
			|| (mathNumber !== null && mathNumber >= 200));
	if (isAdvancedCalculus) {
		return "calculus-advanced";
	}

	const isHigherLevelMath = mathNumber !== null
		&& mathNumber >= 200
		&& /\b(linear\s+algebra|differential\s+equations?|real\s+analysis|abstract\s+algebra|proofs?)\b/.test(lowerTitle);
	if (isHigherLevelMath) {
		return "advanced-math";
	}

	return null;
}

function shouldBlockTopicRecommendation(candidateTopic: string | null, takenTopics: Set<string>): boolean {
	if (!candidateTopic) {
		return false;
	}

	if (takenTopics.has(candidateTopic)) {
		return true;
	}

	if (candidateTopic === "precalculus") {
		return takenTopics.has("calculus-1")
			|| takenTopics.has("calculus-advanced")
			|| takenTopics.has("advanced-math");
	}

	return false;
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

	switch (value) {
		case "M":
		case "MON":
		case "MONDAY":
			return "M";
		
		case "T":
		case "TU":
		case "TUE":
		case "TUES":
		case "TUESDAY":
			return "T";
		
		case "W":
		case "WED":
		case "WEDNESDAY":
			return "W";
		
		case "TH":
		case "THU":
		case "THUR":
		case "THURS":
		case "THURSDAY":
		case "R":
			return "Th";
		
		case "F":
		case "FRI":
		case "FRIDAY":
			return "F";
		
		default:
			return null;
	}
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
		poeSections: [],
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

		if (kind === "CREDIT_TOTALS") {
			const total = Number(parts[1]);
			const school = Number(parts[2]);
			if (Number.isFinite(total) && total > 0) {
				parsed.totalCredits = total;
			}
			if (Number.isFinite(school) && school > 0) {
				parsed.schoolCredits = school;
			}
		}

		if (kind === "STUDENT_ID" && parts[1]) {
			parsed.studentId = parts[1];
		}

		if (kind === "POE_COURSE") {
			// POE_COURSE | <SectionLabel> | <Status> | <CourseCode> | <CourseTitle> | <Credits> | <Term> | <Grade>
			const sectionLabel = parts[1] || "";
			const rawStatus = (parts[2] || "").toLowerCase();
			const courseCode = normalizeCourseCode(parts[3] || "");
			const title = parts[4] || "";
			const credits = parts[5] || "";
			const term = parts[6] || "Unknown Term";
			const grade = parts[7] || "";

			if (!sectionLabel || !courseCode) continue;

			const status: "completed" | "in_progress" | "remaining" =
				rawStatus.includes("complet") ? "completed" :
				rawStatus.includes("progress") || rawStatus.includes("planned") || rawStatus.includes("in_progress") ? "in_progress" :
				"remaining";

			let section = parsed.poeSections.find((s) => s.sectionLabel === sectionLabel);
			if (!section) {
				section = { sectionLabel, courses: [] };
				parsed.poeSections.push(section);
			}
			section.courses.push({ courseCode, title, status, term, credits, grade });
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
		if (requirement.status === "completed" || requirement.status === "waived") {
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

// ── Degree-progress enrichment helpers ───────────────────────────────────────

const GRADE_POINTS: Record<string, number> = {
	"A+": 4.0, A: 4.0, "A-": 3.7,
	"B+": 3.3, B: 3.0, "B-": 2.7,
	"C+": 2.3, C: 2.0, "C-": 1.7,
	"D+": 1.3, D: 1.0, "D-": 0.7,
	F: 0.0,
};

function parseCredits(raw: string | number | undefined): number {
	const n = Number(raw);
	return Number.isFinite(n) && n > 0 ? n : 0;
}

function computeGpa(records: ParsedTranscriptRecords["completed"]): number | null {
	let totalPoints = 0;
	let totalCredits = 0;
	for (const r of records) {
		const grade = (r.grade || "").trim().toUpperCase();
		if (!(grade in GRADE_POINTS)) {
			continue;
		}

		const credits = parseCredits(r.credits);
		if (credits === 0) {
			continue;
		}

		totalPoints += GRADE_POINTS[grade] * credits;
		totalCredits += credits;
	}

	if (totalCredits === 0) {
		return null;
	}

	return Math.round((totalPoints / totalCredits) * 100) / 100;
}

const ALL_GEN_ED_ORDER: RequirementCategoryId[] = [
	...FIXED_REQUIREMENT_ORDER,
	...WK_CATEGORIES,
	...SW_CATEGORIES,
];

function buildPoeProgress(
	poeNames: string[],
	primaryPoes: string[],
	records: ParsedTranscriptRecords,
	schedulingTerm: string,
): PoeProgressSummary[] {
	const completedCourses = records.completed.map((r) => ({
		baseCode: r.courseCode,
		courseCode: r.courseCode,
		title: r.title,
		credits: parseCredits(r.credits),
		prefix: r.courseCode.split("-")[0] || "",
	}));
	// Only include in-progress courses (registered for a term before the scheduling
	// term). Future-registered courses should not push a requirement to "in_progress".
	const inProgressCodes = new Set(getInProgressCourseCodes(records.planned, schedulingTerm));
	const plannedCourses = records.planned
		.filter((r) => inProgressCodes.has(r.courseCode))
		.map((r) => ({
			baseCode: r.courseCode,
			courseCode: r.courseCode,
			title: r.title,
			credits: 3,
			prefix: r.courseCode.split("-")[0] || "",
		}));
	const primarySet = new Set(primaryPoes.map((p) => p.toLowerCase().trim()));

	// Helper: determine phase from section label
	function inferPhase(label: string): "core" | "elective" | "capstone" {
		const lc = label.toLowerCase();
		if (lc.includes("capstone")) return "capstone";
		if (lc.includes("elective") || lc.includes("cognate") || lc.includes("select")) return "elective";
		return "core";
	}

	// Helper: check whether a PDF section label belongs to a given POE name.
	// Matches in priority order:
	//   1. Section label starts with the full POE name (e.g. "Data Science Core" → "Data Science")
	//   2. Every word of the POE name appears in the section label in order
	//      (handles abbreviations / reordered labels like "CS Core Requirements" → "Computer Science")
	//   3. The section label is contained within the POE name (for very short labels)
	function sectionMatchesPoe(sectionLabel: string, poeName: string): boolean {
		const secNorm = sectionLabel.toLowerCase().trim();
		const poeNorm = poeName.toLowerCase().trim();
		if (secNorm.startsWith(poeNorm)) return true;
		// All POE name words appear in the section label
		const poeWords = poeNorm.split(/\s+/).filter(Boolean);
		if (poeWords.length > 0 && poeWords.every((w) => secNorm.includes(w))) return true;
		return false;
	}

	// Build a PoeGroupProgress from one parsed PDF section
	function buildGroupFromSection(section: ParsedTranscriptRecords["poeSections"][number], poeNorm: string): PoeGroupProgress {
		const isCredits = /credit/i.test(section.sectionLabel);
		const phase = inferPhase(section.sectionLabel);

		const completed = section.courses.filter((c) => c.status === "completed");
		const inProgress = section.courses.filter((c) => c.status === "in_progress");
		const remaining = section.courses.filter((c) => c.status === "remaining");

		let completedCount: number;
		let requiredCount: number;
		const countUnit: "course" | "credit" = isCredits ? "credit" : "course";
		let completedCreditCount = 0;

		if (isCredits) {
			completedCount = completed.reduce((s, c) => s + parseCredits(c.credits), 0);
			requiredCount = section.courses.reduce((s, c) => s + parseCredits(c.credits), 0);
			completedCreditCount = completedCount;
		} else {
			completedCount = completed.length;
			requiredCount = section.courses.length;
			completedCreditCount = completed.reduce((s, c) => s + parseCredits(c.credits), 0);
		}

		const status: PoeGroupProgress["status"] =
			requiredCount > 0 && completedCount >= requiredCount ? "complete" :
			inProgress.length > 0 || completedCount > 0 ? "in_progress" :
			"remaining";

		const progressRatio = requiredCount > 0 ? Math.min(1, completedCount / requiredCount) : 0;
		const groupId = `${poeNorm.replace(/\s+/g, "-")}-${section.sectionLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

		return {
			id: groupId,
			label: section.sectionLabel,
			phase,
			status,
			required: isCredits ? `${requiredCount} credits` : `${requiredCount} course${requiredCount === 1 ? "" : "s"}`,
			completed: isCredits
				? `${completedCount} of ${requiredCount} credits completed`
				: `${completedCount} of ${requiredCount} courses completed`,
			planned: inProgress.map((c) => c.courseCode).join(", "),
			remaining: remaining.map((c) => c.courseCode).join(", "),
			progressRatio,
			remainingCourseCodes: remaining.map((c) => c.courseCode),
			completedCount,
			requiredCount,
			countUnit,
			completedCreditCount,
		};
	}

	// Helper: build a PoeProgressSummary from parsed PDF sections for one POE
	function buildFromSections(poeName: string, isPrimary: boolean): PoeProgressSummary | null {
		const poeNorm = poeName.toLowerCase().trim();
		const matched = records.poeSections.filter((s) => sectionMatchesPoe(s.sectionLabel, poeName));
		if (matched.length === 0) return null;

		const groups: PoeGroupProgress[] = matched.map((section) => buildGroupFromSection(section, poeNorm));

		const coreGroups = groups.filter((g) => g.phase === "core");
		const coreCompletionRatio = coreGroups.length > 0
			? coreGroups.reduce((s, g) => s + g.progressRatio, 0) / coreGroups.length
			: 0;
		const capstoneGroups = groups.filter((g) => g.phase === "capstone");
		const capstoneReadiness = capstoneGroups.length > 0 && capstoneGroups.every((g) => g.status === "complete") ? 1 : 0;

		return { poeName, isPrimary, coreCompletionRatio, capstoneReadiness, groups };
	}

	const summaries: PoeProgressSummary[] = [];

	// Track which PDF sections have been assigned to a named POE so we can surface
	// any orphaned sections (POEs whose name doesn't appear in poeNames but whose
	// sections are present in the PDF — e.g. unlisted secondaries).
	const assignedSectionLabels = new Set<string>();

	for (const poeName of poeNames) {
		const isPrimary = primarySet.has(poeName.toLowerCase().trim());

		// Prefer PDF-parsed sections — they reflect what the degree audit actually shows
		const fromSections = buildFromSections(poeName, isPrimary);
		if (fromSections) {
			for (const g of fromSections.groups) {
				assignedSectionLabels.add(g.label);
			}
			summaries.push(fromSections);
			continue;
		}

		// Fall back to hardcoded catalog data when the PDF didn't include section tables
		const profile = getPoeRequirementProfile(poeName);
		if (!profile) {
			continue;
		}

		const evaluation = evaluatePoeRequirements(profile, completedCourses, plannedCourses);
		summaries.push({
			poeName: profile.name,
			isPrimary: primarySet.has(poeName.toLowerCase().trim()),
			coreCompletionRatio: evaluation.coreCompletionRatio,
			capstoneReadiness: evaluation.capstoneReadiness,
			groups: evaluation.items.map((item): PoeGroupProgress => ({
				id: item.id,
				label: item.label,
				phase: item.phase,
				status: item.status,
				required: item.required,
				completed: item.completed,
				planned: item.planned,
				remaining: item.remaining,
				progressRatio: item.progressRatio,
				remainingCourseCodes: item.remainingCourseCodes,
				completedCount: item.completedCount,
				requiredCount: item.requiredCount,
				countUnit: item.countUnit,
				completedCreditCount: item.completedCreditCount,
			})),
		});
	}

	// Surface any PDF sections not yet matched to a named POE.
	// This covers secondaries/emphases that weren't in the poeNames list.
	const orphanSections = records.poeSections.filter(
		(s) => !assignedSectionLabels.has(s.sectionLabel)
	);
	if (orphanSections.length > 0) {
		// Generic phase-only labels (e.g. "Elective Courses", "Capstone") can happen
		// when the AI omitted the POE name prefix. Try to attach these to an already-
		// resolved POE by checking if the label matches a named POE's known phase words.
		const PHASE_ONLY_PATTERN = /^(?:core(?:\s+requirements?)?|elective\s+(?:courses?|credits?)|capstone|cognate\s+area|requirements?)$/i;
		const resolvedOrphans = new Set<string>();

		for (const section of orphanSections) {
			if (!PHASE_ONLY_PATTERN.test(section.sectionLabel.trim())) continue;
			// Attach to the last (or only) resolved POE summary, which is the most
			// recently processed POE and most likely the parent.
			const lastSummary = summaries[summaries.length - 1];
			if (!lastSummary) continue;
			const poeNorm = lastSummary.poeName.toLowerCase().trim();
			const group = buildGroupFromSection(section, poeNorm);
			lastSummary.groups.push(group);
			// Recompute coreCompletionRatio for updated groups
			const coreGroups = lastSummary.groups.filter((g) => g.phase === "core");
			lastSummary.coreCompletionRatio = coreGroups.length > 0
				? coreGroups.reduce((s, g) => s + g.progressRatio, 0) / coreGroups.length
				: lastSummary.coreCompletionRatio;
			const capstoneGroups = lastSummary.groups.filter((g) => g.phase === "capstone");
			lastSummary.capstoneReadiness = capstoneGroups.length > 0 && capstoneGroups.every((g) => g.status === "complete") ? 1 : 0;
			resolvedOrphans.add(section.sectionLabel);
		}

		// Group remaining orphans (genuinely unlisted POEs/secondaries) by inferred name
		const orphanPoeMap = new Map<string, typeof orphanSections>();
		for (const section of orphanSections) {
			if (resolvedOrphans.has(section.sectionLabel)) continue;
			const inferredName = section.sectionLabel
				.replace(/\s+(?:core|elective\s+credits?|electives?|capstone|cognate\s+area|requirements?)(\s+requirements?)?$/i, "")
				.trim() || section.sectionLabel;
			const existing = orphanPoeMap.get(inferredName) ?? [];
			existing.push(section);
			orphanPoeMap.set(inferredName, existing);
		}
		for (const [orphanPoeName, sections] of orphanPoeMap) {
			const poeNorm = orphanPoeName.toLowerCase().trim();
			const groups = sections.map((s) => buildGroupFromSection(s, poeNorm));
			const coreGroups = groups.filter((g) => g.phase === "core");
			const coreCompletionRatio = coreGroups.length > 0
				? coreGroups.reduce((s, g) => s + g.progressRatio, 0) / coreGroups.length
				: 0;
			const capstoneGroups = groups.filter((g) => g.phase === "capstone");
			const capstoneReadiness = capstoneGroups.length > 0 && capstoneGroups.every((g) => g.status === "complete") ? 1 : 0;
			summaries.push({
				poeName: orphanPoeName,
				isPrimary: false,
				coreCompletionRatio,
				capstoneReadiness,
				groups,
			});
		}
	}

	return summaries;
}

// Fallback: infer gen-ed category from course code prefix when the course
// is not present in the DB catalog (e.g. FYC-101, FYF-101, FYS-102, EN-1XX).
const COURSE_CODE_PREFIX_CATEGORY: Array<[RegExp, RequirementCategoryId]> = [
	[/^FYC-/i, "fyc"],
	[/^FYF-/i, "fyf"],
	[/^FYS-/i, "fys"],
	// EN-1XX (and EN-1XXTR) are 100-level English transfer placeholders → FYC
	[/^EN-1[0-9X]/i, "fyc"],
];

function inferCategoryFromCodeOrTitle(code: string, title?: string): RequirementCategoryId | null {
	for (const [pattern, categoryId] of COURSE_CODE_PREFIX_CATEGORY) {
		if (pattern.test(code)) return categoryId;
	}
	if (title && /capstone/i.test(title)) return "capstone";
	return null;
}

function buildGenEdStatus(
	records: ParsedTranscriptRecords,
	completedTypesByCode: Map<string, string[]>,
	inProgressTypesByCode: Map<string, string[]>,
	inProgressCodeSet: Set<string>,
	poes: string[],
): GenEdCategoryStatus[] {
	// Seed waiver map from POE-implied waivers so they show as waived even without
	// an explicit transcript entry. Transcript lines added below can override.
	const reqStatusMap = new Map<RequirementCategoryId, "completed" | "waived" | "in-progress">();
	// Track the waiver source for each waived category
	const waivedByMap = new Map<RequirementCategoryId, string>(); // categoryId → "poe" | "<course code>"
	for (const poe of poes) {
		for (const categoryId of getPoeWaiverOptions(poe)) {
			reqStatusMap.set(categoryId, "waived");
			waivedByMap.set(categoryId, "poe");
		}
	}

	// Overlay with requirement status lines parsed from the transcript
	for (const req of records.requirements) {
		const categoryId = normalizeRequirementLabel(req.label);
		if (!categoryId) {
			continue;
		}

		if (req.status === "completed") {
			if (!reqStatusMap.has(categoryId)) {
				reqStatusMap.set(categoryId, "completed");
			}
		} else if (req.status === "waived") {
			reqStatusMap.set(categoryId, "waived");
		} else if ((req.status === "in-progress" || req.status === "pending") && !reqStatusMap.has(categoryId)) {
			reqStatusMap.set(categoryId, "in-progress");
		}
	}

	// Build reverse map: categoryId → completed course codes (from DB course_types)
	const completedByCategory = new Map<RequirementCategoryId, string[]>();
	for (const [code, types] of completedTypesByCode.entries()) {
		for (const type of types) {
			const categoryId = normalizeRequirementLabel(type);
			if (!categoryId) {
				continue;
			}

			const list = completedByCategory.get(categoryId) || [];
			list.push(code);
			completedByCategory.set(categoryId, list);
		}
	}

	// Fallback: for completed codes not found in the DB catalog, infer category from prefix/title
	for (const { courseCode: code, title } of records.completed) {
		if (!code) continue;
		const categoryId = inferCategoryFromCodeOrTitle(code, title);
		if (categoryId && !completedByCategory.has(categoryId)) {
			completedByCategory.set(categoryId, [code]);
		}
	}

	// Same fallback for transfer codes (e.g. EN-1XX → FYC).
	// Transfer equivalencies count as waived — the student doesn't need to take the course.
	// TR-suffixed codes (e.g. EN-1XXTR) are processed last so they take priority over
	// any local-equivalent codes the AI may have picked up from the same PDF section.
	const transferForCategory = [...records.transfer].sort((a, b) => {
		const aIsTr = /TR$/i.test(a.courseCode || "") ? 1 : 0;
		const bIsTr = /TR$/i.test(b.courseCode || "") ? 1 : 0;
		return aIsTr - bIsTr; // TR-suffixed codes come last → override earlier entries
	});
	for (const { courseCode: code, title } of transferForCategory) {
		if (!code) continue;
		const categoryId = inferCategoryFromCodeOrTitle(code, title);
		if (categoryId) {
			if (!completedByCategory.has(categoryId)) {
				completedByCategory.set(categoryId, [code]);
			}
			// Mark as waived via transfer. TR-suffixed codes always win for waivedByMap.
			if (!reqStatusMap.has(categoryId)) {
				reqStatusMap.set(categoryId, "waived");
				waivedByMap.set(categoryId, code);
			} else if (/TR$/i.test(code) && waivedByMap.get(categoryId) !== "poe") {
				// Let the TR-suffixed code override a local-equivalent code set earlier
				waivedByMap.set(categoryId, code);
			}
		}
	}

	// Build reverse map: categoryId → in-progress course codes (from DB course_types)
	const plannedByCategory = new Map<RequirementCategoryId, string[]>();
	for (const [code, types] of inProgressTypesByCode.entries()) {
		for (const type of types) {
			const categoryId = normalizeRequirementLabel(type);
			if (!categoryId) {
				continue;
			}

			const list = plannedByCategory.get(categoryId) || [];
			list.push(code);
			plannedByCategory.set(categoryId, list);
		}
	}

	// Fallback: for in-progress codes not found in the DB catalog, infer category from prefix/title
	for (const { courseCode: code, title } of records.planned) {
		if (!code || !inProgressCodeSet.has(code)) continue;
		const categoryId = inferCategoryFromCodeOrTitle(code, title);
		if (categoryId && !plannedByCategory.has(categoryId)) {
			plannedByCategory.set(categoryId, [code]);
		}
	}

	return ALL_GEN_ED_ORDER.map((categoryId): GenEdCategoryStatus => {
		const satisfiedBy = completedByCategory.get(categoryId) || [];
		const plannedBy = plannedByCategory.get(categoryId) || [];
		let status: GenEdCategoryStatus["status"];

		const transcriptStatus = reqStatusMap.get(categoryId);
		if (transcriptStatus === "waived") {
			status = "waived";
		} else if (transcriptStatus === "completed" || satisfiedBy.length > 0) {
			status = "completed";
		} else if (transcriptStatus === "in-progress" || plannedBy.length > 0) {
			status = "in-progress";
		} else {
			status = "missing";
		}

		return {
			categoryId,
			label: CATEGORY_LABELS[categoryId],
			status,
			satisfiedBy,
			plannedBy,
			waivedBy: status === "waived" ? (waivedByMap.get(categoryId) ?? undefined) : undefined,
		};
	});
}

// ─────────────────────────────────────────────────────────────────────────────

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

// ── Milestone 1: Gen-ed filtering and elective candidate identification ──────

interface CourseFilterSets {
	/** Courses the student hasn't taken and still needs (gen-ed categories not all completed, or no gen-ed type). */
	neededCourses: Course[];
	/** Subset of neededCourses whose department prefix matches the student's POE/secondary emphasis prefixes. */
	electiveCandidates: Course[];
	/** Human-readable labels of gen-ed categories the student has already fulfilled. */
	completedGenEdCategories: string[];
}

interface RequisiteFlag {
	courseCode: string;
	unmetPrereqs: string[];
	requiredCoreqs: string[];
	requiresPermission: boolean;
}

function buildCategoryLabelMap(): Map<string, RequirementCategoryId> {
	return new Map(
		(Object.entries(CATEGORY_LABELS) as [RequirementCategoryId, string][]).map(([id, label]) => [
			label.toLowerCase(),
			id,
		]),
	);
}

function buildCompletedGenEdSet(completedRequirementMentions: string[]): Set<RequirementCategoryId> {
	const labelMap = buildCategoryLabelMap();
	const completed = new Set<RequirementCategoryId>();
	for (const mention of completedRequirementMentions) {
		const id = labelMap.get(mention.trim().toLowerCase());
		if (id) {
			completed.add(id);
		}
	}

	return completed;
}

function resolveSchedulingMode(value: string): SchedulingMode {
	const valid: SchedulingMode[] = ["balanced", "core-focused", "gen-ed-push", "fun", "ai-choice"];
	const normalized = value.trim().toLowerCase() as SchedulingMode;
	return valid.includes(normalized) ? normalized : "balanced";
}

function buildCourseFilterSets(
	courses: Course[],
	completedGenEdCategories: Set<RequirementCategoryId>,
	primaryPoes: string[],
	secondaryEmphases: string[],
): CourseFilterSets {
	// Build department-prefix set for elective candidate detection
	const electivePrefixes = new Set<string>();
	for (const poe of [...primaryPoes, ...secondaryEmphases]) {
		const profile = getPoeRequirementProfile(poe);
		if (profile) {
			for (const prefix of profile.preferredPrefixes) {
				electivePrefixes.add(prefix.toUpperCase());
			}
		}
	}

	const labelMap = buildCategoryLabelMap();
	const neededCourses: Course[] = [];
	const electiveCandidates: Course[] = [];

	for (const course of courses) {
		const courseGenEdIds = (course.course_types || [])
			.map((type) => labelMap.get(type.trim().toLowerCase()))
			.filter((id): id is RequirementCategoryId => Boolean(id));

		const prefix = (course.course_code.split("-")[0] || "").toUpperCase();
		const matchesStudentMajor = electivePrefixes.size > 0 && electivePrefixes.has(prefix);

		// Exclude the course only if ALL of its gen-ed categories are already completed
		// AND it doesn't belong to the student's major/secondary departments.
		if (
			courseGenEdIds.length > 0 &&
			courseGenEdIds.every((id) => completedGenEdCategories.has(id)) &&
			!matchesStudentMajor
		) {
			continue;
		}

		neededCourses.push(course);
		if (matchesStudentMajor) {
			electiveCandidates.push(course);
		}
	}

	const completedLabels = Array.from(completedGenEdCategories).map(
		(id) => CATEGORY_LABELS[id] ?? id,
	);

	return { neededCourses, electiveCandidates, completedGenEdCategories: completedLabels };
}

// ── Milestone 2: Prerequisite / corequisite analysis ─────────────────────────

const COURSE_CODE_REGEX = /\b([A-Z]{2,4})-?(\d{3}[A-Z]?)\b/gi;

/** Convert a term string into a numeric sort key.
 * Handles "Fall Term 2026" (DB format) and "26/FA" / "27/SP" / "26/SU" (transcript format). */
function termSortKey(term: string): number {
	// DB format: "Fall Term 2026"
	const longMatch = term.match(/(Spring|Summer|Fall)\s+Term\s+(\d{4})/i);
	if (longMatch) {
		const year = Number(longMatch[2]);
		const season = longMatch[1].toLowerCase();
		const offset = season === "spring" ? 1 : season === "summer" ? 2 : 3;
		return year * 10 + offset;
	}
	// Transcript format: "26/FA", "27/SP", "26/SU"
	const shortMatch = term.match(/^(\d{2})\/(FA|SP|SU)$/i);
	if (shortMatch) {
		const year = 2000 + Number(shortMatch[1]);
		const code = shortMatch[2].toUpperCase();
		const offset = code === "SP" ? 1 : code === "SU" ? 2 : 3;
		return year * 10 + offset;
	}
	return 0;
}

/**
 * Returns the course codes from plannedRecords whose term is strictly before
 * the scheduling term — i.e. currently in-progress courses that the student
 * will have completed before the scheduled semester begins.
 */
function getInProgressCourseCodes(
	plannedRecords: Array<{ courseCode: string; term: string }>,
	schedulingTerm: string,
): string[] {
	const targetKey = termSortKey(schedulingTerm);
	return plannedRecords
		.filter((r) => r.courseCode && termSortKey(r.term) < targetKey)
		.map((r) => r.courseCode);
}

/**
 * Returns the course codes from plannedRecords whose term exactly matches
 * the scheduling term — i.e. courses the student has already pre-registered
 * for the term they are trying to schedule.
 */
function getPreRegisteredCourseCodes(
	plannedRecords: Array<{ courseCode: string; term: string }>,
	schedulingTerm: string,
): string[] {
	const targetKey = termSortKey(schedulingTerm);
	return plannedRecords
		.filter((r) => r.courseCode && targetKey !== 0 && termSortKey(r.term) === targetKey)
		.map((r) => r.courseCode);
}

function analyzeRequisites(
	courses: Course[],
	completedCourseCodes: string[],
	inProgressCourseCodes: string[],
): RequisiteFlag[] {
	// Only completed and currently-in-progress courses satisfy prerequisites.
	// Courses registered for the scheduling term or a future term do not count.
	const allPriorCodes = new Set(
		[...completedCourseCodes, ...inProgressCourseCodes].map(normalizeCourseCode),
	);

	const flags: RequisiteFlag[] = [];

	for (const course of courses) {
		if (!course.requisites || course.requisites.length === 0) {
			continue;
		}

		const unmetPrereqs: string[] = [];
		const requiredCoreqs: string[] = [];
		let requiresPermission = false;

		for (const req of course.requisites) {
			if (/permission/i.test(req)) {
				requiresPermission = true;
				continue;
			}

			const isCoreq = /coreq/i.test(req);

			// Extract course codes from the requisite text
			const pattern = new RegExp(COURSE_CODE_REGEX.source, "gi");
			const codeMatches: string[] = [];
			let match: RegExpExecArray | null;
			while ((match = pattern.exec(req)) !== null) {
				codeMatches.push(normalizeCourseCode(`${match[1]}-${match[2]}`));
			}

			if (codeMatches.length === 0) {
				continue;
			}

			// For OR conditions, any one alias being met satisfies the requirement
			const allAliases = codeMatches.flatMap((code) => getCourseCodeAliases(code));
			const anySatisfied = allAliases.some((alias) => allPriorCodes.has(alias));

			if (!anySatisfied) {
				if (isCoreq) {
					requiredCoreqs.push(...codeMatches);
				} else {
					unmetPrereqs.push(...codeMatches);
				}
			}
		}

		if (unmetPrereqs.length > 0 || requiredCoreqs.length > 0 || requiresPermission) {
			flags.push({
				courseCode: course.course_code,
				unmetPrereqs: [...new Set(unmetPrereqs)],
				requiredCoreqs: [...new Set(requiredCoreqs)],
				requiresPermission,
			});
		}
	}

	return flags;
}

function buildPoeReferenceUrls(poes: string[]): string[] {
	return poes
		.filter(Boolean)
		.map((poe) => {
			const slug = poe.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
			return `https://www.juniata.edu/academics/${slug}/${slug}-courses.php`;
		});
}

// ─────────────────────────────────────────────────────────────────────────────

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
	schedulingMode: SchedulingMode;
	guidance: string;
	explicitRequestedCourseCodes: string[];
	transcriptEvidence: TranscriptEvidence;
	availableCourses: ReturnType<typeof buildPromptCourses>;
	electiveCandidateCodes: string[];
	completedGenEdCategories: string[];
	requisiteFlags: RequisiteFlag[];
	poeReferenceUrls: string[];
	/** Optional: pre-registered course context block to inject into the prompt */
	userChosenContext?: string;
	/** Credits already locked in by user-chosen courses; model should fill around this */
	userChosenCredits?: number;
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
	const targetCreditsText = creditPreference.targetCredits === null?
		"not specified" :
		String(creditPreference.targetCredits);
	
	let creditRangeText: string;
	if (creditPreference.minCredits !== null && creditPreference.maxCredits !== null) {
		creditRangeText = `${creditPreference.minCredits}-${creditPreference.maxCredits}`;
	} else if (creditPreference.minCredits !== null) {
		creditRangeText = `${creditPreference.minCredits}+`;
	} else if (creditPreference.maxCredits !== null) {
		creditRangeText = `<=${creditPreference.maxCredits}`;
	} else {
		creditRangeText = "open";
	}

	const modeRules: Record<SchedulingMode, string> = {
		"balanced": "Balance POE core requirements, gen-ed fulfillment, secondary emphasis courses, and electives. Typical mix: 2-3 core/major courses + 1-2 outstanding gen-eds + 1 secondary emphasis course + 1 elective.",
		"core-focused": "PRIORITY: Maximize coverage of required POE core courses. Fill the schedule with major requirements first. Only include gen-eds or electives if credits must be filled or the student explicitly requests them.",
		"gen-ed-push": "PRIORITY: Fill as many outstanding gen-ed requirement categories as possible. Schedule gen-ed courses first, then add major courses to meet the credit target.",
		"fun": "Build a light, enjoyable schedule. Prefer interesting electives and lower-stakes courses. Include at most 1-2 required courses; respect the credit range.",
		"ai-choice": "Use your best judgment to construct the optimal schedule. Consider class year, POE requirements, completed gen-eds, transcript evidence, secondary emphases, and student guidance. Explain your reasoning thoroughly.",
	};

	const requisiteSummary = payload.requisiteFlags.length > 0
		? payload.requisiteFlags.map((flag) => {
			const parts: string[] = [`${flag.courseCode}:`];
			if (flag.unmetPrereqs.length > 0) {
				parts.push(`unmet prerequisites — ${flag.unmetPrereqs.join(", ")}`);
			}
			if (flag.requiredCoreqs.length > 0) {
				parts.push(`required corequisites — ${flag.requiredCoreqs.join(", ")}`);
			}
			if (flag.requiresPermission) {
				parts.push("requires instructor permission");
			}

			return parts.join(" ");
		}).join("\n")
		: "None detected.";

	// Build the catalog payload without redundant fields already summarized above
	const { requisiteFlags: _rf, poeReferenceUrls: _pru, electiveCandidateCodes: _ecc, completedGenEdCategories: _cgc, userChosenContext: _ucc, userChosenCredits: _ucr, explicitRequestedCourseCodes: _erc, ...corePayload } = payload;

	const schedulerPrompt = [
		"You are AlfieAI Courses.",
		"Build one term schedule using only courses from the provided catalog.",
		"Return ONLY valid JSON matching the required schema. Do not include markdown, prose outside JSON, or extra keys.",
		"",
		"═══ STUDENT CONTEXT ═══",
		`Primary POEs: ${payload.primaryPoes.join(", ")}`,
		`Secondary emphases: ${payload.secondaryEmphases.length > 0 ? payload.secondaryEmphases.join(", ") : "None"}`,
		`Credit preference: ${creditPreference.profile} (${creditPreference.label}) — range ${creditRangeText}, target ${targetCreditsText} credits`,
		...(payload.userChosenCredits && payload.userChosenCredits > 0
			? [`Pre-registered credits (already locked in): ${payload.userChosenCredits} credits — your recommendations cover the REMAINING credits only.`]
			: []
		),
		`Scheduling mode: ${payload.schedulingMode}`,
		`Mode instructions: ${modeRules[payload.schedulingMode]}`,
		payload.explicitRequestedCourseCodes.length > 0
			? `Explicitly requested courses that must be honored when offered: ${payload.explicitRequestedCourseCodes.join(", ")}`
			: "No explicitly requested courses were provided.",
		"",
		"═══ POE REQUIREMENTS REFERENCES ═══",
		payload.poeReferenceUrls.length > 0
			? `Use your knowledge of these Juniata POE program pages when deciding which courses fulfill core requirements: ${payload.poeReferenceUrls.join(", ")}`
			: "No POE reference URLs available.",
		"",
		"═══ GEN-ED STATUS ═══",
		payload.completedGenEdCategories.length > 0
			? `Already fulfilled (do not prioritize courses whose only value is filling these categories): ${payload.completedGenEdCategories.join(", ")}`
			: "No completed gen-ed categories detected from transcript.",
		"",
		"═══ STRONG ELECTIVE CANDIDATES ═══",
		payload.electiveCandidateCodes.length > 0
			? `The following courses match the student's major/secondary department prefixes — treat them as high-value electives when filling the schedule: ${payload.electiveCandidateCodes.join(", ")}`
			: "No specific elective candidates identified.",
		"",
		"═══ PREREQUISITE / COREQUISITE FLAGS ═══",
		requisiteSummary,
		...(payload.userChosenContext
			? ["", payload.userChosenContext]
			: []
		),
		"",
		"═══ SCHEDULING RULES ═══",
		"1) Include both primary (first-choice) and backup courses in results.courses.",
		"2) Use primary=true for first-choice schedule courses, primary=false for backup alternatives.",
		"3) Use only course codes present in availableCourses.",
		"4) NEVER recommend any course whose course_code appears in transcriptEvidence.excludedCourseCodes — these are completed, in-progress, pre-registered, or transfer-equivalent courses.",
		"5) Primary courses MUST NOT conflict — no two primary courses may share a day with overlapping start/end times.",
		"6) Honor the credit range and target credits as hard constraints. Only deviate if impossible, and explain why in reasoning.",
		"6b) Treat student guidance in guidance as hard-priority preferences (e.g., time-of-day, workload balance, course style). Only violate guidance if impossible, and explicitly state why.",
		"7) PREREQUISITE RULE: Do NOT recommend courses listed under 'unmet prerequisites' above unless instructor permission is also flagged. If permission is flagged, you may include the course but note the prerequisite situation in reasoning.",
		"8) COREQUISITE RULE: If you schedule a course with required corequisites, you MUST also include the corequisite(s) in the same schedule.",
		"9) PRIORITY ORDER (adjust weighting per schedulingMode):",
		"   a) POE core requirements not yet completed (consult poeReferenceUrls and transcript evidence)",
		"   b) Gen-ed categories not yet fulfilled (completedGenEdCategories lists what to avoid re-filling)",
		"   c) Secondary emphasis courses",
		"   d) Electives from electiveCandidateCodes",
		"   e) Other available electives",
		"10) If the student has completed or is currently enrolled in a Connections course (CONN-XXX), do NOT recommend additional Connections courses.",
		"11) results.reasoning must explain how the selected courses satisfy the student's goals, POE requirements, and scheduling mode.",
		"12) If explicitRequestedCourseCodes is non-empty, include each requested course as primary when available in this term. Only place a requested course in backup if it directly conflicts with another requested course, and explain why.",
		"",
		"═══ CATALOG PAYLOAD ═══",
		JSON.stringify(corePayload),
	].join("\n");

	const response = await genAI.models.generateContent({
		model: model,
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

function toScheduleCourse(course: Course, primary: boolean, term: string, preferOpenSections: boolean, selectionSource?: "user" | "alfie"): ScheduleCourseResult {
	const result: ScheduleCourseResult = {
		courseCode: course.course_code,
		title: course.title,
		description: course.description,
		credits: Number(course.credits?.minimum || 0),
		categories: course.course_types || [],
		primary,
		section: selectBestSection(course, term, preferOpenSections),
	};
	if (selectionSource !== undefined) {
		result.selectionSource = selectionSource;
	}
	return result;
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
		const schedulingMode = resolveSchedulingMode(getString(formData, "schedulingMode"));
		const creditPreference = resolveCreditPreference(formData);
		// Comma-separated course codes the student has already pre-registered for (User's Choice mode)
		const rawUserChosenCourses = getString(formData, "userChosenCourses");
		let userChosenCourseCodes = rawUserChosenCourses
			.split(/[\s,]+/)
			.map((c) => c.trim().toUpperCase().replace(/\s+/g, "-"))
			.filter((c) => Boolean(c) && c !== "TRUE" && c !== "FALSE");
		const alwaysIncludeCourseCodes = getString(formData, "alwaysIncludeCourses")
			.split(/[\s,]+/)
			.map((c) => normalizeCourseCode(c))
			.filter(Boolean);
		const guidanceRequestedCourseCodes = extractCourseCodesFromText(guidance);
		const explicitRequestedCourseCodes = Array.from(new Set([
			...alwaysIncludeCourseCodes,
			...guidanceRequestedCourseCodes,
		]));
		userChosenCourseCodes = Array.from(new Set(userChosenCourseCodes.map((code) => normalizeCourseCode(code)).filter(Boolean)));

		if (!term) {
			return NextResponse.json({ error: "A term is required to generate a schedule." }, { status: 400 });
		}
		if (primaryPoes.length === 0) {
			return NextResponse.json({ error: "Please choose at least one primary POE before generating your schedule." }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
		const courses = db.collection<Course>(process.env.MONGODB_COURSES_COLLECTION || "courses");
		const professors = db.collection<ProfessorNameRecord>(process.env.MONGODB_PROFESSORS_COLLECTION || "professors");

		const transcriptFile = formData.get("degreeProgressFile") || formData.get("transcriptFile");
		if (!(transcriptFile instanceof File) || transcriptFile.size <= 0) {
			return NextResponse.json({ error: "Self-Service Degree Progress PDF is required to generate a schedule." }, { status: 400 });
		}

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

		const availableCoursesPromise = courses.aggregate<Course>([
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
			getInstructorLookup(professors),
		]);

		const availableCoursesWithResolvedInstructors = resolveCourseInstructorNames(availableCourses, instructorLookup);

		const transcriptEvidence = collectTranscriptEvidence(transcriptText);
		// Parse the structured records separately so we can use them for degree-progress enrichment
		const transcriptRecords = transcriptText.trim() ? parseStructuredTranscriptRecords(transcriptText) : { completed: [], planned: [], transfer: [], requirements: [], poeSections: [] };

		// Detect courses the student has already pre-registered for the scheduling term.
		// These are kept as backup suggestions — they are NOT auto-promoted to User's Choice (primary).
		const pdfPreRegisteredCodes = getPreRegisteredCourseCodes(transcriptRecords.planned, term);
		const normalizedPdfCodes = pdfPreRegisteredCodes.map((c) => c.trim().toUpperCase().replace(/\s+/g, "-"));
		// Track which were auto-detected (vs. manually entered) for the response notice
		const autoDetectedCodes = normalizedPdfCodes.filter((c) => !userChosenCourseCodes.includes(c));
		const lockedRequestedCourseCodes = Array.from(new Set([
			...userChosenCourseCodes,
			...explicitRequestedCourseCodes,
		]));

		const completedAliases = new Set(transcriptEvidence.completedCourseCodes.flatMap((courseCode) => getCourseCodeAliases(courseCode)));
		const plannedAliases = new Set(transcriptEvidence.plannedCourseCodes.flatMap((courseCode) => getCourseCodeAliases(courseCode)));
		const transferAliases = new Set(transcriptEvidence.transferCourseCodes.flatMap((courseCode) => getCourseCodeAliases(courseCode)));
		const excludedAliases = new Set(transcriptEvidence.excludedCourseCodes.flatMap((courseCode) => getCourseCodeAliases(courseCode)));
		// Exclude user-locked courses from model recommendations (the model fills AROUND them)
		for (const code of lockedRequestedCourseCodes) {
			for (const alias of getCourseCodeAliases(code)) {
				excludedAliases.add(alias);
			}
		}
		// Also exclude auto-detected pre-registered courses so the model doesn't double-suggest them
		for (const code of autoDetectedCodes) {
			for (const alias of getCourseCodeAliases(code)) {
				excludedAliases.add(alias);
			}
		}
		const transcriptEvidenceForModel: TranscriptEvidence = {
			...transcriptEvidence,
			completedCourseCodes: Array.from(completedAliases),
			plannedCourseCodes: Array.from(plannedAliases),
			transferCourseCodes: Array.from(transferAliases),
			excludedCourseCodes: Array.from(excludedAliases),
			transferMentions: Array.from(transferAliases),
		};

		// Fetch course_types for completed, planned, AND transfer codes (no term filter) to build gen-ed status
		const allHistoricalCodes = [
			...transcriptEvidence.completedCourseCodes,
			...transcriptEvidence.plannedCourseCodes,
			...transcriptEvidence.transferCourseCodes,
		];
		const historicalCourseTypesLookup: Map<string, string[]> = new Map();
		if (allHistoricalCodes.length > 0) {
			const historicalCourses = await courses.find(
				{ course_code: { $in: allHistoricalCodes } },
				{ projection: { course_code: 1, course_types: 1, _id: 0 } },
			).toArray();
			for (const c of historicalCourses) {
				if (c.course_code && Array.isArray(c.course_types)) {
					historicalCourseTypesLookup.set(normalizeCourseCode(c.course_code), c.course_types as string[]);
				}
			}
		}

		const completedTypesByCode = new Map<string, string[]>();
		for (const code of transcriptEvidence.completedCourseCodes) {
			const types = historicalCourseTypesLookup.get(normalizeCourseCode(code));
			if (types) {
				completedTypesByCode.set(code, types);
			}
		}
		// Transfer credits also satisfy gen-ed requirements
		for (const code of transcriptEvidence.transferCourseCodes) {
			const types = historicalCourseTypesLookup.get(normalizeCourseCode(code));
			if (types && !completedTypesByCode.has(code)) {
				completedTypesByCode.set(code, types);
			}
		}

		// If a completed/transfer course is a POE capstone course, inject "Capstone" type so the
		// gen-ed Capstone badge is marked completed even when the catalog entry lacks that type.
		{
			const capstoneCodeSet = new Set<string>();
			for (const poeName of [...primaryPoes, ...secondaryEmphases]) {
				const profile = getPoeRequirementProfile(poeName);
				if (profile) {
					for (const code of getPoeCapstoneCourseCodes(profile)) {
						capstoneCodeSet.add(normalizeCourseCode(code));
					}
				}
			}
			if (capstoneCodeSet.size > 0) {
				const allCompletedAndTransfer = [
					...transcriptEvidence.completedCourseCodes,
					...transcriptEvidence.transferCourseCodes,
				];
				for (const code of allCompletedAndTransfer) {
					if (capstoneCodeSet.has(normalizeCourseCode(code))) {
						const existing = completedTypesByCode.get(code) || [];
						if (!existing.includes("Capstone")) {
							completedTypesByCode.set(code, [...existing, "Capstone"]);
						}
					}
				}
			}
		}

		// For gen-ed status: only count courses currently in-progress (term < scheduling term).
		// Future-registered courses should not satisfy a core requirement.
		const inProgressCodes = new Set(getInProgressCourseCodes(transcriptRecords.planned, term));
		const inProgressTypesByCode = new Map<string, string[]>();
		for (const code of transcriptEvidence.plannedCourseCodes) {
			if (!inProgressCodes.has(code)) continue;
			const types = historicalCourseTypesLookup.get(normalizeCourseCode(code));
			if (types) {
				inProgressTypesByCode.set(code, types);
			}
		}

		if (availableCoursesWithResolvedInstructors.length === 0) {
			return NextResponse.json({ error: `No course offerings were found for ${term}.` }, { status: 404 });
		}

		// Remove completed/planned/transfer-equivalent courses from the catalog sent to the model
		// Also exclude by normalized title to catch courses that changed numbers
		const completedTitleSet = new Set<string>(
			transcriptRecords.completed
				.map((r) => normalizeNameToken(r.title))
				.filter((t) => t.length >= 4),
		);
		const takenFoundationalTopics = new Set<string>();
		for (const record of [...transcriptRecords.completed, ...transcriptRecords.transfer]) {
			const key = inferFoundationalTopicKey(record.courseCode || "", record.title || "");
			if (key) {
				takenFoundationalTopics.add(key);
			}
		}
		const explicitRequestedAliasSet = new Set<string>(
			explicitRequestedCourseCodes.flatMap((code) => getCourseCodeAliases(code)),
		);
		const blockedByTakenTopic = new Set<string>();
		const filteredCourses = availableCoursesWithResolvedInstructors.filter((c) => {
			const aliases = getCourseCodeAliases(c.course_code);
			if (excludedAliases.size > 0 && aliases.some((alias) => excludedAliases.has(alias))) {
				return false;
			}
			if (completedTitleSet.size > 0) {
				const normalizedCatalogTitle = normalizeNameToken(c.title);
				if (normalizedCatalogTitle.length >= 4 && completedTitleSet.has(normalizedCatalogTitle)) {
					return false;
				}
			}
			const topicKey = inferFoundationalTopicKey(c.course_code || "", c.title || "");
			if (shouldBlockTopicRecommendation(topicKey, takenFoundationalTopics)) {
				const explicitlyRequested = aliases.some((alias) => explicitRequestedAliasSet.has(alias));
				if (!explicitlyRequested) {
					if (topicKey) {
						blockedByTakenTopic.add(topicKey);
					}
					return false;
				}
			}
			return true;
		});

		if (filteredCourses.length === 0) {
			return NextResponse.json(
				{ error: "All available courses for this term appear to already be completed, planned, or transfer-equivalent based on your transcript." },
				{ status: 422 },
			);
		}

		// M1: Further filter out courses that only serve already-completed gen-ed categories,
		// and identify elective candidates matching the student's major/secondary prefixes.
		const completedGenEdSet = buildCompletedGenEdSet(transcriptEvidence.completedRequirementMentions);
		const filterSets = buildCourseFilterSets(filteredCourses, completedGenEdSet, primaryPoes, secondaryEmphases);
		// Fall back to the full filtered list if gen-ed filtering is too aggressive
		const coursesForModel = filterSets.neededCourses.length > 0 ? filterSets.neededCourses : filteredCourses;

		// M2: Analyze prerequisite / corequisite requirements.
		// Only completed courses and courses currently in-progress (term < scheduling term)
		// satisfy prerequisites — future registrations do not count.
		const requisiteFlags = analyzeRequisites(
			coursesForModel,
			transcriptEvidence.completedCourseCodes,
			Array.from(inProgressCodes),
		);
		const poeReferenceUrls = buildPoeReferenceUrls([...primaryPoes, ...secondaryEmphases]);

		// Resolve locked user-requested courses from available offerings for this term.
		// Sources include: explicit course picker requests and course codes typed in academic goals.
		const userChosenScheduleResults: ScheduleCourseResult[] = [];
		const userChosenWarnings: string[] = [];
		if (lockedRequestedCourseCodes.length > 0) {
			for (const code of lockedRequestedCourseCodes) {
				const normalizedCode = normalizeCourseCode(code);
				const found = availableCoursesWithResolvedInstructors.find(
					(c) => normalizeCourseCode(c.course_code) === normalizedCode ||
						getCourseCodeAliases(c.course_code).some((a) => normalizeCourseCode(a) === normalizedCode),
				);
				if (found) {
					userChosenScheduleResults.push(toScheduleCourse(found, true, term, preferOpenSections, "user"));
				} else {
					userChosenWarnings.push(`Requested course ${code} was not found in ${term} offerings and could not be locked.`);
				}
			}
		}

		// Resolve auto-detected pre-registered courses as backup suggestions (primary: false)
		const autoDetectedScheduleResults: ScheduleCourseResult[] = [];
		if (autoDetectedCodes.length > 0) {
			for (const code of autoDetectedCodes) {
				const normalizedCode = normalizeCourseCode(code);
				const found = availableCoursesWithResolvedInstructors.find(
					(c) => normalizeCourseCode(c.course_code) === normalizedCode ||
						getCourseCodeAliases(c.course_code).some((a) => normalizeCourseCode(a) === normalizedCode),
				);
				if (found) {
					autoDetectedScheduleResults.push(toScheduleCourse(found, false, term, preferOpenSections));
				}
			}
		}

		// Build context summary for the model about locked requested courses
		const userChosenContextLines: string[] = [];
		if (userChosenScheduleResults.length > 0) {
			const userChosenCredits = userChosenScheduleResults.reduce((sum, c) => sum + c.credits, 0);
			userChosenContextLines.push(
				"═══ LOCKED COURSES (EXPLICIT USER REQUESTS) ═══",
				"The student explicitly requested the following courses for this term:",
				...userChosenScheduleResults.map((c) => `  ${c.courseCode}: ${c.title} (${c.credits} credits, meets: ${c.section.meetings[0] || "TBA"})`),
				`These account for ${userChosenCredits} credit(s). Do NOT include any of these codes in your recommendations.`,
				"Treat these as locked unless unavailable; suggest ONLY additional complementary courses.",
			);
		}

		const modelOutput = await generateModelSchedule({
			term,
			primaryPoes,
			secondaryEmphases,
			creditPreference,
			schedulingMode,
			guidance: guidance || "No explicit student guidance provided.",
			explicitRequestedCourseCodes,
			transcriptEvidence: transcriptEvidenceForModel,
			availableCourses: buildPromptCourses(coursesForModel),
			electiveCandidateCodes: filterSets.electiveCandidates.map((c) => c.course_code),
			completedGenEdCategories: filterSets.completedGenEdCategories,
			requisiteFlags,
			poeReferenceUrls,
			userChosenContext: userChosenContextLines.length > 0 ? userChosenContextLines.join("\n") : undefined,
			userChosenCredits: userChosenScheduleResults.reduce((sum, c) => sum + c.credits, 0),
		});

		const normalizedSelection = normalizeSelection(modelOutput.results.courses);
		if (normalizedSelection.length === 0) {
			return NextResponse.json(
				{ error: "AlfieAI did not return any course recommendations for this request." },
				{ status: 422 }
			);
		}

		const selectedCodes = normalizedSelection.map((item) => item.course_code);
		const selectedCourses = await courses.aggregate<Course>([
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
		// Surface any user-chosen course warnings
		for (const w of userChosenWarnings) {
			warnings.push(w);
		}

		// Determine if we're in User's Choice mode (for badge labeling)
		const isUserChosenMode = userChosenScheduleResults.length > 0;

		const allSelectedCourses: ScheduleCourseResult[] = [];
		for (const item of normalizedSelection) {
			const course = selectedMap.get(item.course_code);
			if (!course) {
				warnings.push(`Model recommended ${item.course_code}, but it was not found in ${term} offerings.`);
				continue;
			}

			allSelectedCourses.push(toScheduleCourse(course, item.primary, term, preferOpenSections, isUserChosenMode ? "alfie" : undefined));
		}

		// Defensive post-filter: remove any course the student already has (in-progress or planned).
		// This guards against model hallucinations that slip past the catalog exclusion.
		const filteredModelCourses = allSelectedCourses.filter((c) => {
			const aliases = getCourseCodeAliases(c.courseCode);
			return !aliases.some((a) => plannedAliases.has(a));
		});

		// Merge user-chosen (primary, front) + model results, skipping any model course that
		// conflicts with a user-chosen code.
		const userChosenNormalizedCodes = new Set(
			userChosenScheduleResults.map((c) => normalizeCourseCode(c.courseCode)),
		);
		const mergedModelCourses = filteredModelCourses.filter(
			(c) => !userChosenNormalizedCodes.has(normalizeCourseCode(c.courseCode)),
		);
		const mergedModelNormalizedCodes = new Set(mergedModelCourses.map((c) => normalizeCourseCode(c.courseCode)));
		const mergedCourses: ScheduleCourseResult[] = [
			...userChosenScheduleResults,
			...mergedModelCourses,
			// Auto-detected pre-registered courses appear as backup suggestions (deduplicated)
			...autoDetectedScheduleResults.filter(
				(c) => !userChosenNormalizedCodes.has(normalizeCourseCode(c.courseCode)) &&
					!mergedModelNormalizedCodes.has(normalizeCourseCode(c.courseCode)),
			),
		];

		if (mergedCourses.length === 0) {
			return NextResponse.json(
				{ error: "No model-selected courses could be matched to term offerings." },
				{ status: 422 }
			);
		}

		let primaryCourses = mergedCourses.filter((course) => course.primary);
		if (primaryCourses.length === 0 && mergedCourses.length > 0) {
			mergedCourses[0].primary = true;
			primaryCourses = [mergedCourses[0]];
			warnings.push("No primary courses were marked by the model, so the first selected course was promoted to primary.");
		}

		// Enforce no-overlap among primary courses — demote conflicting ones to backup
		const confirmedPrimary: ScheduleCourseResult[] = [];
		for (const candidate of primaryCourses) {
			// User's Choice courses are never demoted — their conflicts remain visible
			const isUserChoice = candidate.selectionSource === "user";
			const conflicting = confirmedPrimary.find((placed) =>
				scheduleCoursesMeetingConflict(placed, candidate)
			);
			if (conflicting && !isUserChoice) {
				candidate.primary = false;
				warnings.push(
					`${candidate.courseCode} was moved to backup — it conflicts with ${conflicting.courseCode}.`
				);
			} else {
				confirmedPrimary.push(candidate);
			}
		}
		primaryCourses = confirmedPrimary;

		// Compute pre-planned credits before credit pruning (user-chosen are always kept)
		const prePlannedCredits = userChosenScheduleResults.reduce((sum, c) => sum + Number(c.credits || 0), 0);

		// Run credit preference optimizer only on non-user-chosen courses so that
		// user's pre-planned courses are never demoted even if they exceed the limit.
		const userChosenInMerged = mergedCourses.filter((c) => c.selectionSource === "user");
		const nonUserCoursesInMerged = mergedCourses.filter((c) => c.selectionSource !== "user");

		// Determine the effective credit ceiling: prefer maxCredits, then targetCredits, then minCredits.
		const effectiveCreditTarget =
			creditPreference.maxCredits ??
			creditPreference.targetCredits ??
			creditPreference.minCredits ??
			null;

		if (effectiveCreditTarget !== null && prePlannedCredits >= effectiveCreditTarget) {
			// Pre-planned courses already meet/exceed the target — demote all model-selected
			// courses to backup so the user's schedule isn't padded beyond their credit limit.
			for (const c of nonUserCoursesInMerged) { c.primary = false; }
			warnings.push(
				`Locked requested courses account for ${prePlannedCredits} credits, which meets or exceeds the target of ${effectiveCreditTarget}. AlfieAI's suggestions have been moved to backup.`
			);
		} else {
			// There is still credit headroom — fill it with model-selected courses as normal.
			const creditAdjustmentNotes = applyCreditPreferenceToSelection(nonUserCoursesInMerged, creditPreference);
			warnings.push(...creditAdjustmentNotes);
		}

		// Ensure user-chosen courses always remain primary
		for (const c of userChosenInMerged) { c.primary = true; }
		primaryCourses = mergedCourses.filter((course) => course.primary);

		const backupCourses = mergedCourses.filter((course) => !course.primary);
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
			explicitRequestedCourseCodes.length > 0
				? `Explicitly requested course codes detected: ${explicitRequestedCourseCodes.join(", ")}. These were locked when offered this term.`
				: "No explicit course-code requests were detected in the form.",
			guidance.trim()
				? "Academic goals guidance was treated as a hard-priority preference unless impossible with term offerings."
				: "No academic goals guidance text was provided.",
			`Credit load preference: ${creditPreference.label} (target range ${creditRangeText}, planned primary total ${finalPrimaryCredits}).`,
			`Scheduling mode: ${schedulingMode}.`,
			`AlfieAI selected ${mergedCourses.length} matched courses (${primaryCourses.length} primary, ${backupCourses.length} backup).`,
			filterSets.completedGenEdCategories.length > 0
				? `Gen-ed filtering excluded courses that only serve already-completed categories: ${filterSets.completedGenEdCategories.join(", ")}.`
				: "No completed gen-ed categories were detected from transcript.",
			transcriptEvidence.transcriptDetected
				? `Degree-progress evidence recognized ${transcriptEvidence.completedCourseCodes.length} completed, ${transcriptEvidence.plannedCourseCodes.length} planned, and ${transcriptEvidence.transferCourseCodes.length} transfer-equivalent courses; ${transcriptEvidence.completedRequirementMentions.length} completed requirement categories were also deprioritized.`
				: "No parsed degree-progress evidence was available for this run.",
			blockedByTakenTopic.size > 0
				? `Foundational-topic dedupe excluded repeat recommendations for: ${Array.from(blockedByTakenTopic).join(", ")}.`
				: "",
		].filter(Boolean);

		const response: ScheduleGenerationResult = {
			term,
			poe,
			primaryPoes,
			secondaryEmphases,
			creditPreference,
			schedulingMode,
			guidance,
			reasoning: modelOutput.results.reasoning,
			primaryCourses,
			backupCourses,
			allSelectedCourses: mergedCourses,
			requirementsProgress: {
				transcriptDetected: transcriptEvidence.transcriptDetected,
				degreeProgram: poe,
				completedCourses: transcriptRecords.completed.map((r): TranscriptCourseRecord => ({
					courseCode: r.courseCode,
					title: r.title,
					credits: parseCredits(r.credits),
					grade: r.grade,
					term: r.term,
				})),
				plannedCourses: transcriptRecords.planned.map((r): TranscriptPlannedRecord => ({
					courseCode: r.courseCode,
					title: r.title,
					term: r.term,
				})),
				transferCourses: transcriptRecords.transfer
					// Exclude local equivalent codes (e.g. FYC-101) that the AI picks up
					// from the "equivalent course" column of the transfer section.
					// Keep a record only if it has credits OR its code ends in TR / starts with AP-.
					.filter((r) => parseCredits(r.credits) > 0 || /TR$/i.test(r.courseCode) || /^AP-/i.test(r.courseCode))
					.map((r): TranscriptTransferRecord => ({
					courseCode: r.courseCode,
					title: r.title,
					credits: parseCredits(r.credits),
					term: r.term,
				})),
				completedCredits: transcriptRecords.completed.reduce((sum, r) => sum + parseCredits(r.credits), 0),
				transferCredits: (() => {
					const { totalCredits, schoolCredits, completed, transfer } = transcriptRecords;
					// Primary: sum credits directly from transfer records — most accurate
					// when the AI correctly parses per-course credit values.
					const perRecordSum = transfer.reduce((sum, r) => sum + parseCredits(r.credits), 0);
					if (perRecordSum > 0) return perRecordSum;
					// Fallback: derive from CREDIT_TOTALS when per-record credits are unavailable
					if (totalCredits != null && schoolCredits != null) {
						return Math.max(0, totalCredits - schoolCredits);
					}
					if (totalCredits != null) {
						const earnedCredits = completed.reduce((sum, r) => sum + parseCredits(r.credits), 0);
						return Math.max(0, totalCredits - earnedCredits);
					}
					return 0;
				})(),
				gpa: computeGpa(transcriptRecords.completed),
				genEdStatus: buildGenEdStatus(transcriptRecords, completedTypesByCode, inProgressTypesByCode, inProgressCodes, [...primaryPoes, ...secondaryEmphases]),
				// Legacy fields
				completedCourseCodes: transcriptEvidence.completedCourseCodes,
				requirementMentions: transcriptEvidence.requirementMentions,
				transferMentions: transcriptEvidence.transferMentions,
				completedByTerm: transcriptEvidence.completedByTerm,
				poeProgress: buildPoeProgress([...primaryPoes, ...secondaryEmphases], primaryPoes, transcriptRecords, term),
				studentId: transcriptRecords.studentId,
			} satisfies ScheduleRequirementsProgress,
			notes,
			warnings,
			modelSelection: normalizedSelection,
			...(autoDetectedCodes.length > 0 ? { detectedPreRegisteredCourses: autoDetectedCodes } : {}),
			...(prePlannedCredits > 0 ? { prePlannedCredits } : {}),
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
