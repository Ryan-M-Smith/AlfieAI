import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelID = "gemini-3-flash-preview";

export async function POST(request: NextRequest) {
	const { course } = await request.json();

	if (!course) {
		return NextResponse.json({ error: "Missing course payload." }, { status: 400 });
	}

	const prompt = [
		"You are AlfieAI. Give concise, practical course insights for a college student.",
		"Use only the data provided for this course.",
		"For exam and grading expectations, you may check online sources and syllabus material only if verified as official Juniata College sources.",
		"Accepted source domains: juniata.edu and official Juniata subdomains.",
		"Do not use Reddit, RateMyProfessors, social posts, or third-party summaries for exam/grading claims.",
		"If you cannot verify exam/grading details from official Juniata sources, explicitly say: Unknown (not verified from Juniata).",
		"If information is not directly provided, clearly label it as inferred or unknown.",
		"Return plain text with short sections:",
		"1) Who this course is best for",
		"2) Difficulty and workload signals",
		"3) Homework and assignment types (problem sets, labs, essays, projects, reading, presentations) with confidence",
		"4) Exam and grading expectations (midterms/finals/quizzes), or say unknown",
		"5) Scheduling considerations",
		"6) Tips to succeed",
		"7) Similar alternatives (if inferable)",
		"8) Verified Juniata sources used (URLs) or 'None'",
		"Keep it under 260 words and avoid markdown code blocks.",
		`Course JSON: ${JSON.stringify(course)}`,
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
		return NextResponse.json({ error: "Failed to generate course insights." }, { status: 500 });
	}

	return NextResponse.json({ insights: text });
}
