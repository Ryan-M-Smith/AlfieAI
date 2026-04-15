import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const candidateModelIDs = [
	"gemini-2.0-flash",
	"gemini-1.5-flash-latest",
	process.env.GEMINI_COURSES_MODEL_ID,
	process.env.GEMINI_MODEL_ID,
	"gemini-2.5-flash",
].filter((modelID, index, allModelIDs): modelID is string => Boolean(modelID) && allModelIDs.indexOf(modelID) === index);

function isMissingModelError(error: unknown): boolean {
	return error instanceof Error && /models\/.+(not found|not supported)/i.test(error.message);
}

export async function extractTranscriptTextFromPdf(pdfBuffer: Uint8Array): Promise<string> {
	let lastError: unknown;

	for (const modelID of candidateModelIDs) {
		try {
			const response = await genAI.models.generateContent({
				model: modelID,
				contents: [
					{
						role: "user",
						parts: [
							{
								text: [
									"You are helping a college schedule planner read a Self-Service Degree Progress PDF.",
									"Extract the transcript into a strict line-oriented format for downstream rule-based parsing.",
									"Preserve exact course code suffixes when present, for example BI-305CW, CS-255C, and CM-405A.",
									"Do not summarize.",
									"Output only lines in one of these formats:",
									"COMPLETED | <Term> | <CourseCode> | <CourseTitle> | <Credits> | <Grade>",
									"PLANNED | <Term> | <CourseCode> | <CourseTitle>",
									"TRANSFER | <Term> | <CourseCodeOrLabel> | <CourseTitle> | <Credits>",
									"REQUIREMENT | <RequirementLabel>",
									"Use COMPLETED for courses with earned credit or a final grade.",
									"Use PLANNED for courses listed in a term without earned credit or a final grade.",
									"Use TRANSFER for AP, placement, test credit, or transfer-style entries.",
									"Use REQUIREMENT for transcript-visible requirement completions such as First-Year Composition, First-Year Foundations, First-Year Seminar, or Connections when they appear satisfied independently of a normal graded course row.",
									"Keep one transcript entry per line.",
									"If a term is visible, normalize it as Spring Term YYYY, Summer Term YYYY, or Fall Term YYYY.",
									"If the PDF is unreadable, output exactly: UNREADABLE TRANSCRIPT",
								].join("\n"),
							},
							{
								inlineData: {
									mimeType: "application/pdf",
									data: Buffer.from(pdfBuffer).toString("base64"),
								},
							},
						],
					},
				],
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

	throw lastError;
}
