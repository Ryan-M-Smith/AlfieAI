//
// Filename: ai.ts
// Description: Machine learning and AI related functions
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import fs from "fs";

export async function embed(text: string) {
	const cachePath = "/tmp/.transformers_cache";
	process.env.TRANSFORMERS_CACHE = cachePath;

	// Ensure the directory exists
	if (!fs.existsSync(cachePath)) {
		fs.mkdirSync(cachePath, { recursive: true });
	}

	const { pipeline } = await import("@xenova/transformers");

	// Load the embedding pipeline with a sentence transformer model
	const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

	// Get embedding for a sentence
	const output = await extractor(text, {
		pooling: "mean",
		normalize: true
	});

	return Array.from(output.data);
}
