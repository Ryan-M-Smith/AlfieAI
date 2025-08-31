//
// Filename: route.ts
// Route: /api/query
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import { NextResponse } from "next/server";

import { generate } from "@/lib/gemini-model";

export const maxDuration = 30;

export async function POST(request: Request) {
	const { query } = await request.json();
	const stream = await generate(query);

	return stream? (
		new NextResponse(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Transfer-Encoding": "chunked"
			}
		})
	) : new NextResponse("Failed to generate filters", { status: 500 });
}