import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const candidateModelIDs = [
	process.env.GEMINI_SCHEDULER_MODEL_ID,
	process.env.GEMINI_COURSES_MODEL_ID,
	process.env.GEMINI_MODEL_ID,
	"gemini-3-flash-preview",
	"gemini-2.5-flash",
	"gemini-2.5-pro",
].filter((modelID, index, allModelIDs): modelID is string => Boolean(modelID) && allModelIDs.indexOf(modelID) === index);

function isMissingModelError(error: unknown): boolean {
	return error instanceof Error && /models\/.+(not found|not supported)/i.test(error.message);
}

function isRetryableModelError(error: unknown): boolean {
	return error instanceof Error && /(UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|quota|429|503)/i.test(error.message);
}

interface ScheduleInsightsRequest {
	term?: string;
	primaryPoes?: string[];
	poe?: string;
	secondaryEmphases?: string[];
	currentGuidance?: string;
	stream?: boolean;
}

function buildGuidancePrompt(payload: {
	term: string;
	primaryPoes: string[];
	secondaryEmphases: string[];
	currentGuidance: string;
}): string {
	const primaryPoeText = payload.primaryPoes.join(", ");

	return [
		"You are AlfieAI Courses.",
		"Write a concise first-person planning preference paragraph that a student can submit for schedule generation.",
		"Return plain text only, no bullet points, no markdown.",
		"Length: 60-120 words.",
		"Include realistic constraints (workload balance, class timing preference, goal coverage, and flexibility for backups).",
		`Term: ${payload.term}`,
		`Primary POEs: ${primaryPoeText}`,
		`Secondary emphases: ${payload.secondaryEmphases.length > 0 ? payload.secondaryEmphases.join(", ") : "None supplied"}`,
		`Existing student text: ${payload.currentGuidance || "None"}`,
	].join("\n");
}

async function generateGuidanceText(prompt: string): Promise<string> {
	let lastError: unknown;

	for (const modelID of candidateModelIDs) {
		try {
			const response = await genAI.models.generateContent({
				model: modelID,
				contents: prompt,
				config: {
					thinkingConfig: {
						thinkingBudget: 2048,
					},
				},
			});

			const guidance = response.text?.trim();
			if (!guidance) {
				throw new Error("No guidance text returned by model.");
			}

			return guidance;
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

function createGuidanceStreamResponse(prompt: string): Response {
	const encoder = new TextEncoder();

	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			let lastError: unknown;

			for (const modelID of candidateModelIDs) {
				try {
					const response = await genAI.models.generateContentStream({
						model: modelID,
						contents: prompt,
						config: {
							thinkingConfig: {
								thinkingBudget: 2048,
							},
						},
					});

					let chunkCount = 0;
					for await (const chunk of response) {
						const text = chunk.text || "";
						if (!text) {
							continue;
						}

						chunkCount += 1;
						controller.enqueue(encoder.encode(text));
					}

					if (chunkCount === 0) {
						throw new Error("No guidance text returned by model.");
					}

					controller.close();
					return;
				}
				catch (error) {
					lastError = error;
					if (!isMissingModelError(error) && !isRetryableModelError(error)) {
						break;
					}
				}
			}

			controller.error(lastError instanceof Error ? lastError : new Error("Could not generate planning guidance right now."));
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});
}

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as ScheduleInsightsRequest;
		const term = (body.term || "").trim();
		const primaryPoes = Array.from(new Set([
			...(body.primaryPoes || []).map((item) => item.trim()).filter(Boolean),
			(body.poe || "").trim(),
		].filter(Boolean)));
		const secondaryEmphases = (body.secondaryEmphases || []).filter(Boolean);
		const currentGuidance = (body.currentGuidance || "").trim();
		const streamMode = body.stream === true;

		if (!term) {
			return NextResponse.json({ error: "Term is required for guidance generation." }, { status: 400 });
		}

		if (primaryPoes.length === 0) {
			return NextResponse.json({ error: "At least one primary POE is required for guidance generation." }, { status: 400 });
		}

		const prompt = buildGuidancePrompt({
			term,
			primaryPoes,
			secondaryEmphases,
			currentGuidance,
		});

		if (streamMode) {
			return createGuidanceStreamResponse(prompt);
		}

		const guidance = await generateGuidanceText(prompt);
		return NextResponse.json({ guidance });
	}
	catch (error) {
		console.error("Failed to generate schedule guidance", error);

		if (isRetryableModelError(error)) {
			return NextResponse.json(
				{ error: "AlfieAI insights are temporarily busy. Please try again in a moment." },
				{ status: 503 }
			);
		}

		return NextResponse.json(
			{ error: "Could not generate planning guidance right now." },
			{ status: 500 }
		);
	}
}
