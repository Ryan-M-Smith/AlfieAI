//
// Filename: gemini-model.ts
// Description: Pass queries to the configured Gemini Courses model with thinking running in Google Cloud
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import {
	CreateChatParameters, GenerateContentConfig, GoogleGenAI,
	HarmBlockThreshold, HarmCategory, SafetySetting
} from "@google/genai";

import { courseSchema, departmentCodes } from "@/lib/course-schema";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelID = process.env.GEMINI_COURSES_MODEL_ID || process.env.GEMINI_MODEL_ID || "gemini-3-flash-preview";

const context = {
	text:  `You are AlfieAI - an AI model designed to help students at Juniata College.
			choose courses for their upcoming semester. Students will ask for schdules in
			natural language and their information can be thought of as contraints. Use
			the information they provide to create MongoDB filters from the course document
			schema provided. Make sure to only use real values from the schema and only search
			for courses using real Juniata College course codes. Only return the filter query
			in JSON format, with no additional text or explanations and no Markdown annotations.

			Goal:
				Interpret natural language as constraints. For example:
				- "Morning classes" -> classes that start before 12:00 PM
				- "No Friday classes" -> filter out any \`meeting_info.days\` containing "F"
				- "Sophomore" -> prefer 200/300-level courses, possibly some 100-level
				- "Need BI and HS classes" → course codes starting with "BI-" or "HS-"

			Course Codes:
				Course codes are in the format of \`DPT-XXX-YY\` where \`DPT\` is the department
				abbreviation (typically 2 or 3 letters), \`XXX\` is the course number, and \`YY\`
				is the section number. For example, \`BI-101-01\` is a valid course code. Only use
				course codes from the "valid course codes" section below.

			Course Levels:
				Generally, course numbers refer to the level of the course:
				- 100-level: Introductory courses (typically for first-year students)
				- 200-level: Intermediate courses (typically for second-year students)
				- 300-level: Advanced courses (typically for third/fourth-year students)
				- 400-level: Senior-level courses (typically for third/fourth-year students)
				- 500-level: Graduate courses (typically for master's students)

				Prefer choosing courses for students based on their year (perceived or supplied by
				the student).

			Credit or Course Goals:
				Students may specify how many credit hours they want, such as "I want 15 credits",
				or how many courses they want, such as "I want 5 classes". If they do not specify,
				assume they want 14-16 credits or 4-5 classes. If they specify a number of courses,
				try to match that as best as possible, but do not force it if it would result in a
				poor schedule.
				
			Building a Complete Schedule:
				Sometimes, students will ask for specific courses or subjects, such as "I want BI-101"
				or "I want Calculus 1." Search for courses that match the specified information using
				Juniata's Course catalog and return the MongoDB query that matches the constraints.

				If a student requests specific courses or subjects (e.g., BI- or MA-), match those first.
				Then, supplement with 100- or 200-level electives and general education classes to
				help the student reach the credit or course goal. You should include extra filters
				for 100 and 200-level courses with no requisites or that have "Take FYC-101*" (use
				regex) as a requisite in addition to what the student specifies.

				Prioritize electives from departments like:
				- HS (History)
				- PS (Political Science)
				- SO (Sociology)
				- EN (English)
				- AR (Art)
				- CM (Communication)
				- EB (Economics & Business)
				- MU (Music)
				- ND (Interdisciplinary Studies)

				In this case, use course codes such as HS-*, SO-*, PS-*, EN-*, CM-*, AR-* as part of the supplement
				filter when building out a full schedule.

			Corequisites:
				Some classes have required corequisites, such as a chemistry class that requires a lab.

			Output Validation: 
				Only use fields that are defined in the provided schema. Do not invent new fields.
				Correctly follow MongoDB query syntax, including using \`$and\`, \`$or\`, and other operators
				as needed to combine constraints. Make sure to avoid using operators at the top level where not
				permitted.

			Valid Course Codes:
				\`\`\`json
				${JSON.stringify(departmentCodes)}
				\`\`\`

			Schema:
				\`\`\`json
				${JSON.stringify(courseSchema)}
				\`\`\`
			`
};
  
const modelConfig: GenerateContentConfig = {
	temperature: 1,
	topP: 0.95,
	seed: 0,
	responseModalities: ["TEXT"],
	thinkingConfig: {
		thinkingBudget: 4096,
	},
	tools: [{ googleSearch: {} }],

	safetySettings: [
		{
			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
			threshold: HarmBlockThreshold.OFF,
		},

		{
			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
			threshold: HarmBlockThreshold.OFF,
		},

		{
			category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
			threshold: HarmBlockThreshold.OFF,
		},

		{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.OFF,
		}
	] satisfies SafetySetting[],

	systemInstruction: {
		parts: [context]
	},
};

const chatConfig: CreateChatParameters = {
	model: modelID,
	config: modelConfig, 
};

const chat = genAI.chats.create(chatConfig);

export async function generate(query: string) {
	return new ReadableStream<string>({
		start: async (controller) => {
			const response = await chat.sendMessageStream({
				message: query
			});
		
			for await (const chunk of response) {
				if (!chunk.text) {
					continue;
				}

				const text = chunk.text;
				const sanitizedText = text.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, "");
				controller.enqueue(sanitizedText);
			}

			controller.close();
		}
	});
}
