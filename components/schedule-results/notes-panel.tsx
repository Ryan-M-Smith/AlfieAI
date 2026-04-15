"use client";

import type { JSX } from "react";

interface NotesPanelProps {
	reasoning: string;
	notes: string[];
	warnings: string[];
}

export default function NotesPanel({ reasoning, notes, warnings }: NotesPanelProps): JSX.Element {
	return (
		<div className="grid grid-cols-1 gap-5 lg:h-full lg:min-h-0 lg:grid-cols-[1.1fr_0.9fr] lg:overflow-hidden">
			<section className="rounded-3xl border border-secondary-200/70 bg-secondary-50/45 p-5 dark:border-secondary-900/55 dark:bg-secondary-950/22 lg:min-h-0 lg:overflow-y-auto">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-500 dark:text-secondary-400">AlfieAI Reasoning</p>
				<h3 className="mt-2 text-2xl font-semibold text-white">Why this schedule fits your ask</h3>
				<p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-default-700 dark:text-secondary-100/80">{reasoning}</p>
				<div className="mt-5 space-y-3">
					{notes.map((note) => (
						<div className="rounded-2xl border border-secondary-200/80 bg-white/80 px-4 py-3 text-sm text-secondary-950 dark:border-secondary-900/60 dark:bg-secondary-950/42 dark:text-secondary-50" key={note}>{note}</div>
					))}
				</div>
			</section>
			<section className="rounded-3xl border border-secondary-200/70 bg-secondary-50/45 p-5 dark:border-secondary-900/55 dark:bg-secondary-950/22 lg:min-h-0 lg:overflow-y-auto">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-500 dark:text-secondary-400">Warnings</p>
				<h3 className="mt-2 text-2xl font-semibold text-white">Review before finalizing</h3>
				<div className="mt-4 space-y-3 text-sm text-zinc-200">
					{warnings.length > 0 ? warnings.map((warning) => (
						<div className="rounded-2xl border border-warning-200 bg-warning-50/70 px-4 py-3 text-warning-950 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-100" key={warning}>{warning}</div>
					)) : (
						<div className="rounded-2xl border border-dashed border-secondary-300/70 bg-secondary-50/60 px-4 py-4 text-secondary-950 dark:border-secondary-900/55 dark:bg-secondary-950/24 dark:text-secondary-50">No warnings were raised for this run.</div>
					)}
				</div>
			</section>
		</div>
	);
}