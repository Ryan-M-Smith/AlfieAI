//
// Filename: route.ts
// Route: /api/query
<<<<<<< HEAD
// Copyright (c) 2025 Ryan Smith
=======
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
>>>>>>> 19dbd4e (Update boilerplate)
//

import { NextResponse } from "next/server";

import { generate } from "@/lib/gemini-model";

export const maxDuration = 30;

export async function POST(request: Request) {
	const { query } = await request.json();
	const stream = await generate(query);

	return new NextResponse(stream, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Transfer-Encoding": "chunked"
		}
	});
}