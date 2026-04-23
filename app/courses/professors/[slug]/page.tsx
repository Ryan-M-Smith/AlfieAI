import Link from "next/link";
import { notFound } from "next/navigation";
import { Collection, Document } from "mongodb";

import ProfessorDetailView from "@/components/professor-detail-view";
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
	source?: string;
}

interface Offering {
	course_code: string;
	title: string;
	credits: string;
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

export default async function ProfessorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const client = await clientPromise;
	const db = client.db(process.env.MONGODB_COURSES_DB || "VectorDB");
	const professorsCollection = db.collection<ProfessorRecord>(process.env.MONGODB_PROFESSORS_COLLECTION || "professors");
	const coursesCollection = db.collection(process.env.MONGODB_COURSES_COLLECTION || "courses");

	const docs = await professorsCollection.find({}).toArray();
	const professor = docs.find((doc) => toSlug(`${doc.firstName} ${doc.lastName}`) === slug);

	if (!professor) {
		notFound();
	}

	const firstName = normalize(professor.firstName || "");
	const lastName = normalize(professor.lastName || "");
	const fullName = `${firstName} ${lastName}`.trim();
	const offeringsByTerm = await getOfferingsByProfessor({
		coursesCollection,
		firstName,
		lastName,
	});

	const detailProfessor = {
		firstName,
		lastName,
		fullName,
		department: normalize(professor.department || "Unknown"),
		primaryTitle: normalize(professor.primaryTitle || ""),
		titles: Array.isArray(professor.titles) ? professor.titles.map((title) => normalize(String(title))).filter(Boolean) : [],
		email: normalize(professor.email || ""),
		phone: normalize(professor.phone || ""),
		biographyUrl: normalize(professor.biographyUrl || ""),
		headshotUrl: normalize(professor.headshotUrl || ""),
	};

	return (
		<div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-10">
			<Link href="/courses/professors" className="text-sm text-secondary-600 hover:text-secondary-700">Back to professors</Link>
			<ProfessorDetailView professor={detailProfessor} offeringsByTerm={offeringsByTerm} />
		</div>
	);
}
