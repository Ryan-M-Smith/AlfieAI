//
// Filename: page.tsx
// Description: An Express microservice for hosting the embedding model
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import cors from "cors";
import express from "express";
import { env, FeatureExtractionPipeline, pipeline } from "@xenova/transformers";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

let extractor: FeatureExtractionPipeline | null = null;

app.post("/embed", async (req: express.Request, res: express.Response) => {
	const { text } = req.body;

	if (!text) {
		res.status(400).json({ error: "Missing 'text' field" });
		return;
	}
	else if (!extractor) {
		res.status(503).json({ error: "Model not loaded yet" });
		return;
	}

	try {
		const output = await extractor(text, {
			pooling: "mean",
			normalize: true
		});
		const embeddings = Array.from(output.data);

		res.json({ embeddings: embeddings });
	}
	catch (err) {
		res.status(500).json({ error: "Embedding failed", detail: err });
	}
});

app.get("/ping", (_req: express.Request, res: express.Response) => {
	res.send("Recevied!");
});

const PORT = process.env.PORT? parseInt(process.env.PORT) : 3000;

app.listen(PORT, "0.0.0.0", async () => {
	console.log(`Server running on port ${PORT}`);
	
	console.log(process.cwd());
	env.localModelPath = path.join(process.cwd(), "/model/");
	env.allowRemoteModels = false;

	extractor = await pipeline(
		"feature-extraction",
		"/sentence-transformers/all-MiniLM-L6-v2/",
		{
			cache_dir: "/dev/null",
			revision: undefined
		}
	);
});
