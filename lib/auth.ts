import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import type { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

type LinkedAccount = {
	provider: string;
	providerAccountId: string;
	linkedAt: Date;
};

type AuthUserDocument = {
	_id?: ObjectId;
	email: string;
	name?: string | null;
	image?: string | null;
	linkedAccounts: LinkedAccount[];
	createdAt: Date;
	updatedAt: Date;
	lastLoginAt: Date;
};

const providers: NonNullable<NextAuthOptions["providers"]> = [];

async function linkOAuthAccount(params: {
	email: string;
	name?: string | null;
	image?: string | null;
	provider: string;
	providerAccountId: string;
}) {
	const client = await clientPromise;
	const dbName = process.env.MONGODB_AUTH_DB_NAME || process.env.MONGODB_DB_NAME;
	const db = dbName ? client.db(dbName) : client.db();
	const users = db.collection<AuthUserDocument>(process.env.MONGODB_AUTH_USERS_COLLECTION || "auth_users");

	await users.createIndex({ email: 1 }, { unique: true });

	const now = new Date();
	const email = params.email.toLowerCase();
	const linkedAccount: LinkedAccount = {
		provider: params.provider,
		providerAccountId: params.providerAccountId,
		linkedAt: now,
	};

	const existing = await users.findOne({
		$or: [
			{ email },
			{
				linkedAccounts: {
					$elemMatch: {
						provider: params.provider,
						providerAccountId: params.providerAccountId,
					},
				},
			},
		],
	});

	if (!existing) {
		const created = await users.insertOne({
			email,
			name: params.name,
			image: params.image,
			linkedAccounts: [linkedAccount],
			createdAt: now,
			updatedAt: now,
			lastLoginAt: now,
		});

		return created.insertedId.toString();
	}

	await users.updateOne(
		{ _id: existing._id },
		{
			$set: {
				name: params.name ?? existing.name,
				image: params.image ?? existing.image,
				updatedAt: now,
				lastLoginAt: now,
			},
			$addToSet: {
				linkedAccounts: linkedAccount,
			},
		}
	);

	if (!existing._id) {
		throw new Error("Existing auth user record has no _id.");
	}

	return existing._id.toString();
}

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
	callbacks: {
		async signIn({ user, account }) {
			if (!user.email || !account?.provider || !account.providerAccountId) {
				return false;
			}

			const appUserId = await linkOAuthAccount({
				email: user.email,
				name: user.name,
				image: user.image,
				provider: account.provider,
				providerAccountId: account.providerAccountId,
			});

			(user as { id?: string }).id = appUserId;
			return true;
		},
		async jwt({ token, user }) {
			if (user && "id" in user && user.id) {
				token.userId = user.id;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user && token.userId) {
				session.user.id = String(token.userId);
			}

			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};
