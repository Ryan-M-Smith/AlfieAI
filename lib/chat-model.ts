//
// Filename: gemini-model.ts
// Description: Pass queries to a Gemini 2.5 Flash model running in Google Cloud
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import * as fs from "node:fs";
import {
	CreateChatParameters, GenerateContentConfig, GoogleGenAI,
	HarmBlockThreshold, HarmCategory, SafetySetting
} from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const modelID = "gemini-3-flash-preview";

const context = {
	text:  fs.readFileSync("prompts/chat.prompt", "utf-8")
};
  
const modelConfig: GenerateContentConfig = {
	temperature: 1,
	topP: 0.95,
	seed: 0,
	responseModalities: ["TEXT"],
	tools: [{ googleSearch: {} }],

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

const chatConfig: CreateChatParameters = {
	model: modelID,
	config: modelConfig, 
};

const chat = genAI.chats.create(chatConfig);

export async function generate(query: string) {
	return new ReadableStream({
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

export async function generateWithChunking(query: string, chunkSize: number) {
  return new ReadableStream({
    	async start(controller) {
			const startTime = performance.now();

			const response = await chat.sendMessageStream({
				message: query
			});

			const endTime = performance.now();
			console.log(`Time taken for sendMessageStream: ${Math.round(endTime - startTime)}ms`);

			let buffer = ""; 

			for await (const chunk of response) {
				if (!chunk.text) {
					continue;
				}

				const text = chunk.text;
				buffer += text;
				console.log(text);

				// Split the buffer into chunks of the specified size
				while (buffer.length >= chunkSize) {
					const chunkToSend = buffer.slice(0, chunkSize);
					buffer = buffer.slice(chunkSize);
					controller.enqueue(chunkToSend);
				}
			}

			// Send any remaining text in the buffer
			if (buffer.length > 0) {
				controller.enqueue(buffer);
			}

			controller.close();
		}
  	});
}
