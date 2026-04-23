import { JSX } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { FiArrowLeft } from "react-icons/fi";

import Navbar from "@/components/navbar";

export const metadata: Metadata = {
	title: "Founder Note",
	description: "A message from the founder of AlfieAI.",
};

export default function FoundersNotePage(): JSX.Element {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(14,116,144,0.14),transparent_38%),radial-gradient(circle_at_85%_75%,rgba(34,197,94,0.12),transparent_35%)]">
			<Navbar />

			<main className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:px-10">
				<Link
					className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition hover:-translate-y-px hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:border-zinc-500"
					href="/about"
				>
					<FiArrowLeft size={14} />
					Back to About
				</Link>

				<section className="mt-8 rounded-3xl border border-zinc-200/70 bg-white/70 p-8 backdrop-blur-lg dark:border-zinc-700 dark:bg-zinc-900/60 sm:p-10">
					<p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Founder&apos;s Note</p>
					<h1 className="text-4xl font-semibold leading-tight sm:text-5xl">A Letter From the Founder</h1>

					<p className="mt-5 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis. Etiam porta sem malesuada magna mollis euismod.
					</p>
					<p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec sed odio dui.
					</p>
					<p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Curabitur blandit tempus porttitor.
					</p>
				</section>
			</main>
		</div>
	);
}
