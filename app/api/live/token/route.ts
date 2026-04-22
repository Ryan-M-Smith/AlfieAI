import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_LIVE_MODEL = "gemini-live-2.5-flash-preview";
const ALLOWED_MODELS = new Set([
	"gemini-live-2.5-flash-preview",
	"gemini-2.0-flash-live-preview-04-09",
]);

type LiveTokenRequestBody = {
	model?: string;
};

export async function POST(request: NextRequest) {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "GEMINI_API_KEY is not configured on the server." },
			{ status: 500 },
		);
	}

	let body: LiveTokenRequestBody = {};
	try {
		body = (await request.json()) as LiveTokenRequestBody;
	} catch {
		body = {};
	}

	const requestedModel = body.model?.trim();
	const envModel = process.env.GEMINI_LIVE_MODEL?.trim();
	const defaultModel = envModel && ALLOWED_MODELS.has(envModel) ? envModel : DEFAULT_LIVE_MODEL;
	const model = requestedModel && ALLOWED_MODELS.has(requestedModel) ? requestedModel : defaultModel;

	const now = Date.now();
	const expireTime = new Date(now + 30 * 60 * 1000).toISOString();
	const newSessionExpireTime = new Date(now + 90 * 1000).toISOString();

	try {
		const ai = new GoogleGenAI({
			apiKey,
			apiVersion: "v1alpha",
		});

		const token = await ai.authTokens.create({
			config: {
				uses: 3,
				expireTime,
				newSessionExpireTime,
				liveConnectConstraints: {
					model,
				},
			},
		});

		if (!token.name) {
			return NextResponse.json(
				{ error: "Token was created but did not include a usable token name." },
				{ status: 502 },
			);
		}

		return NextResponse.json(
			{
				token: token.name,
				model,
				expiresAt: expireTime,
			},
			{
				headers: {
					"Cache-Control": "no-store",
				},
			},
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create a live token.";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
