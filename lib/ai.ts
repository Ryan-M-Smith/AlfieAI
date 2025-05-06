//
// Filename: ai.ts
// Description: Machine learning and AI related functions
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import fs from "fs";
import { pipeline } from "@xenova/transformers";

export async function embed(text: string) {
	const cachePath = process.env.TRANSFORMERS_CACHE_DIR!;

	// Ensure the directory exists
	if (!fs.existsSync(cachePath)) {
		fs.mkdirSync(cachePath, { recursive: true });
	}

	// Load the embedding pipeline with a sentence transformer model
	const extractor = await pipeline(
		"feature-extraction",
		"Xenova/all-MiniLM-L6-v2",
		{ cache_dir: cachePath }
	);

	// Get embedding for a sentence
	const output = await extractor(text, {
		pooling: "mean",
		normalize: true
	});

	return Array.from(output.data);
}
