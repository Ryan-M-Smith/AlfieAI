//
// Filename: next.config.ts
// Description: Next.js site configuration
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

module.exports = {
	redirects: async () => ([
		{
			source: "/chat",
			destination: "/",
			permanent: true
		}
	])
};