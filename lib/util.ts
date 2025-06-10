//
// Filename: util.ts
// Description: Utility functions
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { Document } from "mongodb";
import { remove as removeDiacritics } from "diacritics"; // npm install diacritics

export async function embed(text: string): Promise<any[]> {
	const response = await fetch(
		process.env.EMBEDDING_MODEL_URL!,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ text: text }),
		}
	);
	const json = await response.json();
	return json.embeddings;
}

export function uniqueKey(document: Document) {
	const normalize = (str: string) =>
		removeDiacritics(str).toLowerCase().replace(/\s+/g, "");
	
	return normalize(document.name || "") + "|" + normalize(document.headline || "");
}
