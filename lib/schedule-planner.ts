import { departmentCodes } from "@/lib/course-schema";
import {
	CATEGORY_LABELS,
	DualDegreeStatus,
	EntryType,
	FIXED_REQUIREMENT_ORDER,
	RequirementCategoryId,
	RequirementCounts,
	StudyAbroadStatus,
	SW_CATEGORIES,
	WK_CATEGORIES,
	createRequirementCounts,
	getBaseRequirementCounts,
	getFirstYearExperienceWaivers,
	getPoeWaiverOptions,
	getStepDownWaivers,
	inferRequirementCategories,
	isSwCategory,
	isWkCategory,
	normalizeRequirementLabel,
} from "@/lib/gen-ed-rules";
import { Course } from "@/lib/models/course";
import {
	evaluatePoeRequirements,
	getPoeCapstoneCourseCodes,
	getPoeRequirementProfile,
	scoreCourseForPoe,
	type PoeCourseLike,
	type PoeEvaluation,
	type PoeRequirementProgressItem,
} from "@/lib/poe-requirements";

type CourseSection = Course["sections"][number];
type MeetingInfo = CourseSection["meeting_info"][number];
type WeekdayCode = "M" | "T" | "W" | "Th" | "F";

interface ParsedPromptCourseCodes {
	completed: string[];
	requested: string[];
}

interface ParsedTranscriptCourseInfo {
	completed: string[];
	requestedForSelectedTerm: string[];
	satisfiedCategories: RequirementCategoryId[];
}

interface PlannerIntent {
	completedCourseCodes: string[];
	requestedCourseCodes: string[];
	preferredDepartments: string[];
	targetCredits: number;
	minCredits: number;
	maxCredits: number;
	targetCourseCount: number;
	minCourseCount: number;
	maxCourseCount: number;
	preferMorning: boolean;
	preferAfternoon: boolean;
	earliestStartMinutes: number | null;
	latestEndMinutes: number | null;
	avoidDays: WeekdayCode[];
	openSeatsOnly: boolean;
	manualSatisfiedCategories: RequirementCategoryId[];
}

interface NormalizedCourse {
	id: string;
	courseCode: string;
	baseCode: string;
	title: string;
	description: string;
	prefix: string;
	credits: number;
	academicLevel: string;
	requirementOptions: RequirementCategoryId[];
	requisiteCodes: string[];
	requisitesText: string;
	sections: CourseSection[];
}

interface RequirementAssignment {
	category: RequirementCategoryId;
	courseKey: string;
	courseCode: string;
	title: string;
}

interface RequirementCoverage {
	counts: RequirementCounts;
	assignments: RequirementAssignment[];
	usedCourseKeys: Set<string>;
	usedWkPrefixes: Set<string>;
}

interface RequirementState {
	baseCounts: RequirementCounts;
	completedCounts: RequirementCounts;
	requiredAfterWaivers: RequirementCounts;
	waivedCounts: RequirementCounts;
	remainingBeforePlan: RequirementCounts;
	completedWkPrefixes: Set<string>;
	completedAssignments: RequirementAssignment[];
	waiverSummary: string[];
}

interface ScheduleOffering {
	course: NormalizedCourse;
	section: CourseSection;
	sectionKey: string;
	baseScore: number;
	sectionScore: number;
	poeReasons: string[];
}

interface BeamSchedule {
	offerings: ScheduleOffering[];
	courseKeys: Set<string>;
	sectionKeys: Set<string>;
	totalCredits: number;
	score: number;
}

export interface SchedulePlanningRequest {
	term: string;
	prompt?: string;
	transcriptText?: string;
	poe?: string;
	entryType?: EntryType;
	incomingCredits?: number;
	incomingCompositionCredits?: number;
	targetCredits?: number;
	studyAbroad?: StudyAbroadStatus;
	dualDegree?: DualDegreeStatus;
	legacyBlanketWaiver?: boolean;
	openSeatsOnly?: boolean;
	completedCourseCodes?: string[];
}

export interface PlannedCourse {
	courseCode: string;
	title: string;
	credits: number;
	categories: string[];
	reasons: string[];
	section: {
		sectionName: string;
		term: string;
		status: string;
		location: string;
		openSeats: number;
		capacity: number;
		waitlisted: number;
		instructors: string[];
		meetings: string[];
	};
}

export interface RequirementStatusItem {
	id: RequirementCategoryId;
	label: string;
	required: number;
	completedBeforePlan: number;
	plannedNow: number;
	waived: number;
	remainingAfterPlan: number;
}

export interface AlternativeSuggestion {
	requirement: string;
	options: Array<{
		courseCode: string;
		title: string;
		credits: number;
		meetings: string[];
		reason: string;
	}>;
}

export interface SchedulePlanningResult {
	term: string;
	recognized: {
		completedCourseCodes: string[];
		requestedCourseCodes: string[];
		preferredDepartments: string[];
		targetCredits: number;
		targetCourseCount: number;
	};
	schedule: {
		totalCredits: number;
		courseCount: number;
		courses: PlannedCourse[];
	};
	requirements: RequirementStatusItem[];
	poeProgress: null | {
		poe: string;
		catalogSource: string;
		poeCreditTotal: string;
		minimumUpperLevelCredits?: number;
		requirements: PoeRequirementProgressItem[];
		notes: string[];
	};
	waiverSummary: string[];
	warnings: string[];
	alternatives: AlternativeSuggestion[];
	notes: string[];
}

const COURSE_CODE_REGEX = /\b([A-Z]{2,4})[- ]?(\d{3}(?:[A-Z]{1,2})?)(?:[- ]?(\d{2}))?\b/g;
const DAY_KEYWORDS: Array<{ pattern: RegExp; code: WeekdayCode }> = [
	{ pattern: /\bmondays?\b/i, code: "M" },
	{ pattern: /\btuesdays?\b/i, code: "T" },
	{ pattern: /\bwednesdays?\b/i, code: "W" },
	{ pattern: /\bthursdays?\b/i, code: "Th" },
	{ pattern: /\bfridays?\b/i, code: "F" },
];
const COMPLETED_HINT = /\b(already|completed|took|taken|passed|finished|credit for|transferred|waived?)\b/i;
const REQUEST_HINT = /\b(want|need|looking for|plan to take|taking|schedule|this semester|next semester)\b/i;
const MANUAL_SATISFIED_HINT = /\b(already|completed|fulfilled|satisfied|waived?)\b/i;
const DIRECT_REQUIREMENT_CATEGORIES: RequirementCategoryId[] = ["connections", "fyc", "fyf", "fys", "capstone"];
const DAY_LABELS: Record<WeekdayCode, string> = {
	M: "Monday",
	T: "Tuesday",
	W: "Wednesday",
	Th: "Thursday",
	F: "Friday",
};
const TRANSCRIPT_AUDIT_EXCLUSION = /\b(requirement|requirements|remaining|still needed|needed|waiver|waived by|not satisfied|satisfied by|in progress|planned|program of emphasis|poe|credits required|subtotal|gpa)\b/i;
const TRANSCRIPT_TITLE_COURSE_ALIASES: Array<{ pattern: RegExp; code: string }> = [
	{ pattern: /\bbiostatistics\b/i, code: "BI-305" },
	{ pattern: /\belementary statistics\b/i, code: "MA-205" },
	{ pattern: /\bintroduction to probability(?:\s+and|\s*&)?\s+statistics\b/i, code: "MA-220" },
	{ pattern: /\bbusiness statistics\b/i, code: "EB-211" },
	{ pattern: /\bresearch methods(?:\s+and|\s*&)?\s+statistics\b/i, code: "PY-366" },
	{ pattern: /\bintegrated research methods(?:\s+and|\s*&)?\s+stats\s+ii\b/i, code: "SW-215" },
	{ pattern: /\benvironmetrics\b/i, code: "ESS-230" },
	{ pattern: /\beconometrics\b/i, code: "ESS-309" },
];
const TRANSCRIPT_REQUIREMENT_ALIASES: Array<{ pattern: RegExp; category: RequirementCategoryId }> = [
	{ pattern: /\bfirst[- ]year composition\b/i, category: "fyc" },
	{ pattern: /\bfirst[- ]year foundations\b/i, category: "fyf" },
	{ pattern: /\bfirst[- ]year seminar\b/i, category: "fys" },
];
const SINGLE_USE_PREFIX_REQUIREMENTS: Partial<Record<string, RequirementCategoryId>> = {
	FYC: "fyc",
	FYF: "fyf",
	FYS: "fys",
	CONN: "connections",
};

function clamp(value: number, minimum: number, maximum: number): number {
	return Math.max(minimum, Math.min(maximum, value));
}

function unique<T>(values: T[]): T[] {
	return [...new Set(values)];
}

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value: string | null | undefined): string {
	if (typeof value !== "string") {
		return "";
	}

	return value.trim().replace(/\s+/g, " ");
}

