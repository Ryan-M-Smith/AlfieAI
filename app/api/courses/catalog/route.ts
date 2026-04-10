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

export async function POST(request: NextRequest) {
	const body = await request.json();
	const query = (body.query || "").trim();
	const page = Math.max(1, Number(body.page) || 1);
	const pageSize = Math.min(50, Math.max(5, Number(body.pageSize) || 12));
	const filters: CatalogFilters = body.filters || {};

	const client = await clientPromise;
	const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
	const collection = db.collection(process.env.MONGODB_COURSES_COLLECTION || "courses");

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

	const [result] = await collection
		.aggregate([
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
				},
			},
		])
		.toArray();

	const total = result?.totalCount?.[0]?.count || 0;

	return NextResponse.json({
		results: result?.results || [],
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		},
		facets: {
			departments: (result?.departmentFacets || []).map((item: { _id: string }) => item._id).filter(Boolean),
			terms: (result?.termFacets || []).map((item: { _id: string }) => item._id).filter(Boolean),
			academicLevels: (result?.academicLevelFacets || []).map((item: { _id: string }) => item._id).filter(Boolean),
		},
	});
}
