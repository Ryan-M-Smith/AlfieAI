//
// Filename: mongodb.ts
// Description: Interface with MongoDB
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_CONNECTION_STRING!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
	var _mongoClientPromise: Promise<MongoClient>;
}

if (!uri) {
	throw new Error("Please add your MongoDB URI to .env");
}

if (process.env.NODE_ENV === "development") {
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, options);
		global._mongoClientPromise = client.connect();
	}

	clientPromise = global._mongoClientPromise;
}
else {
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

export default clientPromise;
