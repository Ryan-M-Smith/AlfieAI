import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_CONNECTION_STRING;

if (!uri) {
	throw new Error("Missing MONGODB_CONNECTION_STRING");
}

const dbName = process.env.MONGODB_COURSES_DB || "VectorDB";
const professorsCollectionName = process.env.MONGODB_PROFESSORS_COLLECTION || "professors";

const datasetPath = path.join(process.cwd(), "data", "professors.json");
const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

const client = new MongoClient(uri);

try {
	await client.connect();

	const db = client.db(dbName);
	const collection = db.collection(professorsCollectionName);

	await collection.createIndex({ firstName: 1, lastName: 1 }, { unique: true });
	await collection.createIndex({ department: 1 });
	await collection.createIndex({ searchName: 1 });
	await collection.createIndex({ email: 1 });

	const now = new Date();
	const operations = dataset.map((professor) => {
		const firstName = String(professor.firstName || "").trim();
		const lastName = String(professor.lastName || "").trim();
		const department = String(professor.department || "").trim();
		const primaryTitle = String(professor.primaryTitle || "").trim();
		const titles = Array.isArray(professor.titles)
			? professor.titles.map((value) => String(value || "").trim()).filter(Boolean)
			: [];
		const email = String(professor.email || "").trim().toLowerCase();
		const phone = String(professor.phone || "").trim();
		const biographyUrl = String(professor.biographyUrl || "").trim();
		const headshotUrl = String(professor.headshotUrl || "").trim();
		const source = String(professor.source || "").trim();
		const searchName = `${firstName} ${lastName}`.toLowerCase();

		return {
			updateOne: {
				filter: { firstName, lastName },
				update: {
					$set: {
						department,
						primaryTitle,
						titles,
						email,
						phone,
						biographyUrl,
						headshotUrl,
						source,
						searchName,
						updatedAt: now,
					},
					$setOnInsert: {
						createdAt: now,
					},
				},
				upsert: true,
			},
		};
	});

	const result = await collection.bulkWrite(operations, { ordered: false });

	console.log(`Seed complete for ${professorsCollectionName} in ${dbName}`);
	console.log(`matched: ${result.matchedCount}, modified: ${result.modifiedCount}, upserted: ${result.upsertedCount}`);
}
finally {
	await client.close();
}
