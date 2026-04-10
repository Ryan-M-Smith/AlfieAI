import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelID = "gemini-3-flash-preview";

export async function POST(request: NextRequest) {
	const { professor } = await request.json();

	if (!professor) {
		return NextResponse.json({ error: "Missing professor payload." }, { status: 400 });
	}

	const prompt = [
		"You are AlfieAI. Provide practical, fair, and uncertainty-aware professor insights.",
		"You may use online sources to find background details.",
		"Do not fabricate facts. If a fact cannot be verified, say Unknown.",
		"Do not infer protected traits.",
		"Return plain text with concise sections:",
		"1) Who they are (role, department)",
		"2) Education and degrees (institution + degree, if verified)",
		"3) Difficulty and teaching style signals",
		"4) Course offerings context from catalog",
		"5) Student fit and preparation tips",
		"6) Sources used (URLs)",
		"Max 260 words.",
		`Professor JSON: ${JSON.stringify(professor)}`,
	].join("\n");

	const response = await genAI.models.generateContent({
		model: modelID,
		contents: prompt,
		config: {
			tools: [{ googleSearch: {} }],
		},
	});

	const text = response.text?.trim();

	if (!text) {
		return NextResponse.json({ error: "Failed to generate professor insights." }, { status: 500 });
	}

	return NextResponse.json({ insights: text });
}
