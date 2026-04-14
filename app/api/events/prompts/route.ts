import { NextResponse } from "next/server";

import { generateStarterPrompts } from "@/lib/events-model";

export const revalidate = 0;

export async function GET() {
	const prompts = await generateStarterPrompts();

	return NextResponse.json({ prompts }, {
		headers: {
			"Cache-Control": "no-store",
		},
	});
}