function normalizeCourseCode(value: string): string {
	const normalized = value.toUpperCase().replace(/[^A-Z0-9- ]/g, " ");
	const match = normalized.match(/\b([A-Z]{2,4})[- ]?(\d{3}(?:[A-Z]{1,2})?)\b/);
	if (!match) {
		return normalizeWhitespace(normalized).replace(/\s+/g, "-");
	}

	return `${match[1]}-${match[2]}`;
}

function getEquivalentCourseCodes(value: string): string[] {
	const normalized = normalizeCourseCode(value);
	const equivalents = new Set<string>([normalized]);

	if (/^[A-Z]{2,4}-\d{3}CW$/.test(normalized)) {
		equivalents.add(normalized.slice(0, -2));
	}
	else if (/^[A-Z]{2,4}-\d{3}$/.test(normalized)) {
		equivalents.add(`${normalized}CW`);
	}

	return [...equivalents];
}

function extractCourseCodesFromText(value: string): string[] {
	const codes = new Set<string>();

	for (const match of value.toUpperCase().matchAll(COURSE_CODE_REGEX)) {
		codes.add(`${match[1]}-${match[2]}`);
	}

	return [...codes];
}

function normalizeTranscriptTermLabel(value: string): string | null {
	const match = normalizeWhitespace(value).match(/\b(Spring|Summer|Fall)\s+Term\s+(\d{4})\b/i);
	if (!match) {
		return null;
	}

	const season = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
	return `${season} Term ${match[2]}`;
}

function transcriptTermSortKey(term: string | null | undefined): number {
	const normalized = normalizeTranscriptTermLabel(term || "");
	if (!normalized) {
		return Number.NEGATIVE_INFINITY;
	}

	const match = normalized.match(/^(Spring|Summer|Fall) Term (\d{4})$/);
	if (!match) {
		return Number.NEGATIVE_INFINITY;
	}

	const seasonOrder = match[1] === "Spring" ? 1 : match[1] === "Summer" ? 2 : 3;
	return (Number(match[2]) * 10) + seasonOrder;
}

function lineLooksLikeTranscriptCourse(value: string): boolean {
	return /^[A-Z]{2,4}\s*-?\s*\d{3}[A-Z]{0,2}\b/.test(value) || /^[A-Z]{2,4}1XXTR\b/.test(value);
}

function lineHasEarnedCredits(value: string): boolean {
	return /\b\d+\.\d{2}(?:\s+[A-Z][+-]?|\s+P|\s+S|\s+U|\s+F)?\s*$/.test(value);
}

function lineHasInProgressOrNonFinalGrade(value: string): boolean {
	return /\b(?:IP|I|W|AU|NR)\s*$/i.test(value);
}

function getStructuredTranscriptField(line: string, index: number): string {
	return normalizeWhitespace(line.split("|")[index] || "");
}

function parseTranscriptCourseInfo(transcriptText: string, selectedTerm?: string): ParsedTranscriptCourseInfo {
	const completed = new Set<string>();
	const requestedForSelectedTerm = new Set<string>();
	const satisfiedCategories = new Set<RequirementCategoryId>(extractTranscriptSatisfiedCategories(transcriptText));
	const lines = transcriptText
		.split(/\n+/)
		.map((line) => normalizeWhitespace(line))
		.filter(Boolean);
	const normalizedSelectedTerm = normalizeTranscriptTermLabel(selectedTerm || "");
	let currentTerm: string | null = null;

	for (const line of lines) {
		if (line === "UNREADABLE TRANSCRIPT") {
			continue;
		}

		if (/^(COMPLETED|TRANSFER)\s+\|/i.test(line)) {
			const term = normalizeTranscriptTermLabel(getStructuredTranscriptField(line, 1));
			const courseCode = getStructuredTranscriptField(line, 2);
			const normalizedCourseCode = normalizeCourseCode(courseCode);

			if (/^[A-Z]{2,4}-\d{3}(?:[A-Z]{1,2})?$/.test(normalizedCourseCode)) {
				completed.add(normalizedCourseCode);
				const category = SINGLE_USE_PREFIX_REQUIREMENTS[extractPrefix(normalizedCourseCode)];
				if (category) {
					satisfiedCategories.add(category);
				}
			}

			if (term) {
				currentTerm = term;
			}
			continue;
		}

		if (/^PLANNED\s+\|/i.test(line)) {
			const term = normalizeTranscriptTermLabel(getStructuredTranscriptField(line, 1));
			const courseCode = getStructuredTranscriptField(line, 2);
			const normalizedCourseCode = normalizeCourseCode(courseCode);

			if (term === normalizedSelectedTerm && /^[A-Z]{2,4}-\d{3}(?:[A-Z]{1,2})?$/.test(normalizedCourseCode)) {
				requestedForSelectedTerm.add(normalizedCourseCode);
			}

			if (term) {
				currentTerm = term;
			}
			continue;
		}

		if (/^REQUIREMENT\s+\|/i.test(line)) {
			const label = getStructuredTranscriptField(line, 1);
			const category = normalizeRequirementLabel(label);
			if (category) {
				satisfiedCategories.add(category);
			}
			continue;
		}

		const parsedTerm = normalizeTranscriptTermLabel(line);
		if (parsedTerm) {
			currentTerm = parsedTerm;
			continue;
		}

		if (!lineLooksLikeTranscriptCourse(line) || TRANSCRIPT_AUDIT_EXCLUSION.test(line)) {
			continue;
		}

		const codes = extractCourseCodesFromText(line);
		if (codes.length === 0) {
			continue;
		}

		for (const code of codes) {
			const normalizedCode = normalizeCourseCode(code);

			if (lineHasEarnedCredits(line) && !lineHasInProgressOrNonFinalGrade(line)) {
				completed.add(normalizedCode);
				const category = SINGLE_USE_PREFIX_REQUIREMENTS[extractPrefix(normalizedCode)];
				if (category) {
					satisfiedCategories.add(category);
				}
				continue;
			}

			if (normalizedSelectedTerm && currentTerm === normalizedSelectedTerm) {
				requestedForSelectedTerm.add(normalizedCode);
			}
		}
	}

	for (const code of extractAliasedCourseCodesFromTranscript(transcriptText)) {
		completed.add(normalizeCourseCode(code));
	}

	for (const category of inferFixedRequirementCategoriesFromCompletedCodes([...completed])) {
		satisfiedCategories.add(category);
	}

	return {
		completed: [...completed],
		requestedForSelectedTerm: [...requestedForSelectedTerm].filter((code) => !completed.has(code)),
		satisfiedCategories: [...satisfiedCategories],
	};
}

function getTranscriptCandidateLines(value: string): string[] {
	return value
		.split(/\n+/)
		.map((line) => normalizeWhitespace(line))
		.filter(Boolean)
		.filter((line) => !TRANSCRIPT_AUDIT_EXCLUSION.test(line));
}

function extractAliasedCourseCodesFromTranscript(value: string): string[] {
	const codes = new Set<string>();

	for (const line of getTranscriptCandidateLines(value)) {
		for (const alias of TRANSCRIPT_TITLE_COURSE_ALIASES) {
			if (alias.pattern.test(line)) {
				codes.add(alias.code);
			}
		}
	}

	return [...codes];
}

function extractTranscriptSatisfiedCategories(value: string): RequirementCategoryId[] {
	const categories = new Set<RequirementCategoryId>();

	for (const line of getTranscriptCandidateLines(value)) {
		for (const alias of TRANSCRIPT_REQUIREMENT_ALIASES) {
			if (alias.pattern.test(line)) {
				categories.add(alias.category);
			}
		}
	}

	return [...categories];
}

function inferFixedRequirementCategoriesFromCompletedCodes(courseCodes: string[]): RequirementCategoryId[] {
	const categories = new Set<RequirementCategoryId>();

	for (const courseCode of courseCodes) {
		const prefix = extractPrefix(normalizeCourseCode(courseCode));
		const category = SINGLE_USE_PREFIX_REQUIREMENTS[prefix];
		if (category) {
			categories.add(category);
		}
	}

	return [...categories];
}

function parsePromptCourseCodes(value: string): ParsedPromptCourseCodes {
	const completed = new Set<string>();
	const requested = new Set<string>();
	const segments = value.split(/[\n.;]+/);

	for (const segment of segments) {
		const codes = extractCourseCodesFromText(segment);
		if (codes.length === 0) {
			continue;
		}

		const completedHint = COMPLETED_HINT.test(segment);
		const requestHint = REQUEST_HINT.test(segment);

		for (const code of codes) {
			if (completedHint && !requestHint) {
				completed.add(code);
				continue;
			}

			requested.add(code);
		}
	}

	return {
		completed: [...completed],
		requested: [...requested].filter((code) => !completed.has(code)),
	};
}

