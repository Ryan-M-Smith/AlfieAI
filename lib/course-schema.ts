//
// Filename: course-schema.ts
// Description: JSON schema for a MongoDB course document
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

interface DepartmentMap {
  	[key: string]: string;
}

export const courseSchema = {
	$schema: "https://json-schema.org/draft/2020-12/schema",
	title: "Course",
	type: "object",
	properties: {
		_id: {
			type: "object",
			properties: {
				$oid: { type: "string", pattern: "^[a-f\\d]{24}$" }
			},
			required: ["$oid"]
		},
		term: { type: "string" },
		status: { type: "string" },
		section_name: { type: "string" },
		title: { type: "string" },
		start_date: { type: "string", format: "date" },
		end_date: { type: "string", format: "date" },
		location: { type: "string" },
		meeting_info: {
			type: "array",
			items: {
				type: "object",
				properties: {
					days: {
						type: "array",
						items: {
							type: "string",
							enum: ["M", "T", "W", "Th", "F"]
						}
					},
					start_time: { type: "string", pattern: "^\\d{1,2}:\\d{2}$" },
					end_time: { type: "string", pattern: "^\\d{1,2}:\\d{2}$" },
					classroom: { type: "string" }
				},
				required: ["days", "start_time", "end_time", "classroom"]
			}
		},
		instructors: {
			type: "array",
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					email: { type: "string", format: "email" }
				},
				required: ["name", "email"]
			}
		},
		availability: {
			type: "object",
			properties: {
				available: { type: "integer" },
				capacity: { type: "integer" },
				waitlisted: { type: "integer" }
			},
			required: ["available", "capacity", "waitlisted"]
		},
		credits: {
			type: "object",
			properties: {
				minimum: { type: "integer" },
				maximum: { type: "integer" }
			},
			required: ["minimum", "maximum"]
		},
		course_types: {
			type: "array",
			items: { type: "string" }
		},
		academic_level: {
			type: "string",
			enum: ["Undergraduate", "Graduate Level"]
		},
		comments: {
			type: ["string", "null"]
		},
		requisites: {
			type: "array",
			items: { type: "string" }
		},
		description: { type: "string" },
		grading: {
			type: "array",
			items: {
				type: "string",
				enum: ["Graded", "Audit", "Pass/Fail"]
			}
		},
		fee: {
			type: ["number", "null"]
		}
	},
	required: [
		"_id",
		"term",
		"status",
		"section_name",
		"title",
		"start_date",
		"end_date",
		"location",
		"meeting_info",
		"instructors",
		"availability",
		"credits",
		"course_types",
		"academic_level",
		"description",
		"grading"
	]
};

export const departmentCodes: DepartmentMap = {
	"AC": "Accounting",
	"AH": "Art History",
	"AN": "Anthropology",
	"AR": "Art",
	"AS": "Astronomy",
	"BI": "Biology",
	"BIN": "Bioinformatics",
	"CEE": "Civil & Environmental Engineering",
	"CH": "Chemistry",
	"CJ": "Criminal Justice",
	"CM": "Communication",
	"CN": "Chinese",
	"CONN": "Connections",
	"CS": "Computer Science",
	"DS": "Data Science",
	"EB": "Economics & Business",
	"ED": "Education",
	"EN": "English",
	"ENRM": "Environmental & Natural Resource Management",
	"ESK": "Exercise Science & Kinesiology",
	"ESL": "English as a Second Language",
	"ESS": "Environmental Science & Studies",
	"FR": "French",
	"FYC": "First-Year Composition",
	"FYF": "First-Year Foundations",
	"FYS": "First-Year Seminar",
	"GE": "Global Engagement",
	"GL": "Geology",
	"HP": "Health Professions",
	"HS": "History",
	"IM": "Integrated Media",
	"IT": "Information Technology",
	"MA": "Mathematics",
	"MBA": "Master of Business Administration",
	"MM": "Museum Studies",
	"MPH": "Master of Public Health",
	"MS": "Music Studies",
	"MU": "Music",
	"ND": "General Studies/Interdisciplinary",
	"NEU": "Neuroscience",
	"ORG": "Organizational Leadership",
	"PACS": "Peace & Conflict Studies",
	"PC": "Physics",
	"PL": "Philosophy",
	"PS": "Political Science",
	"PY": "Psychology",
	"RL": "Religion",
	"SCH": "Scholars Program",
	"SO": "Sociology",
	"SP": "Spanish",
	"SW": "Social Work",
	"TH": "Theatre",
	"WL": "World Languages"
};