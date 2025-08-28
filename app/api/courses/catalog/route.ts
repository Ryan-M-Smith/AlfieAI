//
// Filename: route.ts
// Route: /api/courses/catalog
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { NextRequest } from "next/server"

import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
	const { query, limit, nextToken: startToken } = await request.json();

	const client = await clientPromise;
	const db = client.db("VectorDB");
	const collection = db.collection("courses");
	const results = await collection.aggregate([
		{
			$search: {
				index: "course_index",
				...(startToken? { searchAfter: startToken } : {}),
      			compound: {
					should: [
						{
							text: {
								query: query,
								path: "course_code",
								score: {
									boost: {
									value: 100,
									},
								},
							},
						},

						{
							text: {
								query: query,
								path: "course_code.text_search",
								score: {
									boost: {
									value: 5,
									},
								},
							},
						},

						{
							text: {
								query: query,
								path: "title",
								score: {
									boost: {
									value: 2,
									},
								},
							},
						},

						{
							text: {
								query: query,
								path: "sections.instructors.name",
								score: {
									boost: {
									value: 2,
									},
								},
							},
						},

						{
							text: {
								query: query,
								path: "description",
							},
						}
					]
				}
			}
		},

		{
			$facet: {
				results: [
					{ $limit: limit + 1 },
					{
						$project: { comments: 0 }
					}
				],

				nextToken: [
					{ $skip: limit },
					{ $limit: 1 },
					{
						$project: {
							paginationToken: { $meta: "searchSequenceToken" }
						}
					}
				]
			}
		}
	]).toArray();

	// Extract the courses and pagination token from the results
	const { results: courses, nextToken } = results[0];
	const paginationToken = nextToken && nextToken.length > 0? nextToken[0].paginationToken : null;

	return new Response(JSON.stringify({
		results: courses.slice(0, limit),
		nextToken: courses.length > limit? paginationToken : null
	}), { status: 200 });
}
