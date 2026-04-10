import { NextRequest, NextResponse } from "next/server";
import type { Collection, Document } from "mongodb";

import clientPromise from "@/lib/mongodb";

interface ProfessorRecord {
	firstName: string;
	lastName: string;
	department: string;
	primaryTitle?: string;
	titles?: string[];
	email?: string;
	phone?: string;
	biographyUrl?: string;
	headshotUrl?: string;
	searchName?: string;
}

interface Offering {
	course_code: string;
	title: string;
	credits: string;
}

interface OfferingsByTerm {
	term: string;
	courses: Offering[];
}

function normalize(value: string) {
	return value.trim().replace(/\s+/g, " ");
}

function toSlug(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function termYear(term: string): number {
	const match = term.match(/(19|20)\d{2}/);
	return match ? Number(match[0]) : 0;
}

function termSemesterRank(term: string): number {
	const value = term.toLowerCase();
	if (value.includes("spring")) return 1;
	if (value.includes("summer")) return 2;
	if (value.includes("fall")) return 3;
	if (value.includes("winter")) return 4;
	return 9;
}

async function getOfferingsByProfessor(params: {
	coursesCollection: Collection<Document>;
	firstName: string;
	lastName: string;
}) {
	const firstToken = params.firstName.split(/\s+/).filter(Boolean)[0] || params.firstName;
	const safeFirst = firstToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const safeLast = params.lastName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const firstInitial = firstToken.charAt(0).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	const fullNameRegex = new RegExp(`^\\s*(?:dr\\.?\\s+|prof\\.?\\s+)?${safeFirst}(?:\\s+[A-Za-z]\\.)?\\s+${safeLast}\\s*$`, "i");
	const initialNameRegex = firstInitial
		? new RegExp(`^\\s*(?:dr\\.?\\s+|prof\\.?\\s+)?${firstInitial}\\.?\\s+${safeLast}\\s*$`, "i")
		: null;

	const instructorMatch = initialNameRegex
		? { $in: [fullNameRegex, initialNameRegex] }
		: { $regex: fullNameRegex };

	const rows = await params.coursesCollection.aggregate([
		{ $unwind: "$sections" },
		{ $match: { "sections.instructors.name": instructorMatch } },
		{
			$project: {
				course_code: 1,
				title: 1,
				term: "$sections.term",
				credits: {
					$cond: [
						{ $eq: ["$credits.minimum", "$credits.maximum"] },
						{ $toString: "$credits.minimum" },
						{ $concat: [{ $toString: "$credits.minimum" }, "-", { $toString: "$credits.maximum" }] },
					],
				},
			},
		},
		{ $sort: { term: 1, course_code: 1 } },
	]).toArray();

	const byTerm = new Map<string, Offering[]>();

	for (const row of rows) {
		const term = String(row.term || "Unknown Term");
		const current = byTerm.get(term) || [];
		current.push({
			course_code: String(row.course_code || ""),
			title: String(row.title || ""),
			credits: String(row.credits || ""),
		});
		byTerm.set(term, current);
	}

	const offeringsByTerm: OfferingsByTerm[] = [...byTerm.entries()]
		.map(([term, courses]) => ({
			term,
			courses: courses.sort((a, b) => a.course_code.localeCompare(b.course_code)),
		}))
		.sort((a, b) => {
			const yearDiff = termYear(a.term) - termYear(b.term);
			if (yearDiff !== 0) return yearDiff;
			const semDiff = termSemesterRank(a.term) - termSemesterRank(b.term);
			if (semDiff !== 0) return semDiff;
			return a.term.localeCompare(b.term);
		});

	return offeringsByTerm;
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const query = (body.query || "").trim();
	const department = (body.department || "").trim();
	const page = Math.max(1, Number(body.page) || 1);
	const pageSize = Math.min(24, Math.max(6, Number(body.pageSize) || 12));

	const client = await clientPromise;
	const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
	const professorsCollection = db.collection<ProfessorRecord>(process.env.MONGODB_PROFESSORS_COLLECTION || "professors");
	const coursesCollection = db.collection(process.env.MONGODB_COURSES_COLLECTION || "courses");

	const match: Record<string, unknown> = {};

	if (query) {
		match.$or = [
			{ firstName: { $regex: query, $options: "i" } },
			{ lastName: { $regex: query, $options: "i" } },
			{ searchName: { $regex: query, $options: "i" } },
			{ department: { $regex: query, $options: "i" } },
		];
	}

	if (department) {
		match.department = department;
	}

	const total = await professorsCollection.countDocuments(match);
	const professorDocs = await professorsCollection
		.find(match)
		.sort({ lastName: 1, firstName: 1 })
		.skip((page - 1) * pageSize)
		.limit(pageSize)
		.toArray();

	const departmentOptions = await professorsCollection.distinct("department");

	const results = await Promise.all(
		professorDocs.map(async (professor) => {
			const firstName = normalize(professor.firstName || "");
			const lastName = normalize(professor.lastName || "");
			const fullName = `${firstName} ${lastName}`.trim();

			const offeringsByTerm = await getOfferingsByProfessor({
				coursesCollection,
				firstName,
				lastName,
			});

			const totalCourses = offeringsByTerm.reduce((acc, term) => acc + term.courses.length, 0);

			return {
				firstName,
				lastName,
				fullName,
				slug: toSlug(fullName),
				department: normalize(professor.department || "Unknown"),
				primaryTitle: normalize(professor.primaryTitle || ""),
				titles: Array.isArray(professor.titles) ? professor.titles.map((title) => normalize(String(title))).filter(Boolean) : [],
				email: normalize(professor.email || ""),
				phone: normalize(professor.phone || ""),
				biographyUrl: normalize(professor.biographyUrl || ""),
				headshotUrl: normalize(professor.headshotUrl || ""),
				offeringsByTerm,
				totalCourses,
			};
		})
	);

	return NextResponse.json({
		results,
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		},
		filters: {
			departments: departmentOptions.filter(Boolean).sort(),
		},
	});
}
