//
// Filename: route.ts
// Route: /api/people
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { NextResponse } from "next/server"

import clientPromise from "@/lib/mongodb"
import { embed, fetchLUT } from "@/lib/util"

export async function POST(request: Request) {
  	const { query } = await request.json();
	const queryEmbedding = await embed(query);

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

	const lut = await fetchLUT();
	console.log(lut);
	const results = personIDs.map(result => lut[result.person_id]);
	console.log(results);

  	return NextResponse.json({ results });
}
