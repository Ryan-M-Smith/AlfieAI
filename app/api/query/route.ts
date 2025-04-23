//
// Filename: route.ts
// Route: /api/query
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { NextResponse } from "next/server";

import generate from "@/lib/gemini-model";

export async function POST(request: Request) {
	const { query } = await request.json();
	const response = await generate(query);
	return NextResponse.json({ response: response });
}