function parseCreditGoal(prompt: string, explicitTarget?: number): {
	targetCredits: number;
	minCredits: number;
	maxCredits: number;
} {
	if (typeof explicitTarget === "number" && Number.isFinite(explicitTarget)) {
		const target = clamp(Math.round(explicitTarget), 9, 21);
		return {
			targetCredits: target,
			minCredits: Math.max(9, target - 1),
			maxCredits: Math.min(21, target + 2),
		};
	}

	const rangeMatch = prompt.match(/(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\s*credits?/i);
	if (rangeMatch) {
		const min = clamp(Number(rangeMatch[1]), 9, 21);
		const max = clamp(Number(rangeMatch[2]), min, 21);
		return {
			targetCredits: Math.round((min + max) / 2),
			minCredits: min,
			maxCredits: max,
		};
	}

	const atLeastMatch = prompt.match(/at least\s+(\d{1,2})\s*credits?/i);
	if (atLeastMatch) {
		const min = clamp(Number(atLeastMatch[1]), 9, 21);
		return {
			targetCredits: clamp(min + 1, 9, 21),
			minCredits: min,
			maxCredits: clamp(min + 3, min, 21),
		};
	}

	const exactMatch = prompt.match(/(\d{1,2})\s*credits?/i);
	if (exactMatch) {
		const target = clamp(Number(exactMatch[1]), 9, 21);
		return {
			targetCredits: target,
			minCredits: Math.max(9, target - 1),
			maxCredits: Math.min(21, target + 1),
		};
	}

	return {
		targetCredits: 15,
		minCredits: 13,
		maxCredits: 16,
	};
}

function parseCourseCountGoal(prompt: string, targetCredits: number): {
	targetCourseCount: number;
	minCourseCount: number;
	maxCourseCount: number;
} {
	const rangeMatch = prompt.match(/(\d)\s*(?:-|to)\s*(\d)\s*(?:classes|courses)/i);
	if (rangeMatch) {
		const min = clamp(Number(rangeMatch[1]), 2, 7);
		const max = clamp(Number(rangeMatch[2]), min, 7);
		return {
			targetCourseCount: Math.round((min + max) / 2),
			minCourseCount: min,
			maxCourseCount: max,
		};
	}

	const exactMatch = prompt.match(/(\d)\s*(?:classes|courses)/i);
	if (exactMatch) {
		const target = clamp(Number(exactMatch[1]), 2, 7);
		return {
			targetCourseCount: target,
			minCourseCount: Math.max(2, target - 1),
			maxCourseCount: Math.min(7, target + 1),
		};
	}

	const derived = clamp(Math.round(targetCredits / 4), 3, 6);
	return {
		targetCourseCount: derived,
		minCourseCount: Math.max(3, derived - 1),
		maxCourseCount: Math.min(6, derived + 1),
	};
}

function parseClockToken(value: string): number | null {
	const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
	if (!match) {
		return null;
	}

	let hours = Number(match[1]);
	const minutes = Number(match[2] || "0");
	const meridiem = (match[3] || "").toLowerCase();

	if (meridiem === "pm" && hours < 12) {
		hours += 12;
	}

	if (meridiem === "am" && hours === 12) {
		hours = 0;
	}

	if (!meridiem && hours <= 7) {
		hours += 12;
	}

	return (hours * 60) + minutes;
}

function parseTimeBound(prompt: string, patterns: RegExp[]): number | null {
	for (const pattern of patterns) {
		const match = prompt.match(pattern);
		if (!match || !match[1]) {
			continue;
		}

		const parsed = parseClockToken(match[1]);
		if (parsed !== null) {
			return parsed;
		}
	}

	return null;
}

function extractAvoidDays(prompt: string): WeekdayCode[] {
	const days: WeekdayCode[] = [];

	for (const entry of DAY_KEYWORDS) {
		if (new RegExp(`\\b(no|avoid|without)\\s+${entry.pattern.source}`, "i").test(prompt)) {
			days.push(entry.code);
		}
	}

	return unique(days);
}

function extractManualSatisfiedCategories(text: string): RequirementCategoryId[] {
	if (!MANUAL_SATISFIED_HINT.test(text)) {
		return [];
	}

	const categories = new Set<RequirementCategoryId>();

	for (const [category, label] of Object.entries(CATEGORY_LABELS) as Array<[RequirementCategoryId, string]>) {
		const pattern = new RegExp(`${escapeRegex(label)}.*${MANUAL_SATISFIED_HINT.source}|${MANUAL_SATISFIED_HINT.source}.*${escapeRegex(label)}`, "i");
		if (pattern.test(text)) {
			categories.add(category);
		}
	}

	return [...categories];
}

function extractPreferredDepartments(prompt: string, poe: string): string[] {
	const combined = `${prompt}\n${poe}`.toLowerCase();
	const departments = new Set<string>();

	for (const [code, name] of Object.entries(departmentCodes)) {
		const escapedCode = escapeRegex(code.toLowerCase());
		const normalizedName = name.toLowerCase();

		if (new RegExp(`\\b${escapedCode}\\b(?=\\s*(?:courses?|classes?|department|dept\\.?))`, "i").test(combined)) {
			departments.add(code);
			continue;
		}

		if (combined.includes(normalizedName)) {
			departments.add(code);
		}
	}

	return [...departments].filter((code) => !["FYC", "FYF", "FYS", "CONN", "GE"].includes(code));
}

export function derivePlannerIntent(request: SchedulePlanningRequest): PlannerIntent {
	const prompt = request.prompt || "";
	const transcriptText = request.transcriptText || "";
	const promptCodes = parsePromptCourseCodes(prompt);
	const explicitCompleted = (request.completedCourseCodes || []).map(normalizeCourseCode);
	const transcriptInfo = parseTranscriptCourseInfo(transcriptText, request.term);
	const transcriptCompleted = transcriptInfo.completed;
	const completedCourseCodes = unique([
		...explicitCompleted,
		...transcriptCompleted,
		...promptCodes.completed,
	]);
	const requestedCourseCodes = unique([
		...transcriptInfo.requestedForSelectedTerm,
		...promptCodes.requested,
	].filter((code) => !completedCourseCodes.includes(code)));
	const creditGoal = parseCreditGoal(prompt, request.targetCredits);
	const courseCountGoal = parseCourseCountGoal(prompt, creditGoal.targetCredits);
	const earliestStartMinutes = parseTimeBound(prompt, [
		/(?:start after|after|not before)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
	]);
	const latestEndMinutes = parseTimeBound(prompt, [
		/(?:done by|ending by|finish by|before)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
	]);

	return {
		completedCourseCodes,
		requestedCourseCodes,
		preferredDepartments: extractPreferredDepartments(prompt, request.poe || ""),
		targetCredits: creditGoal.targetCredits,
		minCredits: creditGoal.minCredits,
		maxCredits: creditGoal.maxCredits,
		targetCourseCount: courseCountGoal.targetCourseCount,
		minCourseCount: courseCountGoal.minCourseCount,
		maxCourseCount: courseCountGoal.maxCourseCount,
		preferMorning: /\bmorning\b/i.test(prompt),
		preferAfternoon: /\bafternoon\b/i.test(prompt),
		earliestStartMinutes,
		latestEndMinutes,
		avoidDays: extractAvoidDays(prompt),
			openSeatsOnly: Boolean(request.openSeatsOnly) || /\b(open seats|open sections|no waitlist|not waitlisted)\b/i.test(prompt),
			manualSatisfiedCategories: unique([
				...extractManualSatisfiedCategories(prompt),
				...extractManualSatisfiedCategories(transcriptText),
				...transcriptInfo.satisfiedCategories,
			]),
	};
}

function formatCategoryList(categories: RequirementCategoryId[]): string {
	return categories.map((category) => CATEGORY_LABELS[category]).join(", ");
}

function extractPrefix(courseCode: string): string {
	return courseCode.split("-")[0] || "";
}

function inferDirectRequirements(
	courseCode: string,
	title: string,
	courseTypes: string[],
	capstoneCourseCodes?: Set<string>
): RequirementCategoryId[] {
	const categories = new Set<RequirementCategoryId>();
	const prefix = extractPrefix(courseCode);
	const normalizedCourseCode = normalizeCourseCode(courseCode);

	if (prefix === "FYC") {
		categories.add("fyc");
	}

	if (prefix === "FYF") {
		categories.add("fyf");
	}

	if (prefix === "FYS") {
		categories.add("fys");
	}

	if (prefix === "CONN") {
		categories.add("connections");
	}

	if (prefix === "GE") {
		categories.add("global_engagement");
	}

	if (capstoneCourseCodes) {
		if (capstoneCourseCodes.has(normalizedCourseCode)) {
			categories.add("capstone");
		}
	}
	else if (/capstone/i.test(title) || courseTypes.some((value) => /capstone/i.test(value))) {
		categories.add("capstone");
	}

	return [...categories];
}

function normalizeCourse(course: Course, term?: string, capstoneCourseCodes?: Set<string>): NormalizedCourse {
	const sections = term
		? course.sections.filter((section) => section.term === term)
		: course.sections;
	const baseCode = normalizeCourseCode(course.course_code);
	const requirementOptions = unique([
		...inferRequirementCategories(course.course_types || []),
		...inferDirectRequirements(course.course_code, course.title, course.course_types || [], capstoneCourseCodes),
	]);

	return {
		id: String(course._id),
		courseCode: course.course_code,
		baseCode,
		title: course.title,
		description: course.description,
		prefix: extractPrefix(baseCode),
		credits: Number(course.credits?.minimum || 0),
		academicLevel: course.academic_level,
		requirementOptions,
		requisiteCodes: unique(extractCourseCodesFromText((course.requisites || []).join(" "))),
		requisitesText: (course.requisites || []).join(" ; "),
		sections,
	};
}

function normalizeCourses(courses: Course[], term?: string, capstoneCourseCodes?: Set<string>): NormalizedCourse[] {
	return courses
		.map((course) => normalizeCourse(course, term, capstoneCourseCodes))
		.filter((course) => !term || course.sections.length > 0);
}

function toPoeCourseLike(course: Pick<NormalizedCourse, "baseCode" | "courseCode" | "title" | "credits" | "prefix">): PoeCourseLike {
	return {
		baseCode: course.baseCode,
		courseCode: course.courseCode,
		title: course.title,
		credits: course.credits,
		prefix: course.prefix,
	};
}

function buildPoeCompletedCourses(
	completedCourseCodes: string[],
	completedCourses: NormalizedCourse[]
): PoeCourseLike[] {
	const courses = completedCourses.map((course) => toPoeCourseLike(course));
	const knownCodes = new Set(courses.map((course) => course.baseCode));

	for (const courseCode of completedCourseCodes) {
		const normalized = normalizeCourseCode(courseCode);
		if (knownCodes.has(normalized)) {
			continue;
		}

		courses.push({
			baseCode: normalized,
			courseCode: normalized,
			title: normalized,
			credits: 0,
			prefix: extractPrefix(normalized),
		});
	}

	return courses;
}

function addCounts(target: RequirementCounts, source: RequirementCounts): RequirementCounts {
	const result = createRequirementCounts();

	for (const key of Object.keys(result) as RequirementCategoryId[]) {
		result[key] = target[key] + source[key];
	}

	return result;
}

function subtractCounts(target: RequirementCounts, source: RequirementCounts): RequirementCounts {
	const result = createRequirementCounts();

	for (const key of Object.keys(result) as RequirementCategoryId[]) {
		result[key] = Math.max(0, target[key] - source[key]);
	}

	return result;
}

function countTotalRequirements(counts: RequirementCounts): number {
	return Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function buildFixedWaiverCounts(request: SchedulePlanningRequest, intent: PlannerIntent): {
	counts: RequirementCounts;
	wkFlexibleWaivers: number;
	swFlexibleWaivers: number;
	generalFlexibleWaivers: number;
	poeWaiverOptions: RequirementCategoryId[];
	summary: string[];
} {
	const counts = createRequirementCounts();
	const summary: string[] = [];
	const entryType = request.entryType || "continuing";
	const studyAbroad = request.studyAbroad || "none";
	const dualDegree = request.dualDegree || "none";
	const incomingCredits = Math.max(0, Number(request.incomingCredits || 0));
	const incomingCompositionCredits = Math.max(0, Number(request.incomingCompositionCredits || 0));

	let wkFlexibleWaivers = 0;
	let swFlexibleWaivers = 0;
	let generalFlexibleWaivers = 0;

	for (const category of getFirstYearExperienceWaivers({
		entryType,
		incomingCredits,
		incomingCompositionCredits,
	})) {
		counts[category] += 1;
	}

	if (counts.fyc > 0 || counts.fys > 0) {
		summary.push(`First-year experience waivers applied: ${formatCategoryList((["fyc", "fys"] as RequirementCategoryId[]).filter((category) => counts[category] > 0))}.`);
	}

	const stepDownWaivers = getStepDownWaivers(incomingCredits);
	wkFlexibleWaivers += stepDownWaivers.wkWaivers;
	swFlexibleWaivers += stepDownWaivers.swWaivers;

	if (stepDownWaivers.wkWaivers > 0 || stepDownWaivers.swWaivers > 0) {
		summary.push(`Incoming-credit step-down waivers available: ${stepDownWaivers.wkWaivers} Ways of Knowing and ${stepDownWaivers.swWaivers} Self and the World.`);
	}

	const poeWaiverOptions = getPoeWaiverOptions(request.poe || "");
	if (poeWaiverOptions.length > 0) {
		summary.push(`POE waiver options detected for ${request.poe}: ${formatCategoryList(poeWaiverOptions)}.`);
	}

	if (studyAbroad === "semester") {
		counts.global_engagement = Math.max(counts.global_engagement, 2);
		wkFlexibleWaivers += 1;
		summary.push("Semester-abroad waivers applied: both Global Engagement courses plus one flexible Ways of Knowing waiver.");
	}

	if (studyAbroad === "year") {
		counts.global_engagement = Math.max(counts.global_engagement, 2);
		wkFlexibleWaivers += 1;
		swFlexibleWaivers += 1;
		summary.push("Academic-year abroad waivers applied: both Global Engagement courses, one flexible Ways of Knowing waiver, and one flexible Self and the World waiver.");
	}

	if (request.legacyBlanketWaiver) {
		wkFlexibleWaivers += 1;
		counts.global_engagement += 1;
		summary.push("Legacy blanket waivers applied: one additional flexible Ways of Knowing waiver and one Global Engagement course waiver.");
	}

	if (dualDegree !== "none") {
		counts.capstone = Math.max(counts.capstone, 1);
		generalFlexibleWaivers += 2;
		summary.push("Dual-degree waivers applied: Capstone plus two flexible Ways of Knowing / Self and the World waivers.");
		if (dualDegree === "abroad") {
			counts.global_engagement = Math.max(counts.global_engagement, 2);
			summary.push("Dual-degree abroad partner detected: Global Engagement fully waived.");
		}
	}

	for (const category of intent.manualSatisfiedCategories) {
		counts[category] += 1;
	}

	if (intent.manualSatisfiedCategories.length > 0) {
		summary.push(`Requirement completions detected from your notes or transcript: ${formatCategoryList(intent.manualSatisfiedCategories)}.`);
	}

	return {
		counts,
		wkFlexibleWaivers,
		swFlexibleWaivers,
		generalFlexibleWaivers,
		poeWaiverOptions,
		summary,
	};
}

function chooseFixedAssignments(
	courses: NormalizedCourse[],
	requiredCounts: RequirementCounts,
	initialUsedCourseKeys: Set<string>,
	initialUsedWkPrefixes: Set<string>
): RequirementCoverage {
	const counts = createRequirementCounts();
	const assignments: RequirementAssignment[] = [];
	const usedCourseKeys = new Set(initialUsedCourseKeys);
	const usedWkPrefixes = new Set(initialUsedWkPrefixes);

	for (const category of FIXED_REQUIREMENT_ORDER) {
		if (requiredCounts[category] <= 0) {
			continue;
		}

		const candidate = courses.find((course) => !usedCourseKeys.has(course.baseCode) && course.requirementOptions.includes(category));
		if (!candidate) {
			continue;
		}

		counts[category] += 1;
		assignments.push({
			category,
			courseKey: candidate.baseCode,
			courseCode: candidate.courseCode,
			title: candidate.title,
		});
		usedCourseKeys.add(candidate.baseCode);
		if (isWkCategory(category)) {
			usedWkPrefixes.add(candidate.prefix);
		}
	}

	return { counts, assignments, usedCourseKeys, usedWkPrefixes };
}

function compareCoverage(a: RequirementCoverage, b: RequirementCoverage): RequirementCoverage {
	const totalA = countTotalRequirements(a.counts);
	const totalB = countTotalRequirements(b.counts);

	if (totalA !== totalB) {
		return totalA > totalB ? a : b;
	}

	const wkA = WK_CATEGORIES.reduce((sum, category) => sum + a.counts[category], 0);
	const wkB = WK_CATEGORIES.reduce((sum, category) => sum + b.counts[category], 0);

	if (wkA !== wkB) {
		return wkA > wkB ? a : b;
	}

	return a.assignments.length >= b.assignments.length ? a : b;
}

function assignCategorySlots(
	courses: NormalizedCourse[],
	slots: RequirementCategoryId[],
	initialUsedCourseKeys: Set<string>,
	initialUsedWkPrefixes: Set<string>
): RequirementCoverage {
	const candidateLists = new Map<RequirementCategoryId, NormalizedCourse[]>();

	for (const category of unique(slots)) {
		candidateLists.set(
			category,
			courses.filter((course) => course.requirementOptions.includes(category))
		);
	}

	const orderedSlots = [...slots].sort((left, right) => {
		const leftCount = candidateLists.get(left)?.length || 0;
		const rightCount = candidateLists.get(right)?.length || 0;
		return leftCount - rightCount;
	});

	let best: RequirementCoverage = {
		counts: createRequirementCounts(),
		assignments: [],
		usedCourseKeys: new Set(initialUsedCourseKeys),
		usedWkPrefixes: new Set(initialUsedWkPrefixes),
	};

	function search(index: number, assignments: RequirementAssignment[], usedCourseKeys: Set<string>, usedWkPrefixes: Set<string>) {
		const remainingPotential = orderedSlots.length - index;
		if (assignments.length + remainingPotential < best.assignments.length) {
			return;
		}

		if (index >= orderedSlots.length) {
			const counts = createRequirementCounts();
			for (const assignment of assignments) {
				counts[assignment.category] += 1;
			}

			const coverage: RequirementCoverage = {
				counts,
				assignments: [...assignments],
				usedCourseKeys: new Set(usedCourseKeys),
				usedWkPrefixes: new Set(usedWkPrefixes),
			};
			best = compareCoverage(best, coverage);
			return;
		}

		search(index + 1, assignments, usedCourseKeys, usedWkPrefixes);

		const category = orderedSlots[index];
		const candidates = candidateLists.get(category) || [];

		for (const candidate of candidates) {
			if (usedCourseKeys.has(candidate.baseCode)) {
				continue;
			}

			if (isWkCategory(category) && usedWkPrefixes.has(candidate.prefix)) {
				continue;
			}

			const nextUsedCourseKeys = new Set(usedCourseKeys);
			nextUsedCourseKeys.add(candidate.baseCode);
			const nextUsedWkPrefixes = new Set(usedWkPrefixes);
			if (isWkCategory(category)) {
				nextUsedWkPrefixes.add(candidate.prefix);
			}

			search(index + 1, [
				...assignments,
				{
					category,
					courseKey: candidate.baseCode,
					courseCode: candidate.courseCode,
					title: candidate.title,
				},
			], nextUsedCourseKeys, nextUsedWkPrefixes);
		}
	}

	search(0, [], new Set(initialUsedCourseKeys), new Set(initialUsedWkPrefixes));
	return best;
}

function applyFlexibleAssignments(
	courses: NormalizedCourse[],
	requiredCounts: RequirementCounts,
	initialUsedCourseKeys: Set<string>,
	initialUsedWkPrefixes: Set<string>
): RequirementCoverage {
	const fixedCoverage = chooseFixedAssignments(courses, requiredCounts, initialUsedCourseKeys, initialUsedWkPrefixes);
	const remainingAfterFixed = subtractCounts(requiredCounts, fixedCoverage.counts);

	const wkSlots = WK_CATEGORIES.filter((category) => remainingAfterFixed[category] > 0);
	const swSlots = SW_CATEGORIES.flatMap((category) => Array.from({ length: remainingAfterFixed[category] }, () => category));

	const wkFirstCoverage = (() => {
		const wkCoverage = assignCategorySlots(
			courses,
			wkSlots,
			fixedCoverage.usedCourseKeys,
			fixedCoverage.usedWkPrefixes
		);
		const remainingAfterWk = subtractCounts(remainingAfterFixed, wkCoverage.counts);
		const swCoverage = assignCategorySlots(
			courses,
			SW_CATEGORIES.flatMap((category) => Array.from({ length: remainingAfterWk[category] }, () => category)),
			wkCoverage.usedCourseKeys,
			wkCoverage.usedWkPrefixes
		);

		return {
			counts: addCounts(addCounts(fixedCoverage.counts, wkCoverage.counts), swCoverage.counts),
			assignments: [...fixedCoverage.assignments, ...wkCoverage.assignments, ...swCoverage.assignments],
			usedCourseKeys: swCoverage.usedCourseKeys,
			usedWkPrefixes: swCoverage.usedWkPrefixes,
		};
	})();

	const swFirstCoverage = (() => {
		const swCoverage = assignCategorySlots(
			courses,
			swSlots,
			fixedCoverage.usedCourseKeys,
			fixedCoverage.usedWkPrefixes
		);
		const remainingAfterSw = subtractCounts(remainingAfterFixed, swCoverage.counts);
		const wkCoverage = assignCategorySlots(
			courses,
			WK_CATEGORIES.filter((category) => remainingAfterSw[category] > 0),
			swCoverage.usedCourseKeys,
			swCoverage.usedWkPrefixes
		);

		return {
			counts: addCounts(addCounts(fixedCoverage.counts, swCoverage.counts), wkCoverage.counts),
			assignments: [...fixedCoverage.assignments, ...swCoverage.assignments, ...wkCoverage.assignments],
			usedCourseKeys: wkCoverage.usedCourseKeys,
			usedWkPrefixes: wkCoverage.usedWkPrefixes,
		};
	})();

	return compareCoverage(wkFirstCoverage, swFirstCoverage);
}

function countAvailableOptionsByCategory(courses: NormalizedCourse[], usedWkPrefixes: Set<string>): RequirementCounts {
	const counts = createRequirementCounts();

	for (const course of courses) {
		for (const category of course.requirementOptions) {
			if (isWkCategory(category) && usedWkPrefixes.has(course.prefix)) {
				continue;
			}

			counts[category] += 1;
		}
	}

	return counts;
}

function chooseFlexibleWaiverCategory(
	options: RequirementCategoryId[],
	remainingCounts: RequirementCounts,
	availableCounts: RequirementCounts
): RequirementCategoryId | null {
	const eligible = options.filter((category) => remainingCounts[category] > 0);
	if (eligible.length === 0) {
		return null;
	}

	return eligible.sort((left, right) => {
		const scarcityDiff = availableCounts[left] - availableCounts[right];
		if (scarcityDiff !== 0) {
			return scarcityDiff;
		}

		return remainingCounts[right] - remainingCounts[left];
	})[0] || null;
}

function applyFlexibleWaivers(
	initialRemaining: RequirementCounts,
	availableCounts: RequirementCounts,
	poeWaiverOptions: RequirementCategoryId[],
	wkFlexibleWaivers: number,
	swFlexibleWaivers: number,
	generalFlexibleWaivers: number
): {
	counts: RequirementCounts;
	summary: string[];
} {
	const counts = createRequirementCounts();
	const summary: string[] = [];
	const remaining = { ...initialRemaining };
	const wkApplied: RequirementCategoryId[] = [];
	const swApplied: RequirementCategoryId[] = [];
	const generalApplied: RequirementCategoryId[] = [];

	const poeChoice = chooseFlexibleWaiverCategory(poeWaiverOptions, remaining, availableCounts);
	if (poeChoice) {
		counts[poeChoice] += 1;
		remaining[poeChoice] = Math.max(0, remaining[poeChoice] - 1);
		summary.push(`POE waiver allocated to ${CATEGORY_LABELS[poeChoice]}.`);
	}

	for (let index = 0; index < wkFlexibleWaivers; index += 1) {
		const choice = chooseFlexibleWaiverCategory(WK_CATEGORIES, remaining, availableCounts);
		if (!choice) {
			break;
		}

		counts[choice] += 1;
		remaining[choice] = Math.max(0, remaining[choice] - 1);
		wkApplied.push(choice);
	}

	if (wkApplied.length > 0) {
		summary.push(`Flexible Ways of Knowing waivers allocated to ${formatCategoryList(wkApplied)}.`);
	}

	for (let index = 0; index < swFlexibleWaivers; index += 1) {
		const choice = chooseFlexibleWaiverCategory(SW_CATEGORIES, remaining, availableCounts);
		if (!choice) {
			break;
		}

		counts[choice] += 1;
		remaining[choice] = Math.max(0, remaining[choice] - 1);
		swApplied.push(choice);
	}

	if (swApplied.length > 0) {
		summary.push(`Flexible Self and the World waivers allocated to ${formatCategoryList(swApplied)}.`);
	}

	for (let index = 0; index < generalFlexibleWaivers; index += 1) {
		const choice = chooseFlexibleWaiverCategory([...WK_CATEGORIES, ...SW_CATEGORIES], remaining, availableCounts);
		if (!choice) {
			break;
		}

		counts[choice] += 1;
		remaining[choice] = Math.max(0, remaining[choice] - 1);
		generalApplied.push(choice);
	}

	if (generalApplied.length > 0) {
		summary.push(`Flexible dual-degree waivers allocated to ${formatCategoryList(generalApplied)}.`);
	}

	return { counts, summary };
}

function buildRequirementState(
	request: SchedulePlanningRequest,
	intent: PlannerIntent,
	completedCourses: NormalizedCourse[],
	availableCourses: NormalizedCourse[]
): RequirementState {
	const baseCounts = getBaseRequirementCounts();
	const waiverInputs = buildFixedWaiverCounts(request, intent);
	const fixedWaivedCounts = { ...waiverInputs.counts };

	for (const category of Object.keys(fixedWaivedCounts) as RequirementCategoryId[]) {
		fixedWaivedCounts[category] = Math.min(baseCounts[category], fixedWaivedCounts[category]);
	}

	const requiredAfterFixedWaivers = subtractCounts(baseCounts, fixedWaivedCounts);
	const completedCoverage = applyFlexibleAssignments(
		completedCourses,
		requiredAfterFixedWaivers,
		new Set<string>(),
		new Set<string>()
	);
	const remainingAfterCompleted = subtractCounts(requiredAfterFixedWaivers, completedCoverage.counts);
	const availableCategoryCounts = countAvailableOptionsByCategory(availableCourses, completedCoverage.usedWkPrefixes);
	const flexibleWaivers = applyFlexibleWaivers(
		remainingAfterCompleted,
		availableCategoryCounts,
		waiverInputs.poeWaiverOptions,
		waiverInputs.wkFlexibleWaivers,
		waiverInputs.swFlexibleWaivers,
		waiverInputs.generalFlexibleWaivers
	);
	const waivedCounts = addCounts(fixedWaivedCounts, flexibleWaivers.counts);
	const requiredAfterWaivers = subtractCounts(baseCounts, waivedCounts);
	const completedCounts = applyFlexibleAssignments(
		completedCourses,
		requiredAfterWaivers,
		new Set<string>(),
		new Set<string>()
	);

	return {
		baseCounts,
		completedCounts: completedCounts.counts,
		requiredAfterWaivers,
		waivedCounts,
		remainingBeforePlan: subtractCounts(requiredAfterWaivers, completedCounts.counts),
		completedWkPrefixes: completedCounts.usedWkPrefixes,
		completedAssignments: completedCounts.assignments,
		waiverSummary: [...waiverInputs.summary, ...flexibleWaivers.summary],
	};
}

function parseTimeToMinutes(value: string | null | undefined): number | null {
	const normalized = normalizeWhitespace(value);
	if (!normalized) {
		return null;
	}

	const [hoursText, minutesText] = normalized.split(":");
	if (!hoursText || !minutesText) {
		return null;
	}

	const hours = Number(hoursText);
	const minutes = Number(minutesText);
	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return null;
	}

	return (hours * 60) + minutes;
}

function meetingDaysOverlap(left: WeekdayCode[], right: WeekdayCode[]): boolean {
	return left.some((day) => right.includes(day));
}

function getMeetingDays(meeting: MeetingInfo | null | undefined): WeekdayCode[] {
	if (!meeting || !Array.isArray(meeting.days)) {
		return [];
	}

	return meeting.days.filter(Boolean) as WeekdayCode[];
}

function getMeetings(section: CourseSection): MeetingInfo[] {
	if (!Array.isArray(section.meeting_info)) {
		return [];
	}

	return section.meeting_info.filter(Boolean) as MeetingInfo[];
}

function timesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
	return startA < endB && startB < endA;
}

