//
// Filename: gemini-model.ts
// Description: Pass queries to a Gemini 3 Flash model running in Google Cloud
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import * as fs from "node:fs";
import {
	GenerateContentConfig, GoogleGenAI,
	HarmBlockThreshold, HarmCategory, SafetySetting
} from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const modelID = "gemini-3-flash-preview";
const enableGoogleSearch = true;

const context = {
	text: fs.readFileSync("prompts/events.prompt", "utf-8"),
};
  
const modelConfig: GenerateContentConfig = {
	temperature: 1,
	topP: 0.95,
	seed: 0,
	responseModalities: ["TEXT"],
	...(enableGoogleSearch ? { tools: [{ googleSearch: {} }] } : {}),

	safetySettings: [
		{
			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
			threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
		},

		{
			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
			threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
		},

		{
			category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
			threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
		},

		{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
		}
	] satisfies SafetySetting[],

	systemInstruction: {
		parts: [context]
	},
};

interface StreamAttachment {
	name: string;
	mimeType: string;
	dataBase64: string;
}

const FALLBACK_EVENT_PROMPTS = [
	"How do I submit a club event in Involve?",
	"Where can I find and manage Event PINs?",
	"What forms are required for event approvals?",
	"How should I track attendance in Presence?",
];

function sanitizeChunkText(value: string): string {
	return value.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, "");
}

async function streamModelResponse(query: string, chunkSize = 96, attachments: StreamAttachment[] = []): Promise<ReadableStream<Uint8Array>> {
	const normalizedChunkSize = Math.max(chunkSize, 32);

	return new ReadableStream<Uint8Array>({
		start: async (controller) => {
			const startedAt = performance.now();
			const encoder = new TextEncoder();
			let buffer = "";
			let firstTokenAt = 0;
			let hasFlushedOnce = false;

			const flushBuffer = (force = false) => {
				if (!buffer) {
					return;
				}

				if (!force && hasFlushedOnce && buffer.length < normalizedChunkSize) {
					return;
				}

				controller.enqueue(encoder.encode(buffer));
				hasFlushedOnce = true;
				buffer = "";
			};

			try {
				const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

				if (attachments.length > 0) {
					parts.push({
						text: [
							query,
							`The user attached ${attachments.length} file(s): ${attachments.map((file) => file.name).join(", ")}.`,
							"Use the attached files as supporting context when relevant.",
						].join("\n\n"),
					});

					for (const attachment of attachments) {
						parts.push({
							inlineData: {
								mimeType: attachment.mimeType || "application/octet-stream",
								data: attachment.dataBase64,
							},
						});
					}
				}
				else {
					parts.push({ text: query });
				}

				const response = await genAI.models.generateContentStream({
					model: modelID,
					contents: [{ role: "user", parts }],
					config: modelConfig,
				});

				for await (const chunk of response) {
					if (!chunk.text) {
						continue;
					}

					if (!firstTokenAt) {
						firstTokenAt = performance.now();
					}

					buffer += sanitizeChunkText(chunk.text);
					flushBuffer();
				}

				flushBuffer(true);
				const finishedAt = performance.now();
				const ttfb = firstTokenAt ? Math.round(firstTokenAt - startedAt) : Math.round(finishedAt - startedAt);
				const total = Math.round(finishedAt - startedAt);
				console.log(`[events-model] TTFB=${ttfb}ms total=${total}ms model=${modelID}`);
				controller.close();
			}
			catch (error) {
				console.error("[events-model] Streaming failed", error);
				controller.error(error);
			}
		}
	});
}

export async function generate(query: string, attachments: StreamAttachment[] = []) {
	return streamModelResponse(query, 96, attachments);
}

export async function generateWithChunking(query: string, chunkSize: number, attachments: StreamAttachment[] = []) {
	return streamModelResponse(query, chunkSize, attachments);
}

function parsePromptLines(value: string): string[] {
	const parsed = value
		.split(/\n+/)
		.map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim())
		.filter((line) => line.length > 6);

	const unique = [...new Set(parsed)];
	return unique.slice(0, 4);
}

export async function generateStarterPrompts(): Promise<string[]> {
	try {
		const response = await genAI.models.generateContent({
			model: modelID,
			config: {
				temperature: 0.9,
				topP: 0.9,
				responseModalities: ["TEXT"],
				systemInstruction: modelConfig.systemInstruction,
			},
			contents: [{
				role: "user",
				parts: [{
					text: [
						"Generate exactly 4 short sample prompts for a Juniata Involve and Presence events assistant.",
						"Each prompt should be 8 to 14 words and relevant to forms, approvals, or attendance workflows.",
						"Return only a plain newline list with one prompt per line.",
					].join("\n"),
				}],
			}],
		});

		const prompts = parsePromptLines(response.text || "");
		if (prompts.length >= 4) {
			return prompts.slice(0, 4);
		}
	}
	catch (error) {
		console.error("[events-model] Failed to generate starter prompts", error);
	}

	return FALLBACK_EVENT_PROMPTS;
}
