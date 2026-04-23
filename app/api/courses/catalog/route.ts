//
// Filename: route.ts
// Route: /api/courses/catalog
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { NextRequest, NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";

interface CatalogFilters {
	department?: string;
	term?: string;
	year?: string;
	academicLevel?: string;
	openOnly?: boolean;
	minCredits?: number;
	maxCredits?: number;
}

interface ProfessorNameRecord {
	firstName?: string;
	lastName?: string;
}

interface CatalogFacets {
	departments: string[];
	terms: string[];
	academicLevels: string[];
}

const INSTRUCTOR_LOOKUP_TTL_MS = 5 * 60 * 1000;
let instructorLookupCache: {
	expiresAt: number;
	value: Map<string, string>;
} | null = null;

function normalizeWhitespace(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

function normalizeNameToken(value: string): string {
	return normalizeWhitespace(value)
		.toLowerCase()
		.replace(/[^a-z\s]/g, "")
		.trim();
}

function buildInstructorLookup(professors: ProfessorNameRecord[]): Map<string, string> {
	const lookup = new Map<string, string>();

	for (const professor of professors) {
		const firstRaw = normalizeWhitespace(String(professor.firstName || ""));
		const lastRaw = normalizeWhitespace(String(professor.lastName || ""));
		if (!firstRaw || !lastRaw) {
			continue;
		}

		const firstToken = normalizeNameToken(firstRaw).split(" ")[0] || "";
		const lastToken = normalizeNameToken(lastRaw).split(" ")[0] || "";
		if (!firstToken || !lastToken) {
			continue;
		}

		const fullName = `${firstRaw} ${lastRaw}`;
		lookup.set(`${firstToken} ${lastToken}`, fullName);

		const initial = firstToken.charAt(0);
		if (initial) {
			lookup.set(`${initial} ${lastToken}`, fullName);
		}
	}

	return lookup;
}

function instructorLookupKey(value: string): string {
	const stripped = normalizeWhitespace(value)
		.replace(/^(dr\.?|prof\.?|professor)\s+/i, "")
		.replace(/[^a-zA-Z\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();

	if (!stripped) {
		return "";
	}

	const parts = stripped.split(" ").filter(Boolean);
	if (parts.length < 2) {
		return "";
	}

	const first = parts[0];
	const last = parts[parts.length - 1];
	if (!first || !last) {
		return "";
	}

	if (first.length === 1) {
		return `${first} ${last}`;
	}

	return `${first} ${last}`;
}

async function getInstructorLookup(professorsCollection: ReturnType<typeof import("mongodb").Db.prototype.collection<ProfessorNameRecord>>) {
	const now = Date.now();

	if (instructorLookupCache && instructorLookupCache.expiresAt > now) {
		return instructorLookupCache.value;
	}

	const professorNameDocs = await professorsCollection
		.find({}, { projection: { _id: 0, firstName: 1, lastName: 1 } })
		.toArray();

	const lookup = buildInstructorLookup(professorNameDocs);
	instructorLookupCache = {
		expiresAt: now + INSTRUCTOR_LOOKUP_TTL_MS,
		value: lookup,
	};

	return lookup;
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const query = (body.query || "").trim();
	const page = Math.max(1, Number(body.page) || 1);
	const pageSize = Math.min(50, Math.max(5, Number(body.pageSize) || 12));
	const filters: CatalogFilters = body.filters || {};

	const client = await clientPromise;
	const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
	const collection = db.collection(process.env.MONGODB_COURSES_COLLECTION || "courses");
	const professorsCollection = db.collection<ProfessorNameRecord>(process.env.MONGODB_PROFESSORS_COLLECTION || "professors");

	const match: Record<string, unknown> = {};

	if (query) {
		match.$or = [
			{ course_code: { $regex: query, $options: "i" } },
			{ title: { $regex: query, $options: "i" } },
			{ description: { $regex: query, $options: "i" } },
			{ "sections.instructors.name": { $regex: query, $options: "i" } },
		];
	}

	if (filters.department) {
		match.course_code = { $regex: `^${filters.department}-`, $options: "i" };
	}

	if (filters.term) {
		match["sections.term"] = filters.term;
	}
	else if (filters.year) {
		match["sections.term"] = {
			$regex: `\\b${filters.year}\\b`,
			$options: "i",
		};
	}

	if (filters.academicLevel) {
		match.academic_level = filters.academicLevel;
	}

	if (filters.openOnly) {
		match.sections = {
			$elemMatch: {
				"availability.available": { $gt: 0 },
			},
		};
	}

	if (typeof filters.minCredits === "number" || typeof filters.maxCredits === "number") {
		match["credits.minimum"] = {};

		if (typeof filters.minCredits === "number") {
			(match["credits.minimum"] as Record<string, number>).$gte = filters.minCredits;
		}

		if (typeof filters.maxCredits === "number") {
			(match["credits.minimum"] as Record<string, number>).$lte = filters.maxCredits;
		}
	}

	const includeFacets = page === 1;

	const [result] = await collection.aggregate([
		{ $match: match },
		{
			$facet: {
				results: [
					{ $sort: { course_code: 1 } },
					{ $skip: (page - 1) * pageSize },
					{ $limit: pageSize },
					{
						$project: {
							_id: { $toString: "$_id" },
							course_code: 1,
							title: 1,
							description: 1,
							course_types: 1,
							academic_level: 1,
							credits: 1,
							requisites: 1,
							sections: 1,
						},
					},
				],
				totalCount: [{ $count: "count" }],
				...(includeFacets
					? {
						departmentFacets: [
							{
								$project: {
									department: {
										$arrayElemAt: [{ $split: ["$course_code", "-"] }, 0],
									},
								},
							},
							{ $group: { _id: "$department" } },
							{ $sort: { _id: 1 } },
						],
						termFacets: [
							{ $unwind: "$sections" },
							{ $group: { _id: "$sections.term" } },
							{ $sort: { _id: -1 } },
						],
						academicLevelFacets: [{ $group: { _id: "$academic_level" } }],
					}
					: {}),
			},
		},
	]).toArray();

	const total = result?.totalCount?.[0]?.count || 0;

	const instructorLookup = await getInstructorLookup(professorsCollection);

	const mappedResults = (result?.results || []).map((course: Record<string, unknown>) => {
		const sections = Array.isArray(course.sections) ? course.sections : [];

		const mappedSections = sections.map((section) => {
			const typedSection = section as Record<string, unknown>;
			const instructors = Array.isArray(typedSection.instructors) ? typedSection.instructors : [];

			const mappedInstructors = instructors.map((instructor) => {
				const typedInstructor = instructor as Record<string, unknown>;
				const rawName = String(typedInstructor.name || "");
				const key = instructorLookupKey(rawName);
				const resolvedName = key ? instructorLookup.get(key) : undefined;

				if (!resolvedName) {
					return instructor;
				}

				return {
					...typedInstructor,
					name: resolvedName,
				};
			});

			return {
				...typedSection,
				instructors: mappedInstructors,
			};
		});

		return {
			...course,
			sections: mappedSections,
		};
	});

	const facets: CatalogFacets = includeFacets
		? {
			departments: (result?.departmentFacets || []).map((item: { _id: string }) => item._id).filter(Boolean),
			terms: (result?.termFacets || []).map((item: { _id: string }) => item._id).filter(Boolean),
			academicLevels: (result?.academicLevelFacets || []).map((item: { _id: string }) => item._id).filter(Boolean),
		}
		: {
			departments: [],
			terms: [],
			academicLevels: [],
		};

	return NextResponse.json({
		results: mappedResults,
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		},
		facets,
	});
}
