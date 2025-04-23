//
// Filename: gemini-model.ts
// Description: Pass queries to a Gemini 2.5 Flash model running in Google Cloud
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { GoogleGenAI, HarmBlockThreshold, HarmCategory, SafetySetting } from "@google/genai";

const genAI = new GoogleGenAI({
	vertexai: true,
	project: 'gen-lang-client-0521416763',
	location: 'us-central1'
});

const modelID = "gemini-2.5-flash-preview-04-17";

const context = {
	text: 	`You are an AI model designed to give targeted, accurate information about
			Juniata College. Make sure to be as accurate as possible, format data in lists
			when possible, and use the internet if you can't find relevant or correct answers.`
};
  
const modelConfig = {
	maxOutputTokens: 8192,
	temperature: 1,
	topP: 0.95,
	seed: 0,
	responseModalities: ["TEXT"],

	speechConfig: {
		voiceConfig: {
			prebuiltVoiceConfig: {
				voiceName: "zephyr",
			},
		},
	},

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

export default async function generate(query: string) {
	const contents = {
		role: "user",
		parts: [{ text: query }]
	};
	
	const req = {
		model: modelID,
		contents: JSON.stringify(contents),
		config: modelConfig
	};
		
	const response = await genAI.models.generateContentStream(req);
	const chunks: string[] = [];

	for await (const chunk of response) {
		if (chunk.text) {
			chunks.push(chunk.text);
		}
		else {
			chunks.push(JSON.stringify(chunk) + '\n');
		}
	}

	return chunks.join("");
}