function sectionsConflict(left: CourseSection, right: CourseSection): boolean {
	for (const leftMeeting of getMeetings(left)) {
		const leftStart = parseTimeToMinutes(leftMeeting.start_time);
		const leftEnd = parseTimeToMinutes(leftMeeting.end_time);
		if (leftStart === null || leftEnd === null) {
			continue;
		}

		for (const rightMeeting of getMeetings(right)) {
			const rightStart = parseTimeToMinutes(rightMeeting.start_time);
			const rightEnd = parseTimeToMinutes(rightMeeting.end_time);
			if (rightStart === null || rightEnd === null) {
				continue;
			}

			if (meetingDaysOverlap(getMeetingDays(leftMeeting), getMeetingDays(rightMeeting)) && timesOverlap(leftStart, leftEnd, rightStart, rightEnd)) {
				return true;
			}
		}
	}

	return false;
}

function formatMeetingDays(days: WeekdayCode[] | null | undefined): string {
	return Array.isArray(days) ? days.join("") : "";
}

function formatMeeting(meeting: MeetingInfo): string {
	const dayText = formatMeetingDays(getMeetingDays(meeting));
	const startText = normalizeWhitespace(meeting?.start_time);
	const endText = normalizeWhitespace(meeting?.end_time);
	const timeText = startText && endText ? `${startText}-${endText}` : (startText || endText);
	const placeText = normalizeWhitespace(meeting?.classroom);
	const pieces = [dayText, timeText].filter(Boolean);

	if (pieces.length === 0 && !placeText) {
		return "TBA";
	}

	return `${pieces.join(" ")}${placeText ? ` • ${placeText}` : ""}`;
}

