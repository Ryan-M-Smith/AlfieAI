//
// Filename: route.ts
// Route: /api/people
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { Document } from "mongodb";
import { NextResponse } from "next/server"

import clientPromise from "@/lib/mongodb"
import { embed, uniqueKey } from "@/lib/util"

export async function POST(request: Request) {
  	const { query } = await request.json();
	const queryEmbedding = await embed(query);

	const client = await clientPromise;
	const db = client.db("VectorDB");
	const collection = db.collection("linkedinData");
  	const results = await collection.aggregate([
		{
			$vectorSearch: {
				index: "semantic_search",
				path: "embedding",
				queryVector: queryEmbedding,
				numCandidates: 100,
				limit: 30 // Take a few extra, in case we need to filter later
			}
		}
	]).toArray();

	//
	// Filtering duplicates
	//
	// Two determine if two documents are duplicates, we generate unique keys based on the normalized
	// profile names and headlines. If the results array does not contain a document with the same key,
	// we know it's unique and add it to the document map - a collection of unique documents.
	//
	// If we run into a document with the same key, we then check to see if the new profile we found
	// has more recent information than the one we already have in the map. If it does, we replace the existing
	// document. Rather than simply throwing out duplicates, this allows us to make sure we have the most up-to-date
	// records for each top result.
	//
	// Finally, the document map is used to build the final results array.
	//

	const documentMap = new Map<string, Document>();
	
	for (const document of results) {
	    const key = uniqueKey(document);
	    const updatedAt = document.updated_at;

	    if (!documentMap.has(key)) {
			// If the key does not exist, we add the document to the map
	        documentMap.set(key, document);
	    }
		else {
	        const existing = documentMap.get(key)!;

			// If the key exists, we compare the timestamps	
	        if (updatedAt > existing.updated_at) {
	            // Replace with a newer document, if applicable
				documentMap.set(key, document);
	        }
	    }
	}

	const uniqueResults = Array.from(documentMap.values()).slice(0, 25);
	return NextResponse.json({ results: uniqueResults });
}
