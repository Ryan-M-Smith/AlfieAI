//
// Filename: middleware.ts
// Description: Handle subdomain routing for the app
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
	const hostname = req.headers.get("host") || ""
	const url = req.nextUrl.clone()

	// Remove the domain part to get the subdomain
	const subdomain = hostname.replace(".alfieai.fyi", "")

	if (subdomain === "people") {
		// Rewrite to the people app/page
		url.pathname = `/people${url.pathname}`
	}

	return NextResponse.rewrite(url)
}