function sectionMatchesPreferences(section: CourseSection, intent: PlannerIntent): number {
	let score = 0;
	const available = Number(section.availability?.available || 0);
	const waitlisted = Number(section.availability?.waitlisted || 0);

	if (available > 0) {
		score += Math.min(12, available);
	}
	else if (waitlisted > 0) {
		score -= 12;
	}
	else {
		score -= 8;
	}

	for (const meeting of getMeetings(section)) {
		const start = parseTimeToMinutes(meeting.start_time);
		const end = parseTimeToMinutes(meeting.end_time);
		const meetingDays = getMeetingDays(meeting);

		if (meetingDays.some((day) => intent.avoidDays.includes(day))) {
			score -= 25;
		}

		if (start !== null && intent.earliestStartMinutes !== null && start < intent.earliestStartMinutes) {
			score -= 18;
		}

		if (end !== null && intent.latestEndMinutes !== null && end > intent.latestEndMinutes) {
			score -= 18;
		}

		if (intent.preferMorning && start !== null) {
			score += start < 12 * 60 ? 5 : -4;
		}

		if (intent.preferAfternoon && start !== null) {
			score += start >= 12 * 60 ? 5 : -4;
		}
	}

	return score;
}

function buildCompletedCodeSet(intent: PlannerIntent): Set<string> {
	return new Set(intent.completedCourseCodes.flatMap((courseCode) => getEquivalentCourseCodes(courseCode)));
}

