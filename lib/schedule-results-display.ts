import type { ScheduleCourseResult, ScheduleMeetingBlock, WeekdayCode } from "@/lib/schedule-ai";

function normalizeWhitespace(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

export function normalizeCourseCode(value: string): string {
	return value.trim().toUpperCase();
}

export function getCourseInstanceKey(course: ScheduleCourseResult): string {
	return `${normalizeCourseCode(course.courseCode)}::${course.section.sectionName}`;
}

export function formatHourLabel(minutes: number): string {
	const hours24 = Math.floor(minutes / 60);
	const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
	const suffix = hours24 >= 12 ? "PM" : "AM";
	return `${hours12}:00 ${suffix}`;
}

export function formatDisplayTime(rawTime: string): string {
	const trimmed = (rawTime || "").trim();
	if (!trimmed) {
		return "TBA";
	}

	const minutes = parseTimeToMinutes(trimmed);
	if (minutes === null) {
		return trimmed;
	}

	const hours24 = Math.floor(minutes / 60) % 24;
	const minuteValue = minutes % 60;
	const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
	const suffix = hours24 >= 12 ? "PM" : "AM";

	return `${hours12}:${minuteValue.toString().padStart(2, "0")} ${suffix}`;
}

export function parseTimeToMinutes(rawTime: string): number | null {
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

export function getMeetingDays(days: string[] | undefined): WeekdayCode[] {
	const source = Array.isArray(days) ? days : [];
	const parsed = source.flatMap((day) => parseWeekdayToken(day));
	return Array.from(new Set(parsed));
}

export function formatMeeting(meeting: { days?: string[]; start_time?: string; end_time?: string; classroom?: string }): string {
	const dayText = getMeetingDays(meeting.days).join("/") || "TBA";
	const startTime = formatDisplayTime(meeting.start_time || "");
	const endTime = formatDisplayTime(meeting.end_time || "");
	const location = (meeting.classroom || "").trim();
	const locationText = location ? ` • ${location}` : "";
	return `${dayText} ${startTime}-${endTime}${locationText}`;
}

function formatMeetingBlock(meeting: ScheduleMeetingBlock): string {
	const dayText = meeting.days.join("/") || "TBA";
	const startTime = formatDisplayTime(meeting.startTime);
	const endTime = formatDisplayTime(meeting.endTime);
	const location = (meeting.location || "").trim();
	const locationText = location ? ` • ${location}` : "";

	return `${dayText} ${startTime}-${endTime}${locationText}`;
}

function normalizeCourseForDisplay(course: ScheduleCourseResult): ScheduleCourseResult {
	const normalizedMeetingBlocks = course.section.meetingBlocks.map((meeting) => ({
		...meeting,
		days: [...meeting.days],
		startTime: formatDisplayTime(meeting.startTime),
		endTime: formatDisplayTime(meeting.endTime),
		location: (meeting.location || "").trim(),
	}));

	return {
		...course,
		section: {
			...course.section,
			instructors: course.section.instructors.map((instructor) => normalizeWhitespace(instructor)).filter(Boolean),
			meetings: normalizedMeetingBlocks.length > 0
				? normalizedMeetingBlocks.map(formatMeetingBlock)
				: [...course.section.meetings],
			meetingBlocks: normalizedMeetingBlocks,
		},
	};
}

export function normalizeCoursesForDisplay(courses: ScheduleCourseResult[]): ScheduleCourseResult[] {
	return courses.map(normalizeCourseForDisplay);
}