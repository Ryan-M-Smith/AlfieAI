//
// Filename: proxy.ts
// Description: Handle subdomain routing for the app
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import { NextRequest, NextResponse } from "next/server"

export function proxy(req: NextRequest) {
	const hostname = req.headers.get("host") || ""
	const url = req.nextUrl.clone()
	const path = url.pathname

	// Remove the domain part to get the subdomain
	const subdomain = hostname.replace(".alfieai.fyi", "")

	// Allow API and framework internals to resolve normally.
	if (
		path.startsWith("/api/")
		|| path.startsWith("/_next/")
		|| path === "/favicon.ico"
	) {
		return NextResponse.next()
	}

	return NextResponse.rewrite(url)
}