function getSingleUseRequirementCategory(course: Pick<NormalizedCourse, "prefix" | "requirementOptions">): RequirementCategoryId | null {
	const category = SINGLE_USE_PREFIX_REQUIREMENTS[course.prefix];
	if (category && course.requirementOptions.includes(category)) {
		return category;
	}

	return null;
}

function prerequisiteSatisfied(
	course: NormalizedCourse,
	completedCodes: Set<string>,
	scheduledCodes: Set<string>,
	fycSatisfied: boolean
): boolean {
	if (course.requisiteCodes.length === 0) {
		return true;
	}

	const matches = course.requisiteCodes.filter((code) => completedCodes.has(code) || scheduledCodes.has(code) || (code === "FYC-101" && fycSatisfied));
	if (matches.length === 0) {
		return false;
	}

	if (/\bone of\b|\bor\b/i.test(course.requisitesText) && !/\band\b/i.test(course.requisitesText)) {
		return matches.length > 0;
	}

	return matches.length === course.requisiteCodes.length;
}

function buildOfferingPool(
	courses: NormalizedCourse[],
	intent: PlannerIntent,
	requirementState: RequirementState,
	poeEvaluation: PoeEvaluation | null
): {
	offerings: ScheduleOffering[];
	warnings: string[];
} {
	const completedCodes = buildCompletedCodeSet(intent);
	const fycSatisfied = requirementState.waivedCounts.fyc > 0 || requirementState.completedCounts.fyc > 0;
	const warnings: string[] = [];
	const offerings: ScheduleOffering[] = [];

	for (const course of courses) {
			if (completedCodes.has(course.baseCode)) {
				continue;
			}

			const requested = intent.requestedCourseCodes.includes(course.baseCode);
			const preferredDepartment = intent.preferredDepartments.includes(course.prefix);
			const usefulCategories = course.requirementOptions.filter((category) => requirementState.remainingBeforePlan[category] > 0);
			const prerequisiteOkay = prerequisiteSatisfied(course, completedCodes, new Set<string>(), fycSatisfied);
			const poeMatch = poeEvaluation ? scoreCourseForPoe(toPoeCourseLike(course), poeEvaluation) : { score: 0, reasons: [] as string[] };
			const singleUseCategory = getSingleUseRequirementCategory(course);

			if (singleUseCategory && requirementState.remainingBeforePlan[singleUseCategory] <= 0 && !requested && poeMatch.score <= 0) {
				continue;
			}

			let baseScore = 0;
		if (requested) {
			baseScore += 120;
		}
		if (preferredDepartment) {
			baseScore += 28;
		}
		if (usefulCategories.length > 0) {
			baseScore += 35 + (usefulCategories.length * 12);
		}
		if (course.credits >= 3 && course.credits <= 4) {
			baseScore += 8;
		}
		if (course.requisiteCodes.length === 0) {
			baseScore += 6;
		}
			if (!prerequisiteOkay) {
				baseScore -= 40;
				if (requested) {
					warnings.push(`${course.courseCode} appears to have unmet prerequisites based on the completed work I could recognize.`);
				}
			}

				baseScore += poeMatch.score;

			const sectionCandidates = [...course.sections]
				.sort((left, right) => sectionMatchesPreferences(right, intent) - sectionMatchesPreferences(left, intent))
				.slice(0, 2);

			for (const section of sectionCandidates) {
				const available = Number(section.availability?.available || 0);
				if (intent.openSeatsOnly && available <= 0 && !requested) {
					continue;
				}

				offerings.push({
					course,
					section,
					sectionKey: `${course.baseCode}::${section.section_name}::${section.term}`,
					baseScore,
					sectionScore: sectionMatchesPreferences(section, intent),
					poeReasons: poeMatch.reasons,
				});
			}
		}

	return { offerings, warnings: unique(warnings) };
}

