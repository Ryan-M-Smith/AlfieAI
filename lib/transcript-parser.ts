import { readFile } from "node:fs/promises";
import path from "node:path";

import { GoogleGenAI } from "@google/genai";
import PDFParser, { Output, Page, Text } from "pdf2json";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const candidateModelIDs = ["gemini-3-flash-preview"];

const MAX_RAW_TRANSCRIPT_CHARS = Number(process.env.TRANSCRIPT_MAX_RAW_CHARS || 120000);
const MAX_JSON_MODEL_CHARS = Number(process.env.TRANSCRIPT_MAX_JSON_MODEL_CHARS || 70000);
const ENABLE_TRANSCRIPT_MODEL_ENRICHMENT = process.env.TRANSCRIPT_MODEL_ENRICHMENT !== "false";
const PDF_LINE_Y_TOLERANCE = 0.35;
const TRANSCRIPT_PARSER_STRATEGY = (process.env.TRANSCRIPT_PARSER_STRATEGY || "ai-first").toLowerCase();
const REQUIREMENT_LABELS = [
	// Fixed/named requirements
	"First-Year Composition",
	"First-Year Foundations",
	"First-Year Seminar",
	"Connections",
	"Capstone",
	// Ways of Knowing
	"Creative Expression",
	"Formal Reasoning",
	"Humanistic Thought",
	"Scientific Process",
	"Social Inquiry",
	// Self and the World
	"Ethical Responsibility",
	"Global Engagement",
	"Local Engagement",
	"U.S. Experience",
];
const REQUIREMENT_STATUS_PATTERN = /(?:\b(?:complete(?:d)?|fulfilled|satisfied|met|waived|pending|remaining|in[-\s]?progress|equivalency|noncourse)\b|[✓✔☑])/i;
const REQUIREMENT_HINT_PATTERN = /\b(?:requirement|requirements?|composition|foundations?|seminars?|connections?|capstone|gen(?:eral)?[\s-]*ed(?:ucation)?|distribution|poe|program of emphasis|reasoning|inquiry|expression|engagement|responsibility|humanistic|creative|ethical|scientific|social|knowing|experience)\b/i;
const FINAL_GRADE_TOKEN = /^(?:A|A-|A\+|B|B-|B\+|C|C-|C\+|D|D-|D\+|F|P|S|CR|NC)$/i;
const NON_FINAL_GRADE_TOKEN = /^(?:IP|I|W|AU|NR|WP|WF)$/i;
const TRANSCRIPT_PROMPT_FILE = path.join(process.cwd(), "prompts", "transcript-parser-prompt.md");

const DEFAULT_PDF_TO_JSON_PROMPT = [
	"You are parsing a Self-Service Degree Progress PDF for scheduling.",
	"Read the PDF directly, including OCR if needed.",
	"Return JSON only with this exact shape:",
	"{\"completed\":[{\"term\":\"\",\"courseCode\":\"\",\"title\":\"\",\"credits\":\"\",\"grade\":\"\"}],\"planned\":[{\"term\":\"\",\"courseCode\":\"\",\"title\":\"\"}],\"transfer\":[{\"term\":\"\",\"courseCode\":\"\",\"title\":\"\",\"credits\":\"\"}],\"requirements\":[{\"label\":\"\",\"status\":\"\"}],\"poeSections\":[{\"label\":\"\",\"courses\":[{\"courseCode\":\"\",\"title\":\"\",\"status\":\"\",\"grade\":\"\",\"term\":\"\",\"credits\":\"\"}]}]}",
	"Rules:",
	"- Preserve course suffixes exactly when visible (e.g. BI-305CW, CS-255C).",
	"- Use completed for final/earned-credit courses.",
	"- Use planned for in-progress or non-final courses.",
	"- Use transfer for AP/transfer/test credit.",
	"- requirements should contain an entry for EVERY gen-ed and core requirement section visible in the PDF. Use the exact section label (e.g. \"First-Year Composition\", \"Humanistic Thought\", \"Global Engagement\", \"Capstone\") as the label field.",
	"- Valid requirement status values: completed, waived, in-progress, pending, or unknown.",
	"- Use \"waived\" when the section is marked Waived or fulfilled via Noncourse Equivalency.",
	"- Use \"completed\" when the section shows all required courses/credits completed (e.g. \"1 of 1 Completed\" or \"3 of 3 Credits Completed\").",
	"- poeSections: For EVERY named POE/program-of-emphasis requirement section in the PDF (e.g. 'Data Science Core', 'Data Science Elective Credits', 'Computer Science Core Requirements'), include the section label and ALL courses listed in its requirement table. The label MUST always include the parent program name — if the PDF section heading is just 'Core Requirements', 'Elective Courses', or 'Capstone' nested under a 'Data Science' heading, use 'Data Science Core Requirements', 'Data Science Elective Courses', 'Data Science Capstone'. Strip any leading letter prefix like 'A.' but never strip the program name. For each course record the exact courseCode, title, status (completed/in_progress/remaining), grade, term, and credits as shown in the table.",
	"- If unreadable, return empty arrays for all keys.",
].join("\n");

