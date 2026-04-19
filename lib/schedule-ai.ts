export type WeekdayCode = "M" | "T" | "W" | "Th" | "F";

export interface ScheduleMeetingBlock {
	days: WeekdayCode[];
	startTime: string;
	endTime: string;
	location: string;
	startMinutes: number | null;
	endMinutes: number | null;
}

export interface ScheduleSectionSummary {
	sectionName: string;
	term: string;
	status: string;
	location: string;
	openSeats: number;
	capacity: number;
	waitlisted: number;
	instructors: string[];
	meetings: string[];
	meetingBlocks: ScheduleMeetingBlock[];
}

export interface ScheduleCourseResult {
	courseCode: string;
	title: string;
	description: string;
	credits: number;
	categories: string[];
	primary: boolean;
	/** "user" = student pre-registered; "alfie" = AI suggestion. Omitted in standard mode. */
	selectionSource?: "user" | "alfie";
	section: ScheduleSectionSummary;
}

export interface TranscriptCourseRecord {
	courseCode: string;
	title: string;
	credits: number;
	grade: string;
	term: string;
}

export interface TranscriptTransferRecord {
	courseCode: string;
	title: string;
	credits: number;
	term: string;
}

export interface TranscriptPlannedRecord {
	courseCode: string;
	title: string;
	term: string;
}

export interface GenEdCategoryStatus {
	categoryId: string;
	label: string;
	/** "completed" = transcript says done; "waived" = explicitly waived; "in-progress" = transcript says pending/in-progress; "missing" = no evidence */
	status: "completed" | "waived" | "in-progress" | "missing";
	/** Course codes from completed courses that have this gen-ed type */
	satisfiedBy: string[];
	/** Course codes from planned courses that would satisfy this gen-ed type */
	plannedBy: string[];
	/** For waived categories: transfer course code (e.g. "EN-1XXTR") or "poe" for a Designated POE waiver */
	waivedBy?: string;
}

export interface PoeGroupProgress {
	id: string;
	label: string;
	phase: "core" | "elective" | "capstone";
	status: "remaining" | "in_progress" | "complete";
	required: string;
	completed: string;
	planned: string;
	remaining: string;
	progressRatio: number;
	remainingCourseCodes: string[];
	/** Numeric completed count for display (courses or credits) */
	completedCount: number;
	/** Numeric required count for display (courses or credits) */
	requiredCount: number;
	/** Unit of the counts */
	countUnit: "course" | "credit";
	/** Total credits earned toward this requirement group (supplemental display) */
	completedCreditCount: number;
}

export interface PoeProgressSummary {
	poeName: string;
	isPrimary: boolean;
	coreCompletionRatio: number;
	capstoneReadiness: number;
	groups: PoeGroupProgress[];
}

export interface ScheduleRequirementsProgress {
	transcriptDetected: boolean;
	// Stat bar
	degreeProgram: string;
	completedCourses: TranscriptCourseRecord[];
	plannedCourses: TranscriptPlannedRecord[];
	transferCourses: TranscriptTransferRecord[];
	completedCredits: number;
	transferCredits: number;
	gpa: number | null;
	// Gen-ed status grid (all 14 categories)
	genEdStatus: GenEdCategoryStatus[];
	// Legacy flat lists (kept for compat)
	completedCourseCodes: string[];
	requirementMentions: string[];
	transferMentions: string[];
	completedByTerm?: Array<{
		term: string;
		count: number;
	}>;
	/** POE requirement progress for all primary and secondary emphases */
	poeProgress?: PoeProgressSummary[];
	/** Student ID parsed from the transcript */
	studentId?: string;
}

export interface ScheduleModelCourseSelection {
	course_code: string;
	primary: boolean;
}

export type CreditLoadProfile = "part-time" | "light" | "moderate" | "heavy" | "custom";

export type SchedulingMode = "balanced" | "core-focused" | "gen-ed-push" | "fun" | "ai-choice";

export interface ScheduleCreditPreference {
	profile: CreditLoadProfile;
	label: string;
	minCredits: number | null;
	maxCredits: number | null;
	targetCredits: number | null;
}

export interface ScheduleGenerationResult {
	term: string;
	poe: string;
	primaryPoes: string[];
	secondaryEmphases: string[];
	creditPreference: ScheduleCreditPreference;
	schedulingMode: SchedulingMode;
	guidance: string;
	reasoning: string;
	primaryCourses: ScheduleCourseResult[];
	backupCourses: ScheduleCourseResult[];
	allSelectedCourses: ScheduleCourseResult[];
	requirementsProgress: ScheduleRequirementsProgress;
	notes: string[];
	warnings: string[];
	modelSelection: ScheduleModelCourseSelection[];
	/** Course codes auto-detected from the PDF as already pre-registered for the scheduling term */
	detectedPreRegisteredCourses?: string[];
	prePlannedCredits?: number;
}