function scheduleHasConflict(schedule: BeamSchedule, candidate: ScheduleOffering): boolean {
	return schedule.offerings.some((offering) => sectionsConflict(offering.section, candidate.section));
}

function evaluateSelectedCoverage(
	selectedCourses: NormalizedCourse[],
	requirementState: RequirementState
): RequirementCoverage {
	return applyFlexibleAssignments(
		selectedCourses,
		requirementState.remainingBeforePlan,
		new Set<string>(),
		new Set(requirementState.completedWkPrefixes)
	);
}

function scoreBeamSchedule(schedule: BeamSchedule, intent: PlannerIntent, requirementState: RequirementState): number {
	const selectedCourses = schedule.offerings.map((offering) => offering.course);
	const selectedCoverage = evaluateSelectedCoverage(selectedCourses, requirementState);
	const remainingAfterPlan = subtractCounts(requirementState.remainingBeforePlan, selectedCoverage.counts);
	const coveredRequirementCount = countTotalRequirements(selectedCoverage.counts);
	let score = schedule.offerings.reduce((sum, offering) => sum + offering.baseScore + offering.sectionScore, 0);

	score += coveredRequirementCount * 110;
	score -= countTotalRequirements(remainingAfterPlan) * 25;
	score -= Math.abs(schedule.totalCredits - intent.targetCredits) * 7;
	score -= Math.abs(schedule.offerings.length - intent.targetCourseCount) * 10;

	if (schedule.totalCredits < intent.minCredits) {
		score -= (intent.minCredits - schedule.totalCredits) * 20;
	}

	if (schedule.totalCredits > intent.maxCredits) {
		score -= (schedule.totalCredits - intent.maxCredits) * 18;
	}

	if (schedule.offerings.length < intent.minCourseCount) {
		score -= (intent.minCourseCount - schedule.offerings.length) * 14;
	}

	if (schedule.offerings.length > intent.maxCourseCount) {
		score -= (schedule.offerings.length - intent.maxCourseCount) * 14;
	}

		if (intent.avoidDays.length > 0) {
			const hasAvoidedDay = schedule.offerings.some((offering) =>
				getMeetings(offering.section).some((meeting) => getMeetingDays(meeting).some((day) => intent.avoidDays.includes(day)))
			);
			if (!hasAvoidedDay) {
				score += 12;
			}
	}

	return score;
}

function createEmptySchedule(): BeamSchedule {
	return {
		offerings: [],
		courseKeys: new Set<string>(),
		sectionKeys: new Set<string>(),
		totalCredits: 0,
		score: 0,
	};
}

function buildRequiredOfferings(
	allOfferings: ScheduleOffering[],
	intent: PlannerIntent,
	requirementState: RequirementState
): {
	beam: BeamSchedule[];
	warnings: string[];
} {
	const warnings: string[] = [];
	let beam: BeamSchedule[] = [createEmptySchedule()];

	for (const courseCode of intent.requestedCourseCodes) {
		const matching = allOfferings.filter((offering) => offering.course.baseCode === courseCode);
		if (matching.length === 0) {
			warnings.push(`${courseCode} is not available in the selected term or has no section I can use.`);
			continue;
		}

		const nextBeam: BeamSchedule[] = [];
		for (const schedule of beam) {
				for (const candidate of matching) {
					const fycSatisfied = requirementState.waivedCounts.fyc > 0 || requirementState.completedCounts.fyc > 0;
					if (!prerequisiteSatisfied(candidate.course, buildCompletedCodeSet(intent), schedule.courseKeys, fycSatisfied)) {
						continue;
					}

					const singleUseCategory = getSingleUseRequirementCategory(candidate.course);
					if (singleUseCategory && schedule.offerings.some((offering) => getSingleUseRequirementCategory(offering.course) === singleUseCategory)) {
						continue;
					}

					if (schedule.courseKeys.has(candidate.course.baseCode) || schedule.sectionKeys.has(candidate.sectionKey) || scheduleHasConflict(schedule, candidate)) {
						continue;
					}

				const nextSchedule: BeamSchedule = {
					offerings: [...schedule.offerings, candidate],
					courseKeys: new Set([...schedule.courseKeys, candidate.course.baseCode]),
					sectionKeys: new Set([...schedule.sectionKeys, candidate.sectionKey]),
					totalCredits: schedule.totalCredits + candidate.course.credits,
					score: 0,
				};
				nextSchedule.score = scoreBeamSchedule(nextSchedule, intent, requirementState);
				nextBeam.push(nextSchedule);
			}
		}

		if (nextBeam.length === 0) {
			warnings.push(`I could not place ${courseCode} without conflicts or unmet prerequisites.`);
			continue;
		}

		beam = [...nextBeam]
			.sort((left, right) => right.score - left.score)
			.slice(0, 15);
	}

	return { beam, warnings };
}

