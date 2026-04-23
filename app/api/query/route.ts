//
// Filename: route.ts
// Route: /api/query
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import { NextResponse } from "next/server";

import { generateWithChunking } from "@/lib/chat-model";

export const maxDuration = 60;

interface UploadedAttachment {
	name: string;
	mimeType: string;
	dataBase64: string;
}

const MAX_UPLOAD_FILES = 4;
const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;

async function parseRequestPayload(request: Request): Promise<{ query: string; attachments: UploadedAttachment[] }> {
	const contentType = request.headers.get("content-type") || "";

	if (!contentType.includes("multipart/form-data")) {
		const { query } = await request.json();
		return { query: typeof query === "string" ? query : "", attachments: [] };
	}

	const formData = await request.formData();
	const queryField = formData.get("query");
	const query = typeof queryField === "string" ? queryField : "";
	const attachmentCandidates = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
	const attachments: UploadedAttachment[] = [];

	for (const file of attachmentCandidates.slice(0, MAX_UPLOAD_FILES)) {
		if (!file.size || file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
			continue;
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		attachments.push({
			name: file.name || "upload",
			mimeType: file.type || "application/octet-stream",
			dataBase64: buffer.toString("base64"),
		});
	}

	return { query, attachments };
}

export async function POST(request: Request) {
	const { query, attachments } = await parseRequestPayload(request);
	const normalizedQuery = query.trim() || (attachments.length > 0 ? "Please analyze the attached files and help with the request." : "");

	if (!normalizedQuery) {
		return new NextResponse("Missing query", { status: 400 });
	}

	const stream = await generateWithChunking(normalizedQuery, 128, attachments);

	return stream? (
		new NextResponse(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Transfer-Encoding": "chunked",
				"Cache-Control": "no-cache, no-transform",
				"X-Accel-Buffering": "no"
			}
		})
	) : new NextResponse("Failed to generate filters", { status: 500 });
}