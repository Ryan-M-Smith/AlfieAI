import { NextResponse } from "next/server";

import { AVAILABLE_POES } from "@/lib/gen-ed-rules";
import clientPromise from "@/lib/mongodb";

function parseYear(term: string): number {
	const match = term.match(/(19|20)\d{2}/);
	return match ? Number(match[0]) : 0;
}

function parseSemesterRank(term: string): number {
	const normalized = term.toLowerCase();

	if (normalized.includes("fall")) return 4;
	if (normalized.includes("summer")) return 3;
	if (normalized.includes("spring")) return 2;
	if (normalized.includes("winter")) return 1;

	return 0;
}

function sortTermsDescending(terms: string[]): string[] {
	return [...terms].sort((left, right) => {
		const yearDiff = parseYear(right) - parseYear(left);
		if (yearDiff !== 0) {
			return yearDiff;
		}

		const semesterDiff = parseSemesterRank(right) - parseSemesterRank(left);
		if (semesterDiff !== 0) {
			return semesterDiff;
		}

		return right.localeCompare(left);
	});
}

export async function GET() {
	const warnings: string[] = [];
	let terms: string[] = [];

	try {
		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
		const coursesCollection = db.collection(process.env.MONGODB_COURSES_COLLECTION || "courses");
		const rawTerms = await coursesCollection.distinct("sections.term");
		terms = sortTermsDescending(
			rawTerms
				.filter((term): term is string => typeof term === "string" && term.trim().length > 0)
				.map((term) => term.trim())
		);
	}
	catch (error) {
		console.error("Failed to load planner options", error);
		warnings.push("Could not load terms from the database.");
	}

	return NextResponse.json({
		terms,
		poes: AVAILABLE_POES,
		warnings,
	});
}
