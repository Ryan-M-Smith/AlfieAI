//
// Filename: util.ts
// Description: Utility functions
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

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

export async function fetchLUT(): Promise<Record<string, any>> {
	const response = await fetch(process.env.PROFILE_LUT_URL!);
	return await response.json();
}
