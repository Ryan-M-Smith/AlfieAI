//
// Filename: route.ts
// Route: /api/people
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { NextResponse } from "next/server"

import clientPromise from "@/lib/mongodb"
import { embed } from "@/lib/ai"

export async function POST(request: Request) {
	const url = process.env.NODE_ENV === "development"? process.env.LOCALHOST : process.env.PUBLIC;

  	const { query } = await request.json();
	const queryEmbedding = await embed(query);

	console.log("Query embedding:", queryEmbedding);

	const client = await clientPromise;
	const db = client.db("VectorDB");
	const collection = db.collection("linkedinData");
  	const personIDs = await collection.aggregate([
		{
			$vectorSearch: {
				index: "semantic_search",
				path: "embedding",
				queryVector: queryEmbedding,
				numCandidates: 100,
				limit: 25
			}
		}
	]).toArray();

	const response = await fetch(`${url}/linkedin_profiles_lut.json`);
	const lut = JSON.parse(await response.text());

	const results = personIDs.map(result => lut[result.person_id]);

  	return NextResponse.json({ results });
}
