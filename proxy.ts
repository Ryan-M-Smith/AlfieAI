//
// Filename: proxy.ts
// Description: Site middleware
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

import { NextRequest, NextResponse } from "next/server"

export function proxy(req: NextRequest) {
	const hostname = req.headers.get("host") || ""
	const url = req.nextUrl.clone()
	const path = url.pathname
	const subdomain = hostname.replace(".alfieai.fyi", "").split(":")[0]

	// Allow API and framework internals to resolve normally.
	if (path.startsWith("/api/") || path.startsWith("/_next/") || path === "/favicon.ico") {
		return NextResponse.next()
	}

	if (subdomain === "people" && !path.startsWith("/people")) {
		url.pathname = `/people${path}`
	}

	return NextResponse.rewrite(url)
}
