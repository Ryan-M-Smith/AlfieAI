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

interface ProfessorMatcher {
	key: string;
	fullNameRegex: RegExp;
	initialNameRegex: RegExp | null;
}

interface CourseOfferingRow {
	course_code?: string;
	title?: string;
	term?: string;
	credits?: string;
	instructorNames?: string[];
}

const DEPARTMENTS_CACHE_TTL_MS = 5 * 60 * 1000;
let departmentsCache: {
	expiresAt: number;
	value: string[];
} | null = null;

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

function buildOfferingsByTerm(rows: CourseOfferingRow[]): OfferingsByTerm[] {
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

	return [...byTerm.entries()]
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
}

function buildProfessorMatcher(firstName: string, lastName: string): ProfessorMatcher {
	const firstToken = firstName.split(/\s+/).filter(Boolean)[0] || firstName;
	const safeFirst = firstToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const safeLast = lastName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const firstInitial = firstToken.charAt(0).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	return {
		key: `${firstName}|${lastName}`,
		fullNameRegex: new RegExp(`^\\s*(?:dr\\.?\\s+|prof\\.?\\s+)?${safeFirst}(?:\\s+[A-Za-z]\\.)?\\s+${safeLast}\\s*$`, "i"),
		initialNameRegex: firstInitial
			? new RegExp(`^\\s*(?:dr\\.?\\s+|prof\\.?\\s+)?${firstInitial}\\.?\\s+${safeLast}\\s*$`, "i")
			: null,
	};
}

async function getOfferingsByProfessors(params: {
	coursesCollection: Collection<Document>;
	matchers: ProfessorMatcher[];
}) {
	if (params.matchers.length === 0) {
		return new Map<string, OfferingsByTerm[]>();
	}

	const allRegexes = params.matchers.flatMap((matcher) => (
		matcher.initialNameRegex
			? [matcher.fullNameRegex, matcher.initialNameRegex]
			: [matcher.fullNameRegex]
	));

	const rows = await params.coursesCollection.aggregate([
		{ $unwind: "$sections" },
		{ $match: { "sections.instructors.name": { $in: allRegexes } } },
		{
			$project: {
				course_code: 1,
				title: 1,
				term: "$sections.term",
				instructorNames: "$sections.instructors.name",
				credits: {
					$cond: [
						{ $eq: ["$credits.minimum", "$credits.maximum"] },
						{ $toString: "$credits.minimum" },
						{ $concat: [{ $toString: "$credits.minimum" }, "-", { $toString: "$credits.maximum" }] },
					],
				},
			},
		},
	]).toArray() as CourseOfferingRow[];

	const rowsByProfessor = new Map<string, CourseOfferingRow[]>();
	const seenByProfessor = new Map<string, Set<string>>();

	for (const row of rows) {
		const instructorNames = Array.isArray(row.instructorNames) ? row.instructorNames : [];

		for (const matcher of params.matchers) {
			const matched = instructorNames.some((name) => {
				if (typeof name !== "string") {
					return false;
				}

				if (matcher.fullNameRegex.test(name)) {
					return true;
				}

				return Boolean(matcher.initialNameRegex?.test(name));
			});

			if (!matched) {
				continue;
			}

			const dedupeKey = `${String(row.term || "")}::${String(row.course_code || "")}::${String(row.title || "")}`;
			const seen = seenByProfessor.get(matcher.key) || new Set<string>();
			if (seen.has(dedupeKey)) {
				continue;
			}

			seen.add(dedupeKey);
			seenByProfessor.set(matcher.key, seen);

			const current = rowsByProfessor.get(matcher.key) || [];
			current.push(row);
			rowsByProfessor.set(matcher.key, current);
		}
	}

	const offeringsByProfessor = new Map<string, OfferingsByTerm[]>();
	for (const matcher of params.matchers) {
		offeringsByProfessor.set(matcher.key, buildOfferingsByTerm(rowsByProfessor.get(matcher.key) || []));
	}

	return offeringsByProfessor;
}

async function getDepartmentOptions(professorsCollection: Collection<ProfessorRecord>): Promise<string[]> {
	const now = Date.now();
	if (departmentsCache && departmentsCache.expiresAt > now) {
		return departmentsCache.value;
	}

	const values = (await professorsCollection.distinct("department")).filter(Boolean).sort();
	departmentsCache = {
		expiresAt: now + DEPARTMENTS_CACHE_TTL_MS,
		value: values,
	};

	return values;
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

	const [total, departmentOptions, professorDocs] = await Promise.all([
		professorsCollection.countDocuments(match),
		getDepartmentOptions(professorsCollection),
		professorsCollection
		.find(match, {
			projection: {
				_id: 0,
				firstName: 1,
				lastName: 1,
				department: 1,
				primaryTitle: 1,
				titles: 1,
				email: 1,
				phone: 1,
				biographyUrl: 1,
				headshotUrl: 1,
			},
		})
		.sort({ lastName: 1, firstName: 1 })
		.skip((page - 1) * pageSize)
		.limit(pageSize)
		.toArray(),
	]);

	const preparedProfessors = professorDocs.map((professor) => {
			const firstName = normalize(professor.firstName || "");
			const lastName = normalize(professor.lastName || "");
			const fullName = `${firstName} ${lastName}`.trim();
			const matcher = buildProfessorMatcher(firstName, lastName);

			return {
				professor,
				firstName,
				lastName,
				fullName,
				matcher,
			};
		});

	const offeringsByProfessor = await getOfferingsByProfessors({
		coursesCollection,
		matchers: preparedProfessors.map((item) => item.matcher),
	});

	const results = preparedProfessors.map(({ professor, firstName, lastName, fullName, matcher }) => {
			const offeringsByTerm = offeringsByProfessor.get(matcher.key) || [];

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
		});

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
