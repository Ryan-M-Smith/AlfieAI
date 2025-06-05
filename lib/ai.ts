//
// Filename: ai.ts
// Description: Machine learning and AI related functions
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { env, pipeline } from "@xenova/transformers";
import path from "path";

export async function embed(text: string) {
	// Set up the environment to prefer local models
	env.localModelPath = path.join(process.cwd(), "/models/");
	env.allowRemoteModels = false;

	// Load the embedding pipeline with a sentence transformer model
	const extractor = await pipeline(
		"feature-extraction",
		"/sentence-transformers/all-MiniLM-L6-v2/",
		{
			cache_dir: "/dev/null",
			progress_callback: console.log,
			revision: undefined
		}
	);

	// Get embedding for a sentence
	const output = await extractor(text, {
		pooling: "mean",
		normalize: true
	});

	return Array.from(output.data);
}
