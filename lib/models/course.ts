//
// Filename: course.ts
// Description: Model for a course document in the MongoDB database
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

enum Weekday {
	Monday 			= "M",
	Tuesday 		= "T",
	Wednesday 		= "W",
	Thursday 		= "Th",
	Friday 			= "F"
}

enum AcademicLevel {
	Undergraduate 	= "Undergraduate",
	Graduate 		= "Graduate Level"
}

enum Grading {
	Graded 			= "Graded",
	Audit 			= "Audit",
	PassFail 		= "Pass/Fail"
}

interface MeetingInfo {
	days: 			Weekday[];
	start_time: 	string;
	end_time: 		string;
	classroom: 		string;
}

interface Instructor {
	name: 			string;
	email: 			string;
}

interface Availability {
	available: 		number;
	capacity: 		number;
	waitlisted: 	number;
}

interface Credits {
	minimum:		number;
	maximum:		number;
}

interface Section {
	section_name: 	string;
	term: 			string;
	status: 		string;
	start_date: 	string;
	end_date: 		string;
	location: 		string;
	meeting_info: 	MeetingInfo[];
	instructors: 	Instructor[];
	availability: 	Availability;
	grading: 		Grading[];
	fee?: 			number | null;
	comments?: 		string | null;
}

export interface Course {
	_id: 			string;
	course_code: 	string;
	title: 			string;
	description: 	string;
	course_types: 	string[];
	academic_level: AcademicLevel;
	credits: 		Credits;
	requisites?: 	string[];
	sections: 		Section[];
}