const DEFAULT_JSON_TO_LINES_PROMPT = [
	"You are helping a college schedule planner read transcript JSON extracted from a Self-Service Degree Progress PDF.",
	"Convert the JSON into strict line-oriented records for downstream rule-based parsing.",
	"Do not summarize and do not invent courses.",
	"Output only lines in one of these formats:",
	"COMPLETED | <Term> | <CourseCode> | <CourseTitle> | <Credits> | <Grade>",
	"PLANNED | <Term> | <CourseCode> | <CourseTitle>",
	"TRANSFER | <Term> | <CourseCodeOrLabel> | <CourseTitle> | <Credits>",
	"REQUIREMENT | <RequirementLabel> | <Status>",
	"Use COMPLETED for classes with earned credit or final grades.",
	"Use PLANNED for in-progress or non-final classes.",
	"Use TRANSFER for AP, placement, or transfer credit.",
	"For requirement status, use completed, pending, in-progress, or unknown.",
	"Normalize term labels to Spring Term YYYY, Summer Term YYYY, or Fall Term YYYY when visible.",
	"Preserve course suffixes exactly when present, e.g. BI-305CW, CS-255C.",
	"If no readable transcript content is available, output exactly: UNREADABLE TRANSCRIPT",
	"Transcript JSON starts now:",
	"<payload_json_here>",
].join("\n");

let cachedTranscriptPrompts: {
	pdfToJsonPrompt: string;
	jsonToLinesPrompt: string;
} | null = null;

interface TranscriptPdfPageJson {
	pageNumber: number;
	lines: string[];
}

interface TranscriptPdfJson {
	pageCount: number;
	pages: TranscriptPdfPageJson[];
	flattenedLines: string[];
}

interface TranscriptModelJsonRecord {
	term?: string;
	courseCode?: string;
	title?: string;
	credits?: string | number;
	grade?: string;
}

interface TranscriptModelRequirement {
	label?: string;
	status?: string;
}

interface TranscriptPoeSectionCourse {
	courseCode?: string;
	title?: string;
	/** "completed" | "in_progress" | "remaining" as reported in the PDF section table */
	status?: string;
	grade?: string;
	term?: string;
	credits?: string | number;
}

interface TranscriptPoeSectionJson {
	label?: string;
	courses?: TranscriptPoeSectionCourse[];
}

interface TranscriptModelJson {
	completed?: TranscriptModelJsonRecord[];
	planned?: TranscriptModelJsonRecord[];
	transfer?: TranscriptModelJsonRecord[];
	requirements?: Array<string | TranscriptModelRequirement>;
	/** Named POE requirement sections extracted directly from the degree progress PDF */
	poeSections?: TranscriptPoeSectionJson[];
}

function extractTextCodeBlocks(markdown: string): string[] {
	const blocks: string[] = [];
	const pattern = /```text\s*\n([\s\S]*?)```/gi;
	let match: RegExpExecArray | null = null;

	for (;;) {
		match = pattern.exec(markdown);
		if (!match) {
			break;
		}

		const block = match[1]?.trim();
		if (block) {
			blocks.push(block);
		}
	}

	return blocks;
}

async function loadTranscriptPrompts(): Promise<{
	pdfToJsonPrompt: string;
	jsonToLinesPrompt: string;
}> {
	if (cachedTranscriptPrompts) {
		return cachedTranscriptPrompts;
	}

	try {
		const markdown = await readFile(TRANSCRIPT_PROMPT_FILE, "utf8");
		const blocks = extractTextCodeBlocks(markdown);

		if (blocks.length >= 2) {
			cachedTranscriptPrompts = {
				pdfToJsonPrompt: blocks[0],
				jsonToLinesPrompt: blocks[1],
			};
			return cachedTranscriptPrompts;
		}
	}
	catch (error) {
		console.warn("Failed to load transcript parser prompts from markdown file. Using defaults.", error);
	}

	cachedTranscriptPrompts = {
		pdfToJsonPrompt: DEFAULT_PDF_TO_JSON_PROMPT,
		jsonToLinesPrompt: DEFAULT_JSON_TO_LINES_PROMPT,
	};

	return cachedTranscriptPrompts;
}

function buildJsonToLinesPrompt(template: string, payload: string): string {
	if (template.includes("<payload_json_here>")) {
		return template.replace("<payload_json_here>", payload);
	}

	if (/Transcript JSON starts now:/i.test(template)) {
		return `${template}\n${payload}`;
	}

	return `${template}\nTranscript JSON starts now:\n${payload}`;
}

