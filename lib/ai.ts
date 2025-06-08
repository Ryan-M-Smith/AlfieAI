//
// Filename: ai.ts
// Description: Machine learning and AI related functions
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

export async function embed(text: string): Promise<any[]> {
	console.log("Service URL", process.env.EMBEDDING_MODEL_URL);
	
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
