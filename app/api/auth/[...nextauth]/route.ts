import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

// if (authOptions.providers.length === 0) {
// 	throw new Error("No OAuth providers configured. Set at least one provider env var pair.");
// }

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