function isMissingModelError(error: unknown): boolean {
	return error instanceof Error && /models\/.+(not found|not supported)/i.test(error.message);
}

function normalizeWhitespace(value: string): string {
	return value.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeRawTranscriptText(value: string): string {
	return value
		.replace(/\u00A0/g, " ")
		.replace(/\r/g, "\n")
		.split(/\n+/)
		.map((line) => normalizeWhitespace(line))
		.filter(Boolean)
		.join("\n");
}

function decodePdfTextToken(value: string): string {
	try {
		return decodeURIComponent(value || "");
	}
	catch {
		return value || "";
	}
}

function parsePdfTextItem(item: Text): { x: number; y: number; text: string } | null {
	const text = (item.R || [])
		.map((run) => decodePdfTextToken(run.T || ""))
		.join(" ");
	const normalized = normalizeWhitespace(text);
	if (!normalized) {
		return null;
	}

	return {
		x: Number(item.x || 0),
		y: Number(item.y || 0),
		text: normalized,
	};
}

function buildPageLines(page: Page): string[] {
	const entries = (page.Texts || [])
		.map(parsePdfTextItem)
		.filter((item): item is { x: number; y: number; text: string } => Boolean(item))
		.sort((left, right) => {
			const yDiff = left.y - right.y;
			if (Math.abs(yDiff) > PDF_LINE_Y_TOLERANCE) {
				return yDiff;
			}

			return left.x - right.x;
		});

	const buckets: Array<{ y: number; items: Array<{ x: number; text: string }> }> = [];
	for (const entry of entries) {
		const existing = buckets.find((bucket) => Math.abs(bucket.y - entry.y) <= PDF_LINE_Y_TOLERANCE);
		if (!existing) {
			buckets.push({
				y: entry.y,
				items: [{ x: entry.x, text: entry.text }],
			});
			continue;
		}

		existing.items.push({ x: entry.x, text: entry.text });
	}

	const lines = buckets
		.sort((left, right) => left.y - right.y)
		.map((bucket) => bucket.items
			.sort((left, right) => left.x - right.x)
			.map((item) => item.text)
			.join(" "))
		.map((line) => normalizeWhitespace(line))
		.filter((line) => line.length > 1);

	return Array.from(new Set(lines));
}

async function extractTranscriptJsonWithPdf2Json(pdfBuffer: Uint8Array): Promise<TranscriptPdfJson> {
	const parser = new PDFParser(null, true);

	const output = await new Promise<Output>((resolve, reject) => {
		parser.on("pdfParser_dataError", (errorData) => {
			const parserError = errorData instanceof Error
				? errorData
				: ("parserError" in errorData && errorData.parserError instanceof Error ? errorData.parserError : new Error("Unknown PDF parser error."));
			reject(parserError);
		});

		parser.on("pdfParser_dataReady", (pdfData) => {
			resolve(pdfData);
		});

		// pdf2json emits benign console warnings for unsupported PDF annotation types
		// (e.g. "NOT valid form element", "Unsupported: field.type of Link"). Suppress them.
		const originalWarn = console.warn;
		console.warn = () => {};
		parser.parseBuffer(Buffer.from(pdfBuffer));
		console.warn = originalWarn;
	});

	parser.destroy();

	const pages = (output.Pages || []).map((page, index) => ({
		pageNumber: index + 1,
		lines: buildPageLines(page),
	}));
	const flattenedLines = pages.flatMap((page) => page.lines);

	return {
		pageCount: pages.length,
		pages,
		flattenedLines,
	};
}

async function extractTranscriptJsonFromPdf(pdfBuffer: Uint8Array): Promise<TranscriptPdfJson> {
	try {
		return await extractTranscriptJsonWithPdf2Json(pdfBuffer);
	}
	catch (error) {
		console.warn("pdf2json transcript extraction failed.", error);
		return {
			pageCount: 0,
			pages: [],
			flattenedLines: [],
		};
	}
}

function normalizeTranscriptTerm(rawValue: string): string {
	const longMatch = rawValue.match(/\b(Spring|Summer|Fall)\s*(?:Term\s*)?(20\d{2})\b/i);
	if (longMatch) {
		const season = longMatch[1].charAt(0).toUpperCase() + longMatch[1].slice(1).toLowerCase();
		return `${season} Term ${longMatch[2]}`;
	}

	// Handle compact form: "23/FA", "24/SP", "25/SU"
	const shortMatch = rawValue.match(/\b(\d{2})\/(FA|SP|SU)\b/i);
	if (shortMatch) {
		const year = 2000 + Number(shortMatch[1]);
		const seasonMap: Record<string, string> = { FA: "Fall", SP: "Spring", SU: "Summer" };
		return `${seasonMap[shortMatch[2].toUpperCase()]} Term ${year}`;
	}

	return "";
}

function findTrailingGrade(value: string): string {
	const tokens = value
		.split(/\s+/)
		.map((token) => token.replace(/[^A-Za-z+-]/g, "").toUpperCase())
		.filter(Boolean);

	for (let index = tokens.length - 1; index >= 0; index -= 1) {
		if (FINAL_GRADE_TOKEN.test(tokens[index]) || NON_FINAL_GRADE_TOKEN.test(tokens[index])) {
			return tokens[index];
		}
	}

	return "";
}

function findCredits(value: string): string {
	const matches = Array.from(value.matchAll(/\b(\d{1,2}(?:\.\d{1,2})?)\b/g));
	if (matches.length === 0) {
		return "";
	}

	for (let index = matches.length - 1; index >= 0; index -= 1) {
		const numeric = Number(matches[index][1]);
		if (!Number.isNaN(numeric) && numeric > 0 && numeric <= 8) {
			return numeric.toFixed(2);
		}
	}

	return "";
}

function parseCourseCodeFromLine(line: string): string {
	const match = line.match(/\b([A-Z]{2,4})\s*[- ]?\s*(\d{3}[A-Z]{0,2}|1XX(?:TR)?)\b/i);
	if (!match) {
		return "";
	}

	const prefix = match[1].toUpperCase();
	const suffix = match[2].toUpperCase();
	return `${prefix}-${suffix}`;
}

function parseCourseTitle(line: string, courseCode: string, credits: string, grade: string): string {
	let working = line;
	working = working.replace(new RegExp(courseCode.replace("-", "\\s*[- ]?\\s*"), "i"), " ");
	if (grade) {
		working = working.replace(new RegExp(`\\b${grade}\\b`, "i"), " ");
	}
	if (credits) {
		working = working.replace(new RegExp(`\\b${credits.replace(".", "\\.")}\\b`), " ");
	}

	return normalizeWhitespace(working);
}

function isFinalGrade(grade: string): boolean {
	return Boolean(grade) && FINAL_GRADE_TOKEN.test(grade);
}

function isNonFinalGrade(grade: string): boolean {
	return Boolean(grade) && NON_FINAL_GRADE_TOKEN.test(grade);
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

function formatRequirementRecord(label: string, status: "completed" | "waived" | "pending" | "in-progress" | "unknown"): string {
	if (!label) {
		return "";
	}

	return `REQUIREMENT | ${label} | ${status}`;
}

function extractRequirementLabel(line: string): { label: string; status: "completed" | "waived" | "pending" | "in-progress" | "unknown" } | null {
	// If the line contains an exact known label, only require a status token (bypass hint check)
	const hasKnownLabel = REQUIREMENT_LABELS.some((l) => new RegExp(l, "i").test(line));
	if (!REQUIREMENT_STATUS_PATTERN.test(line) || (!hasKnownLabel && !REQUIREMENT_HINT_PATTERN.test(line))) {
		return null;
	}

	const status = normalizeRequirementStatus(line);

	for (const label of REQUIREMENT_LABELS) {
		if (new RegExp(label, "i").test(line)) {
			return { label, status };
		}
	}

	const cleaned = normalizeWhitespace(
		line
			.replace(/^[\s\-*.()\d:•]+/, "")
			.replace(/\b(?:status|result)\b\s*:?/gi, " ")
			.replace(/\b(?:is\s+)?(?:complete(?:d)?|fulfilled|satisfied|met|waived|pending|remaining|in[-\s]?progress)\b.*$/i, "")
			.replace(/[✓✔☑]/g, " ")
	);

	if (!cleaned || cleaned.length < 3) {
		return null;
	}

	const label = cleaned.length <= 96 ? cleaned : `${cleaned.slice(0, 93)}...`;
	return { label, status };
}

function buildDeterministicTranscript(rawTranscript: string): string {
	if (!rawTranscript.trim()) {
		return "";
	}

	const lines = rawTranscript
		.split(/\r?\n+/)
		.map((line) => normalizeWhitespace(line))
		.filter((line) => line.length > 2);

	let currentTerm = "";
	const output = new Set<string>();

	let totalCreditsAll: number | null = null;
	let totalCreditsSchool: number | null = null;
	let studentId: string | null = null;
	// For multi-line requirement detection: track a label seen without a status
	let pendingReqLabel: string | null = null;
	let pendingReqLineIndex = -1;
	let lineIndex = 0;

	for (const line of lines) {
		lineIndex++;

		// Detect student ID: "Student ID: 1234567" or "ID: 1234567" or "Name (1234567)" (Ellucian header format)
		if (!studentId) {
			const idMatch = line.match(/(?:student\s+(?:id|number)|\bid\s*(?:number|#|no\.?)?)\s*[:#]?\s*(\d{5,10})\b/i)
				?? line.match(/^[A-Za-z][A-Za-z ,.'\-]+\((\d{6,8})\)\s*$/i);
			if (idMatch) {
				studentId = idMatch[1];
			}
		}

		// Multi-line requirement detection: if a known label appears without a status,
		// record it as pending and apply the next nearby status line to it.
		const labelWithoutStatus = REQUIREMENT_LABELS.find(
			(l) => new RegExp(l, "i").test(line) && !REQUIREMENT_STATUS_PATTERN.test(line)
		);
		if (labelWithoutStatus) {
			pendingReqLabel = labelWithoutStatus;
			pendingReqLineIndex = lineIndex;
		}

		// If we have a pending label and the current line has a status, resolve it
		if (pendingReqLabel && lineIndex > pendingReqLineIndex && lineIndex <= pendingReqLineIndex + 8) {
			if (REQUIREMENT_STATUS_PATTERN.test(line)) {
				const resolvedStatus = normalizeRequirementStatus(line);
				if (resolvedStatus !== "unknown") {
					const record = formatRequirementRecord(pendingReqLabel, resolvedStatus);
					if (record) {
						output.add(record);
					}
					pendingReqLabel = null;
				}
			}
		} else if (pendingReqLabel && lineIndex > pendingReqLineIndex + 8) {
			pendingReqLabel = null; // window expired
		}

		// Detect "Total Credits from this School  127  of  120" before other logic
		const schoolCreditsMatch = line.match(/total\s+credits?\s+from\s+this\s+school[^0-9]*(\d+(?:\.\d+)?)/i);
		if (schoolCreditsMatch) {
			totalCreditsSchool = Number(schoolCreditsMatch[1]);
		}

		// Detect "Total Credits  137  of  120" (but not the "from this school" variant)
		if (!schoolCreditsMatch) {
			const totalCreditsMatch = line.match(/^total\s+credits?[^a-z]*(\d+(?:\.\d+)?)/i);
			if (totalCreditsMatch) {
				totalCreditsAll = Number(totalCreditsMatch[1]);
			}
		}

		const inferredTerm = normalizeTranscriptTerm(line);
		if (inferredTerm) {
			currentTerm = inferredTerm;
		}

		const requirement = extractRequirementLabel(line);
		if (requirement) {
			const requirementRecord = formatRequirementRecord(requirement.label, requirement.status);
			if (requirementRecord) {
				output.add(requirementRecord);
			}
		}

		const courseCode = parseCourseCodeFromLine(line);
		if (!courseCode) {
			continue;
		}

		const grade = findTrailingGrade(line);
		const credits = findCredits(line);
		const title = parseCourseTitle(line, courseCode, credits, grade);
		const courseTerm = currentTerm || "Unknown Term";
		const transferLike = /\b(?:AP|TRANSFER|PLACEMENT|TEST CREDIT|TR)\b/i.test(line) || /-1XX(?:TR)?$/i.test(courseCode);

		if (transferLike) {
			output.add(`TRANSFER | ${courseTerm} | ${courseCode} | ${title || "Transfer Credit"} | ${credits || "0.00"}`);
			continue;
		}

		if (isFinalGrade(grade)) {
			output.add(`COMPLETED | ${courseTerm} | ${courseCode} | ${title || "Untitled Course"} | ${credits || "0.00"} | ${grade}`);
			continue;
		}

		if (isNonFinalGrade(grade)) {
			output.add(`PLANNED | ${courseTerm} | ${courseCode} | ${title || "Untitled Course"}`);
		}
	}

	if (totalCreditsAll !== null) {
		output.add(`CREDIT_TOTALS | ${totalCreditsAll} | ${totalCreditsSchool ?? ""}`);
	}
	if (studentId) {
		output.add(`STUDENT_ID | ${studentId}`);
	}

	return Array.from(output).join("\n");
}

function normalizeStructuredOutput(text: string): string {
	if (!text.trim()) {
		return "";
	}

	const normalized = text
		.replace(/^```json\s*/i, "")
		.replace(/^```\s*/i, "")
		.replace(/\s*```$/i, "")
		.split(/\r?\n+/)
		.map((line) => normalizeWhitespace(line))
		.filter((line) => /^(COMPLETED|PLANNED|TRANSFER|REQUIREMENT|CREDIT_TOTALS|STUDENT_ID|POE_COURSE)\s*\|/i.test(line));

	return Array.from(new Set(normalized)).join("\n");
}

function countRequirementLines(text: string): number {
	return text
		.split(/\r?\n+/)
		.map((line) => line.trim())
		.filter((line) => /^REQUIREMENT\s*\|/i.test(line)).length;
}

function parseTranscriptModelJson(text: string): TranscriptModelJson | null {
	const normalized = text
		.trim()
		.replace(/^```json\s*/i, "")
		.replace(/^```\s*/i, "")
		.replace(/\s*```$/i, "")
		.trim();

	if (!normalized) {
		return null;
	}

	try {
		const parsed = JSON.parse(normalized) as TranscriptModelJson;
		if (!parsed || typeof parsed !== "object") {
			return null;
		}

		return parsed;
	}
	catch {
		return null;
	}
}

function normalizeModelCourseCode(value: string): string {
	const normalized = normalizeWhitespace(value).toUpperCase();
	if (!normalized) {
		return "";
	}

	const parsed = parseCourseCodeFromLine(normalized);
	return parsed || normalized;
}

function normalizeModelCredits(value: string | number | undefined): string {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value.toFixed(2);
	}

	const text = normalizeWhitespace(String(value || ""));
	if (!text) {
		return "0.00";
	}

	const numeric = Number(text);
	if (Number.isFinite(numeric)) {
		return numeric.toFixed(2);
	}

	return text;
}

function transcriptModelJsonToStructuredOutput(payload: TranscriptModelJson): string {
	const lines = new Set<string>();

	for (const item of payload.completed || []) {
		const courseCode = normalizeModelCourseCode(String(item.courseCode || ""));
		if (!courseCode) {
			continue;
		}

		const term = normalizeWhitespace(String(item.term || "")) || "Unknown Term";
		const title = normalizeWhitespace(String(item.title || "")) || "Untitled Course";
		const grade = normalizeWhitespace(String(item.grade || "")) || "P";
		const credits = normalizeModelCredits(item.credits);
		lines.add(`COMPLETED | ${term} | ${courseCode} | ${title} | ${credits} | ${grade}`);
	}

	for (const item of payload.planned || []) {
		const courseCode = normalizeModelCourseCode(String(item.courseCode || ""));
		if (!courseCode) {
			continue;
		}

		const term = normalizeWhitespace(String(item.term || "")) || "Unknown Term";
		const title = normalizeWhitespace(String(item.title || "")) || "Untitled Course";
		lines.add(`PLANNED | ${term} | ${courseCode} | ${title}`);
	}

	for (const item of payload.transfer || []) {
		const courseCode = normalizeModelCourseCode(String(item.courseCode || ""));
		if (!courseCode) {
			continue;
		}

		const term = normalizeWhitespace(String(item.term || "")) || "Unknown Term";
		const title = normalizeWhitespace(String(item.title || "")) || "Transfer Credit";
		const credits = normalizeModelCredits(item.credits);
		lines.add(`TRANSFER | ${term} | ${courseCode} | ${title} | ${credits}`);
	}

	for (const section of payload.poeSections || []) {
		const sectionLabel = normalizeWhitespace(String(section.label || ""));
		if (!sectionLabel) {
			continue;
		}

		for (const course of section.courses || []) {
			const courseCode = normalizeModelCourseCode(String(course.courseCode || ""));
			if (!courseCode) {
				continue;
			}

			const status = normalizeWhitespace(String(course.status || "")).toLowerCase() || "remaining";
			const title = normalizeWhitespace(String(course.title || "")) || "Untitled Course";
			const credits = normalizeModelCredits(course.credits);
			const term = normalizeWhitespace(String(course.term || "")) || "Unknown Term";
			const grade = normalizeWhitespace(String(course.grade || ""));
			lines.add(`POE_COURSE | ${sectionLabel} | ${status} | ${courseCode} | ${title} | ${credits} | ${term} | ${grade}`);
		}
	}

	for (const requirement of payload.requirements || []) {
		if (typeof requirement === "string") {
			const rawRequirement = normalizeWhitespace(requirement);
			if (!rawRequirement) {
				continue;
			}

			const [rawLabel, rawStatus] = rawRequirement.split("|").map((part) => normalizeWhitespace(part));
			const label = rawStatus ? rawLabel : rawRequirement;
			const status = normalizeRequirementStatus(rawStatus || rawRequirement);
			const requirementRecord = formatRequirementRecord(label, status);
			if (requirementRecord) {
				lines.add(requirementRecord);
			}
			continue;
		}

		const label = normalizeWhitespace(String(requirement.label || ""));
		const status = normalizeRequirementStatus(String(requirement.status || ""));
		const requirementRecord = formatRequirementRecord(label, status);
		if (requirementRecord) {
			lines.add(requirementRecord);
		}
	}

	return normalizeStructuredOutput(Array.from(lines).join("\n"));
}

async function extractStructuredTranscriptFromPdfPayload(pdfBuffer: Uint8Array): Promise<string> {
	let lastError: unknown;
	const prompts = await loadTranscriptPrompts();

	for (const modelID of candidateModelIDs) {
		try {
			const prompt = prompts.pdfToJsonPrompt;

			const response = await genAI.models.generateContent({
				model: modelID,
				contents: [{
					role: "user",
					parts: [
						{ text: prompt },
						{
							inlineData: {
								mimeType: "application/pdf",
								data: Buffer.from(pdfBuffer).toString("base64"),
							},
						},
					],
				}],
				config: {
					temperature: 0,
					thinkingConfig: {
						thinkingBudget: 256,
					},
				},
			});

			const rawText = response.text?.trim() || "";
			if (!rawText) {
				continue;
			}

			const jsonOutput = parseTranscriptModelJson(rawText);
			if (jsonOutput) {
				console.log("Transcript parser JSON output:", JSON.stringify(jsonOutput, null, 2));
				const structuredFromJson = transcriptModelJsonToStructuredOutput(jsonOutput);
				if (structuredFromJson) {
					return structuredFromJson;
				}
			}

			const structuredLines = normalizeStructuredOutput(rawText);
			if (structuredLines) {
				return structuredLines;
			}
		}
		catch (error) {
			lastError = error;
			if (!isMissingModelError(error)) {
				throw error;
			}
		}
	}

	if (lastError) {
		throw lastError;
	}

	return "";
}

function countStructuredCourseLines(text: string): number {
	return text
		.split(/\r?\n+/)
		.map((line) => line.trim())
		.filter((line) => /^(COMPLETED|PLANNED|TRANSFER)\s*\|/i.test(line)).length;
}

function courseCodeAppearsInRawText(courseCode: string, rawTranscript: string): boolean {
	const escaped = courseCode
		.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
		.replace(/\\-/g, "[-\\s]?");
	const pattern = new RegExp(`\\b${escaped}\\b`, "i");
	return pattern.test(rawTranscript);
}

function filterStructuredOutputAgainstRawText(text: string, rawTranscript: string): string {
	const lines = text
		.split(/\r?\n+/)
		.map((line) => normalizeWhitespace(line))
		.filter(Boolean);

	const retained: string[] = [];
	for (const line of lines) {
		const parts = line.split("|").map((part) => normalizeWhitespace(part));
		const kind = (parts[0] || "").toUpperCase();
		if (kind === "REQUIREMENT" || kind === "CREDIT_TOTALS" || kind === "STUDENT_ID") {
			retained.push(line);
			continue;
		}

		const courseCode = parts[2] || "";
		if (!courseCode) {
			continue;
		}

		if (courseCodeAppearsInRawText(courseCode, rawTranscript)) {
			retained.push(line);
		}
	}

	return Array.from(new Set(retained)).join("\n");
}

/**
 * Merges AI-parsed course output with deterministic output.
 * Strategy: keep all AI course/transfer/planned lines as-is (the AI is better at
 * reading course details). Only supplement with REQUIREMENT, CREDIT_TOTALS, and
 * STUDENT_ID lines from the deterministic parser — these are the lines the AI
 * doesn't reliably emit, and the only reason we run the deterministic pass at all.
 * This prevents the same course from appearing twice with minor formatting differences.
 */
function mergeStructuredOutput(modelOutput: string, deterministicOutput: string): string {
	const merged = new Set<string>();

	for (const line of modelOutput.split(/\r?\n+/)) {
		const normalized = normalizeWhitespace(line);
		if (normalized) {
			merged.add(normalized);
		}
	}

	// Only supplement with metadata lines from the deterministic parser
	for (const line of deterministicOutput.split(/\r?\n+/)) {
		const normalized = normalizeWhitespace(line);
		if (!normalized) continue;
		const kind = normalized.split("|")[0].trim().toUpperCase();
		if (kind === "REQUIREMENT" || kind === "CREDIT_TOTALS" || kind === "STUDENT_ID") {
			merged.add(normalized);
		}
	}

	return Array.from(merged).join("\n");
}

function normalizeAndTruncateRawTranscript(rawTranscript: string): string {
	const normalized = normalizeRawTranscriptText(rawTranscript);

	if (!normalized) {
		return "";
	}

	if (normalized.length <= MAX_RAW_TRANSCRIPT_CHARS) {
		return normalized;
	}

	const headSize = Math.floor(MAX_RAW_TRANSCRIPT_CHARS * 0.65);
	const tailSize = MAX_RAW_TRANSCRIPT_CHARS - headSize;
	const head = normalized.slice(0, headSize);
	const tail = normalized.slice(-tailSize);

	return `${head}\n[... transcript truncated for processing ...]\n${tail}`;
}

function buildTranscriptJsonPayloadForModel(transcriptJson: TranscriptPdfJson): string {
	let budget = MAX_JSON_MODEL_CHARS;
	const pages: TranscriptPdfPageJson[] = [];

	for (const page of transcriptJson.pages) {
		if (budget <= 0) {
			break;
		}

		const lines: string[] = [];
		for (const line of page.lines) {
			if (budget <= 0) {
				break;
			}

			if (line.length + 1 > budget) {
				const partial = line.slice(0, Math.max(0, budget - 1));
				if (partial) {
					lines.push(partial);
				}
				budget = 0;
				break;
			}

			lines.push(line);
			budget -= line.length + 1;
		}

		if (lines.length > 0) {
			pages.push({
				pageNumber: page.pageNumber,
				lines,
			});
		}
	}

	return JSON.stringify({
		pageCount: transcriptJson.pageCount,
		pages,
	});
}

async function extractStructuredTranscriptFromJsonPayload(transcriptJson: TranscriptPdfJson): Promise<string> {
	const payload = buildTranscriptJsonPayloadForModel(transcriptJson);
	let lastError: unknown;
	const prompts = await loadTranscriptPrompts();

	for (const modelID of candidateModelIDs) {
		try {
			const prompt = buildJsonToLinesPrompt(prompts.jsonToLinesPrompt, payload);

			const response = await genAI.models.generateContent({
				model: modelID,
				contents: prompt,
				config: {
					temperature: 0,
					thinkingConfig: {
						thinkingBudget: 384,
					},
				},
			});

			return response.text?.trim() || "";
		}
		catch (error) {
			lastError = error;
			if (!isMissingModelError(error)) {
				throw error;
			}
		}
	}

	if (lastError) {
		throw lastError;
	}

	return "";
}

export async function extractTranscriptTextFromPdf(pdfBuffer: Uint8Array): Promise<string> {
	// Always start local extraction in parallel — needed to supply REQUIREMENT lines
	// even when the AI succeeds at parsing courses.
	const localPromise = (async () => {
		const transcriptJson = await extractTranscriptJsonFromPdf(pdfBuffer);
		const rawTranscript = normalizeAndTruncateRawTranscript(transcriptJson.flattenedLines.join("\n"));
		const deterministicOutput = rawTranscript
			? normalizeStructuredOutput(buildDeterministicTranscript(rawTranscript))
			: "";
		return { transcriptJson, rawTranscript, deterministicOutput };
	})();

	if (TRANSCRIPT_PARSER_STRATEGY !== "local-first") {
		let aiOutput = "";
		try {
			aiOutput = normalizeStructuredOutput(await extractStructuredTranscriptFromPdfPayload(pdfBuffer));
		}
		catch (error) {
			if (!(error instanceof Error && /empty|invalid|not found|not supported/i.test(error.message))) {
				console.warn("AI-first transcript parsing from PDF failed. Falling back to local parser.", error);
			}
		}

		if (countStructuredCourseLines(aiOutput) > 0 || countRequirementLines(aiOutput) > 0) {
			// Merge AI output with deterministic output so that REQUIREMENT lines from the
			// deterministic parser (waived FYC, Humanistic Thought section headers, etc.)
			// are always captured even when the AI doesn't emit them.
			const { deterministicOutput } = await localPromise;
			return deterministicOutput
				? mergeStructuredOutput(aiOutput, deterministicOutput)
				: aiOutput;
		}
	}

	const { transcriptJson, rawTranscript, deterministicOutput } = await localPromise;

	if (!rawTranscript) {
		return "UNREADABLE TRANSCRIPT";
	}

	if (!ENABLE_TRANSCRIPT_MODEL_ENRICHMENT || countStructuredCourseLines(deterministicOutput) >= 2) {
		return deterministicOutput || "UNREADABLE TRANSCRIPT";
	}

	let modelOutput = "";
	try {
		modelOutput = await extractStructuredTranscriptFromJsonPayload(transcriptJson);
	}
	catch (error) {
		if (!(error instanceof Error && /empty|invalid|not found|not supported/i.test(error.message))) {
			console.warn("Model-based transcript structuring from transcript JSON failed.", error);
		}
	}

	const normalizedModelOutput = filterStructuredOutputAgainstRawText(normalizeStructuredOutput(modelOutput), rawTranscript);

	if (!normalizedModelOutput && !deterministicOutput) {
		return "UNREADABLE TRANSCRIPT";
	}

	if (!normalizedModelOutput) {
		return deterministicOutput;
	}

	if (!deterministicOutput) {
		return normalizedModelOutput;
	}

	const modelCourseLineCount = countStructuredCourseLines(normalizedModelOutput);
	if (modelCourseLineCount < countStructuredCourseLines(deterministicOutput)) {
		return deterministicOutput;
	}

	return mergeStructuredOutput(normalizedModelOutput, deterministicOutput);
}
