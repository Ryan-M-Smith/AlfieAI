import { NextRequest, NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { Course } from "@/lib/models/course";
import {
	buildCompletedCourseFilters,
	derivePlannerIntent,
	planOptimalSchedule,
	SchedulePlanningRequest,
} from "@/lib/schedule-planner";
import { extractTranscriptTextFromPdf } from "@/lib/transcript-parser";

export const maxDuration = 60;

const courseProjection = {
	_id: 1,
	course_code: 1,
	title: 1,
	description: 1,
	course_types: 1,
	academic_level: 1,
	credits: 1,
	requisites: 1,
	sections: 1,
} as const;

function getString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
}

function getOptionalNumber(formData: FormData, key: string): number | undefined {
	const value = getString(formData, key);
	if (!value) {
		return undefined;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function getOptionalBoolean(formData: FormData, key: string): boolean | undefined {
	const value = getString(formData, key);
	if (!value) {
		return undefined;
	}

	return value === "true";
}

export async function POST(request: NextRequest) {
	try {
		const contentType = request.headers.get("content-type") || "";
		let body: SchedulePlanningRequest;
		let transcriptParseWarning = "";

		if (contentType.includes("multipart/form-data")) {
			const formData = await request.formData();
			const transcriptFile = formData.get("transcriptFile");
			let transcriptText = getString(formData, "transcriptText");

			if (transcriptFile instanceof File && transcriptFile.size > 0) {
				const lowerName = transcriptFile.name.toLowerCase();
				const isPdf = transcriptFile.type === "application/pdf" || lowerName.endsWith(".pdf");

				if (!isPdf) {
					return NextResponse.json({ error: "Transcript uploads must be PDF files." }, { status: 400 });
				}

				const fileBuffer = new Uint8Array(await transcriptFile.arrayBuffer());
				transcriptText = await extractTranscriptTextFromPdf(fileBuffer);
				if (!transcriptText) {
					transcriptParseWarning = "The uploaded transcript PDF could not be read clearly, so completed coursework may be incomplete.";
				}
			}

			body = {
				term: getString(formData, "term"),
				poe: getString(formData, "poe") || undefined,
				entryType: (getString(formData, "entryType") || undefined) as SchedulePlanningRequest["entryType"],
				incomingCredits: getOptionalNumber(formData, "incomingCredits"),
				incomingCompositionCredits: getOptionalNumber(formData, "incomingCompositionCredits"),
				targetCredits: getOptionalNumber(formData, "targetCredits"),
				studyAbroad: (getString(formData, "studyAbroad") || undefined) as SchedulePlanningRequest["studyAbroad"],
				dualDegree: (getString(formData, "dualDegree") || undefined) as SchedulePlanningRequest["dualDegree"],
				legacyBlanketWaiver: getOptionalBoolean(formData, "legacyBlanketWaiver"),
				openSeatsOnly: getOptionalBoolean(formData, "openSeatsOnly"),
				prompt: getString(formData, "prompt") || undefined,
				transcriptText: transcriptText || undefined,
			};
		}
		else {
			body = (await request.json()) as SchedulePlanningRequest;
		}

		const term = (body.term || "").trim();

		if (!term) {
			return NextResponse.json({ error: "A term is required to generate a schedule." }, { status: 400 });
		}

		const plannerIntent = derivePlannerIntent(body);
		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
		const collection = db.collection<Course>(process.env.MONGODB_COURSES_COLLECTION || "courses");

		const availableCourses = await collection.aggregate<Course>([
			{
				$match: {
					sections: {
						$elemMatch: {
							term,
						},
					},
				},
			},
			{
				$project: {
					...courseProjection,
					sections: {
						$filter: {
							input: "$sections",
							as: "section",
							cond: { $eq: ["$$section.term", term] },
						},
					},
				},
			},
		]).toArray();

		let completedCourses: Course[] = [];
		const completedFilters = buildCompletedCourseFilters(plannerIntent.completedCourseCodes);
		if (completedFilters.length > 0) {
			completedCourses = await collection.find(
				{ $or: completedFilters },
				{ projection: courseProjection }
			).toArray() as unknown as Course[];
		}

		if (availableCourses.length === 0) {
			return NextResponse.json({ error: `No course offerings were found for ${term}.` }, { status: 404 });
		}

		const result = planOptimalSchedule(
			{ ...body, term },
			availableCourses as unknown as Course[],
			completedCourses
		);

		if (transcriptParseWarning) {
			result.warnings = [transcriptParseWarning, ...result.warnings];
		}

		return NextResponse.json(result);
	}
	catch (error) {
		console.error("Failed to generate schedule", error);
		return NextResponse.json(
			{ error: "Could not generate a schedule right now. The planner hit incomplete course data or another server-side issue." },
			{ status: 500 }
		);
	}
}
