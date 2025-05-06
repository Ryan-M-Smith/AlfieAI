//
// Filename: ai.ts
// Description: Machine learning and AI related functions
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { pipeline } from "@xenova/transformers"

export async function embed(text: string) {
	if (process.env.NODE_ENV === "production") {
		process.env.TRANSFORMERS_CACHE = "/tmp/.transformers_cache";
	}

// Then your import and usage of @xenova/transformers...

	
	// Load the embedding pipeline with a sentence transformer model
	const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

	// Get embedding for a sentence
	const output = await extractor(text, {
		pooling: "mean",
		normalize: true
	});

	return Array.from(output.data);
}