function dedupeSchedules(schedules: BeamSchedule[]): BeamSchedule[] {
	const seen = new Set<string>();
	return schedules.filter((schedule) => {
		const key = schedule.offerings
			.map((offering) => `${offering.course.baseCode}:${offering.section.section_name}`)
			.sort()
			.join("|");

		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}

function buildBestSchedule(
	allOfferings: ScheduleOffering[],
	intent: PlannerIntent,
	requirementState: RequirementState
): {
	schedule: BeamSchedule;
	warnings: string[];
	} {
	const anchorState = buildRequiredOfferings(allOfferings, intent, requirementState);
	let beam = anchorState.beam;
	const warnings = [...anchorState.warnings];
	const creditCeiling = intent.requestedCourseCodes.length > 0 ? intent.targetCredits : intent.maxCredits;
	const additionalOfferings = allOfferings
		.filter((offering) => !intent.requestedCourseCodes.includes(offering.course.baseCode))
		.sort((left, right) => (right.baseScore + right.sectionScore) - (left.baseScore + left.sectionScore))
		.slice(0, Math.max(24, intent.maxCourseCount * 8));

	const maxIterations = Math.max(intent.maxCourseCount, intent.targetCourseCount + 1);

	for (let iteration = 0; iteration < maxIterations; iteration += 1) {
		const nextBeam = [...beam];

		for (const schedule of beam) {
				for (const candidate of additionalOfferings) {
					const singleUseCategory = getSingleUseRequirementCategory(candidate.course);
					if (singleUseCategory && schedule.offerings.some((offering) => getSingleUseRequirementCategory(offering.course) === singleUseCategory)) {
						continue;
					}

					if (schedule.courseKeys.has(candidate.course.baseCode) || schedule.sectionKeys.has(candidate.sectionKey) || scheduleHasConflict(schedule, candidate)) {
						continue;
					}

					if ((schedule.totalCredits + candidate.course.credits) > creditCeiling) {
						continue;
					}

				const fycSatisfied = requirementState.waivedCounts.fyc > 0 || requirementState.completedCounts.fyc > 0;
				if (!prerequisiteSatisfied(candidate.course, buildCompletedCodeSet(intent), schedule.courseKeys, fycSatisfied)) {
					continue;
				}

				const nextSchedule: BeamSchedule = {
					offerings: [...schedule.offerings, candidate],
					courseKeys: new Set([...schedule.courseKeys, candidate.course.baseCode]),
					sectionKeys: new Set([...schedule.sectionKeys, candidate.sectionKey]),
					totalCredits: schedule.totalCredits + candidate.course.credits,
					score: 0,
				};
				nextSchedule.score = scoreBeamSchedule(nextSchedule, intent, requirementState);
				nextBeam.push(nextSchedule);
			}
		}

		beam = dedupeSchedules(nextBeam)
			.sort((left, right) => right.score - left.score)
			.slice(0, 50);
	}

	const suitable = beam.filter((schedule) =>
		schedule.totalCredits >= intent.minCredits
		&& schedule.totalCredits <= intent.maxCredits
		&& schedule.offerings.length >= intent.minCourseCount
	);

	return {
		schedule: (suitable[0] || beam[0] || createEmptySchedule()),
		warnings,
	};
}

function buildRequirementStatusItems(
	requirementState: RequirementState,
	selectedCoverage: RequirementCoverage
): RequirementStatusItem[] {
	const remainingAfterPlan = subtractCounts(requirementState.remainingBeforePlan, selectedCoverage.counts);
	const items: RequirementStatusItem[] = [];

	for (const category of [
		...WK_CATEGORIES,
		...SW_CATEGORIES,
		"connections",
		"fyc",
		"fyf",
		"fys",
		"capstone",
	] satisfies RequirementCategoryId[]) {
		if (requirementState.baseCounts[category] <= 0) {
			continue;
		}

		items.push({
			id: category,
			label: CATEGORY_LABELS[category],
			required: requirementState.requiredAfterWaivers[category],
			completedBeforePlan: requirementState.completedCounts[category],
			plannedNow: selectedCoverage.counts[category],
			waived: requirementState.waivedCounts[category],
			remainingAfterPlan: remainingAfterPlan[category],
		});
	}

	return items;
}

function buildCourseReasons(
	offering: ScheduleOffering,
	intent: PlannerIntent,
	requirementAssignments: RequirementAssignment[]
): string[] {
	const reasons: string[] = [];
	const covered = requirementAssignments
		.filter((assignment) => assignment.courseKey === offering.course.baseCode)
		.map((assignment) => CATEGORY_LABELS[assignment.category]);

	if (intent.requestedCourseCodes.includes(offering.course.baseCode)) {
		reasons.push("You explicitly requested this course.");
	}

	if (covered.length > 0) {
		reasons.push(`Covers ${covered.join(", ")}.`);
	}

	if (intent.preferredDepartments.includes(offering.course.prefix)) {
		reasons.push(`Keeps momentum in ${offering.course.prefix}.`);
	}

	reasons.push(...offering.poeReasons);

	if (Number(offering.section.availability?.available || 0) > 0) {
		reasons.push(`${offering.section.availability.available} open seats right now.`);
	}

	if (intent.avoidDays.length > 0) {
		const avoidsAllDays = getMeetings(offering.section).every((meeting) => getMeetingDays(meeting).every((day) => !intent.avoidDays.includes(day)));
		if (avoidsAllDays) {
			reasons.push(`Fits your ${intent.avoidDays.map((day) => DAY_LABELS[day]).join("/")} avoidance preference.`);
		}
	}

	return unique(reasons).length > 0 ? unique(reasons) : ["Strong fit based on your remaining requirements and current schedule preferences."];
}

function buildPlannedCourses(
	schedule: BeamSchedule,
	intent: PlannerIntent,
	selectedCoverage: RequirementCoverage
): PlannedCourse[] {
	return schedule.offerings.map((offering) => ({
		courseCode: offering.course.courseCode,
		title: offering.course.title,
		credits: offering.course.credits,
		categories: offering.course.requirementOptions.map((category) => CATEGORY_LABELS[category]),
		reasons: buildCourseReasons(offering, intent, selectedCoverage.assignments),
		section: {
			sectionName: offering.section.section_name,
			term: offering.section.term,
			status: offering.section.status,
			location: offering.section.location,
			openSeats: Number(offering.section.availability?.available || 0),
			capacity: Number(offering.section.availability?.capacity || 0),
			waitlisted: Number(offering.section.availability?.waitlisted || 0),
			instructors: (offering.section.instructors || []).map((instructor) => instructor.name).filter(Boolean),
			meetings: getMeetings(offering.section).map(formatMeeting),
		},
	}));
}

function buildAlternatives(
	allOfferings: ScheduleOffering[],
	finalSchedule: BeamSchedule,
	requirementState: RequirementState,
	selectedCoverage: RequirementCoverage
): AlternativeSuggestion[] {
	const remainingAfterPlan = subtractCounts(requirementState.remainingBeforePlan, selectedCoverage.counts);
	const scheduledKeys = finalSchedule.courseKeys;
	const suggestions: AlternativeSuggestion[] = [];

	for (const category of [...WK_CATEGORIES, ...SW_CATEGORIES, ...DIRECT_REQUIREMENT_CATEGORIES] satisfies RequirementCategoryId[]) {
		if (remainingAfterPlan[category] <= 0) {
			continue;
		}

		const options = allOfferings
			.filter((offering) => !scheduledKeys.has(offering.course.baseCode) && offering.course.requirementOptions.includes(category))
			.filter((offering) => !finalSchedule.offerings.some((scheduled) => sectionsConflict(scheduled.section, offering.section)))
			.sort((left, right) => (right.baseScore + right.sectionScore) - (left.baseScore + left.sectionScore))
			.slice(0, 3)
				.map((offering) => ({
					courseCode: offering.course.courseCode,
					title: offering.course.title,
					credits: offering.course.credits,
					meetings: getMeetings(offering.section).map(formatMeeting),
					reason: Number(offering.section.availability?.available || 0) > 0
						? `Open section that can satisfy ${CATEGORY_LABELS[category]}.`
						: `Potential fit for ${CATEGORY_LABELS[category]} if you are okay with a closed or waitlisted section.`,
			}));

		suggestions.push({
			requirement: CATEGORY_LABELS[category],
			options,
		});
	}

	return suggestions.filter((suggestion) => suggestion.options.length > 0);
}

export function buildCompletedCourseFilters(courseCodes: string[]): Record<string, unknown>[] {
	return unique(courseCodes.map(normalizeCourseCode)).map((courseCode) => ({
		course_code: {
			$regex: /^[A-Z]{2,4}-\d{3}$/.test(courseCode)
				? `^${escapeRegex(courseCode)}(?:CW)?(?:-[0-9]{2})?$`
				: `^${escapeRegex(courseCode)}(?:-[0-9]{2})?$`,
			$options: "i",
		},
	}));
}

export function planOptimalSchedule(
	request: SchedulePlanningRequest,
	availableCourses: Course[],
	completedCatalogCourses: Course[]
): SchedulePlanningResult {
	const poeProfile = getPoeRequirementProfile(request.poe || "");
	const capstoneCourseCodes = poeProfile ? getPoeCapstoneCourseCodes(poeProfile) : undefined;
	const intent = derivePlannerIntent(request);
	if (poeProfile) {
		intent.preferredDepartments = unique([...intent.preferredDepartments, ...poeProfile.preferredPrefixes]);
	}
	const normalizedAvailableCourses = normalizeCourses(availableCourses, request.term, capstoneCourseCodes);
	const normalizedCompletedCourses = normalizeCourses(completedCatalogCourses, undefined, capstoneCourseCodes);
	const completedPoeCourses = buildPoeCompletedCourses(intent.completedCourseCodes, normalizedCompletedCourses);
	const poeBeforePlan = poeProfile ? evaluatePoeRequirements(poeProfile, completedPoeCourses) : null;
	const requirementState = buildRequirementState(request, intent, normalizedCompletedCourses, normalizedAvailableCourses);
	const offeringPool = buildOfferingPool(normalizedAvailableCourses, intent, requirementState, poeBeforePlan);
	const scheduleState = buildBestSchedule(offeringPool.offerings, intent, requirementState);
	const finalSchedule = scheduleState.schedule;
	const selectedCoverage = evaluateSelectedCoverage(finalSchedule.offerings.map((offering) => offering.course), requirementState);
	const requirements = buildRequirementStatusItems(requirementState, selectedCoverage);
	const plannedCourses = buildPlannedCourses(finalSchedule, intent, selectedCoverage);
	const poeAfterPlan = poeProfile
		? evaluatePoeRequirements(
			poeProfile,
			completedPoeCourses,
			finalSchedule.offerings.map((offering) => toPoeCourseLike(offering.course))
		)
		: null;

	const warnings = unique([
		...offeringPool.warnings,
		...scheduleState.warnings,
		...(plannedCourses.length === 0 ? ["I could not build a conflict-free schedule from the available data for that term."] : []),
	]);

	return {
		term: request.term,
		recognized: {
			completedCourseCodes: intent.completedCourseCodes,
			requestedCourseCodes: intent.requestedCourseCodes,
			preferredDepartments: intent.preferredDepartments,
			targetCredits: intent.targetCredits,
			targetCourseCount: intent.targetCourseCount,
		},
			schedule: {
				totalCredits: finalSchedule.totalCredits,
				courseCount: plannedCourses.length,
				courses: plannedCourses,
			},
			requirements,
			poeProgress: poeAfterPlan ? {
				poe: poeAfterPlan.profile.name,
				catalogSource: poeAfterPlan.profile.catalogSource,
				poeCreditTotal: poeAfterPlan.profile.poeCreditTotal,
				minimumUpperLevelCredits: poeAfterPlan.profile.minimumUpperLevelCredits,
				requirements: poeAfterPlan.items,
				notes: [
					...(poeAfterPlan.profile.notes || []),
					"Catalog POE requirements guide planning, but actual scheduled and backup courses are pulled from the AlfieAI course catalog in MongoDB for the selected term.",
				],
			} : null,
			waiverSummary: requirementState.waiverSummary,
			warnings,
			alternatives: buildAlternatives(offeringPool.offerings, finalSchedule, requirementState, selectedCoverage),
			notes: [
				"Gen-ed matches are inferred from the catalog's course-type tags plus the waiver charts you provided.",
				"Transfer, AP, and outside coursework can only be recognized from the transcript text or waiver inputs you provide here.",
				...(poeAfterPlan ? [`POE planning is using ${poeAfterPlan.profile.catalogSource}.`] : request.poe ? [`Detailed catalog-based POE course modeling is not yet available for ${request.poe}, so scheduling is falling back to gen-ed plus department-fit heuristics.`] : []),
				"Prerequisite checks are heuristic and should still be confirmed against the official registrar or advisor guidance.",
			],
		};
}
