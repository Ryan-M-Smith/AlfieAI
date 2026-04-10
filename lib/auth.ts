import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	providers.push(
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		})
	);
}

if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID) {
	providers.push(
		AzureADProvider({
			clientId: process.env.AZURE_AD_CLIENT_ID,
			clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
			tenantId: process.env.AZURE_AD_TENANT_ID,
		})
	);
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
	providers.push(
		FacebookProvider({
			clientId: process.env.FACEBOOK_CLIENT_ID,
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
		})
	);
}

export const authOptions: NextAuthOptions = {
	providers,
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};
