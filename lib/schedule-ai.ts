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
	section: ScheduleSectionSummary;
}

export interface ScheduleRequirementsProgress {
	transcriptDetected: boolean;
	completedCourseCodes: string[];
	requirementMentions: string[];
	transferMentions: string[];
}

export interface ScheduleModelCourseSelection {
	course_code: string;
	primary: boolean;
}

export interface ScheduleGenerationResult {
	term: string;
	poe: string;
	primaryPoes: string[];
	secondaryEmphases: string[];
	guidance: string;
	reasoning: string;
	primaryCourses: ScheduleCourseResult[];
	backupCourses: ScheduleCourseResult[];
	allSelectedCourses: ScheduleCourseResult[];
	requirementsProgress: ScheduleRequirementsProgress;
	notes: string[];
	warnings: string[];
	modelSelection: ScheduleModelCourseSelection[];
}
