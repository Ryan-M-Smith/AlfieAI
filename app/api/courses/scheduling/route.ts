//
// Filename: route.ts
// Route: /api/courses/scheduling
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { NextResponse } from "next/server"

import { generate } from "@/lib/course-model";
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
	const { query } = await request.json();
	const stream = generate(query);
	
	return new NextResponse(await stream, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Transfer-Encoding": "chunked"
		}
	});
}
