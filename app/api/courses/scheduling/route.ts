import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { Course } from "@/lib/models/course";
import {
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

const candidateModelIDs = [
	process.env.GEMINI_SCHEDULER_MODEL_ID,
	process.env.GEMINI_COURSES_MODEL_ID,
	process.env.GEMINI_MODEL_ID,
	"gemini-3-flash-preview",
	"gemini-2.5-flash",
	"gemini-2.5-pro",
].filter((modelID, index, allModelIDs): modelID is string => Boolean(modelID) && allModelIDs.indexOf(modelID) === index);

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
	requirementMentions: string[];
	transferMentions: string[];
}

interface ModelScheduleOutput {
	results: {
		courses: ScheduleModelCourseSelection[];
		reasoning: string;
	};
}

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
	return code.trim().toUpperCase();
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

function collectTranscriptEvidence(transcriptText: string): TranscriptEvidence {
	if (!transcriptText.trim()) {
		return {
			transcriptDetected: false,
			completedCourseCodes: [],
			requirementMentions: [],
			transferMentions: [],
		};
	}

	const completed = new Set<string>();
	const requirements = new Set<string>();
	const transfers = new Set<string>();

	for (const line of transcriptText.split(/\r?\n/)) {
		const parts = line.split("|").map((part) => part.trim());
		const kind = (parts[0] || "").toUpperCase();

		if (kind === "COMPLETED" && parts[2]) {
			completed.add(normalizeCourseCode(parts[2]));
		}
		if (kind === "REQUIREMENT" && parts[1]) {
			requirements.add(parts[1]);
		}
		if (kind === "TRANSFER" && parts[2]) {
			transfers.add(parts[2]);
		}
	}

	return {
		transcriptDetected: true,
		completedCourseCodes: Array.from(completed),
		requirementMentions: Array.from(requirements),
		transferMentions: Array.from(transfers),
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

	const plannerPrompt = [
		"You are AlfieAI Courses.",
		"Build one term schedule recommendations using only the available course catalog data provided.",
		"Return ONLY valid JSON that matches the required schema.",
		"Do not include markdown, prose outside JSON, or extra keys.",
		"Rules:",
		"1) Include both primary and backup courses in results.courses.",
		"2) Use primary=true for recommended first-choice schedule courses.",
		"3) Use primary=false for backup or nice-to-have options.",
		"4) Use only course codes present in availableCourses.",
		"5) NEVER include any course whose course_code appears in transcriptEvidence.completedCourseCodes — those courses have already been completed by the student.",
		"6) Choose primary courses so that no two of them share a day with overlapping start/end times — time conflicts are not allowed in the primary schedule.",
		"7) Aim for coherent schedule fit using term, primary POEs, secondary emphases, transcript evidence, and user guidance.",
		"8) results.reasoning should explain how the choices satisfy the student's goals and constraints.",
		"Input payload follows as JSON:",
		JSON.stringify(payload),
	].join("\n");

	let lastError: unknown;
	for (const modelID of candidateModelIDs) {
		try {
			const response = await genAI.models.generateContent({
				model: modelID,
				contents: plannerPrompt,
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

		if (!term) {
			return NextResponse.json({ error: "A term is required to generate a schedule." }, { status: 400 });
		}
		if (primaryPoes.length === 0) {
			return NextResponse.json({ error: "Please choose at least one primary POE before generating your schedule." }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
		const collection = db.collection<Course>(process.env.MONGODB_COURSES_COLLECTION || "courses");

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

		const [{ transcriptText, transcriptWarning }, availableCourses] = await Promise.all([
			transcriptPromise,
			availableCoursesPromise,
		]);

		const transcriptEvidence = collectTranscriptEvidence(transcriptText);

		if (availableCourses.length === 0) {
			return NextResponse.json({ error: `No course offerings were found for ${term}.` }, { status: 404 });
		}

		// Remove courses the student already completed from the catalog sent to the model
		const completedSet = new Set(transcriptEvidence.completedCourseCodes.map(normalizeCourseCode));
		const filteredCourses = completedSet.size > 0
			? availableCourses.filter((c) => !completedSet.has(normalizeCourseCode(c.course_code)))
			: availableCourses;

		const modelOutput = await generateModelSchedule({
			term,
			primaryPoes,
			secondaryEmphases,
			guidance: guidance || "No explicit student guidance provided.",
			transcriptEvidence,
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

		const selectedMap = new Map(
			selectedCourses.map((course) => [normalizeCourseCode(course.course_code), course])
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

		const backupCourses = allSelectedCourses.filter((course) => !course.primary);
		const notes = [
			`Term catalog grounding used ${availableCourses.length} available course records for ${term}.`,
			`Primary POEs used for planning: ${primaryPoes.join(", ")}.`,
			`AlfieAI selected ${allSelectedCourses.length} matched courses (${primaryCourses.length} primary, ${backupCourses.length} backup).`,
			transcriptEvidence.transcriptDetected
				? `Degree-progress evidence recognized ${transcriptEvidence.completedCourseCodes.length} completed courses and ${transcriptEvidence.requirementMentions.length} requirement markers.`
				: "No parsed degree-progress evidence was available for this run.",
		];

		const response: ScheduleGenerationResult = {
			term,
			poe,
			primaryPoes,
			secondaryEmphases,
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
