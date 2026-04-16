import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

import type { CreditLoadProfile, ScheduleCreditPreference } from "@/lib/schedule-ai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const candidateModelIDs = ["gemini-3-flash-preview"];

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
	creditLoadProfile?: CreditLoadProfile;
	targetCredits?: number;
	currentGuidance?: string;
	stream?: boolean;
}

const CREDIT_LOAD_LABELS: Record<CreditLoadProfile, string> = {
	"part-time": "Part-time (<12 credits)",
	light: "Light (12-13 credits)",
	moderate: "Moderate (14-17 credits)",
	heavy: "Heavy (18+ credits)",
	custom: "Custom",
};

function clampCredits(value: number): number {
	return Math.min(24, Math.max(1, Math.round(value)));
}

function resolveCreditPreference(payload: ScheduleInsightsRequest): ScheduleCreditPreference {
	const profile = payload.creditLoadProfile || "moderate";

	if (profile === "part-time") {
		return { profile, label: CREDIT_LOAD_LABELS[profile], minCredits: 1, maxCredits: 11, targetCredits: 10 };
	}
	if (profile === "light") {
		return { profile, label: CREDIT_LOAD_LABELS[profile], minCredits: 12, maxCredits: 13, targetCredits: 12 };
	}
	if (profile === "heavy") {
		return { profile, label: CREDIT_LOAD_LABELS[profile], minCredits: 18, maxCredits: null, targetCredits: 18 };
	}
	if (profile === "custom") {
		const target = clampCredits(Number(payload.targetCredits || 15));
		return {
			profile,
			label: `${CREDIT_LOAD_LABELS[profile]} (${target} credits)`,
			minCredits: target,
			maxCredits: target,
			targetCredits: target,
		};
	}

	return { profile: "moderate", label: CREDIT_LOAD_LABELS.moderate, minCredits: 14, maxCredits: 17, targetCredits: 15 };
}

function buildGuidancePrompt(payload: {
	term: string;
	primaryPoes: string[];
	secondaryEmphases: string[];
	creditPreference: ScheduleCreditPreference;
	currentGuidance: string;
}): string {
	const primaryPoeText = payload.primaryPoes.join(", ");
	const creditPreferenceText = payload.creditPreference.maxCredits === null
		? `${payload.creditPreference.label}, target at least ${payload.creditPreference.minCredits} credits`
		: `${payload.creditPreference.label}, target ${payload.creditPreference.minCredits}-${payload.creditPreference.maxCredits} credits`;

	return [
		"You are AlfieAI Courses.",
		"Write a concise first-person planning preference paragraph that a student can submit for schedule generation.",
		"Return plain text only, no bullet points, no markdown.",
		"Length: 60-120 words.",
		"Include realistic constraints (workload balance, class timing preference, goal coverage, and flexibility for backups).",
		"Explicitly include the student's requested credit load target.",
		`Term: ${payload.term}`,
		`Primary POEs: ${primaryPoeText}`,
		`Secondary emphases: ${payload.secondaryEmphases.length > 0 ? payload.secondaryEmphases.join(", ") : "None supplied"}`,
		`Requested credit load: ${creditPreferenceText}`,
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
		const creditPreference = resolveCreditPreference(body);
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
			creditPreference,
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
