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
			<section className="rounded-3xl border border-default-200 bg-content1/80 p-5 dark:border-default-700 dark:bg-zinc-950/70 lg:min-h-0 lg:overflow-y-auto">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-600">AlfieAI Reasoning</p>
				<h3 className="mt-2 text-2xl font-semibold text-default-900 dark:text-zinc-50">Why this schedule fits your goals</h3>
				<p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-default-700 dark:text-zinc-300">{reasoning}</p>
				<div className="mt-5 space-y-3">
					{notes.map((note) => (
						<div className="rounded-2xl border border-default-200/80 bg-default-50/80 px-4 py-3 text-sm text-default-900 dark:border-default-700 dark:bg-zinc-900/80 dark:text-zinc-100" key={note}>{note}</div>
					))}
				</div>
			</section>
			<section className="rounded-3xl border border-default-200 bg-content1/80 p-5 dark:border-default-700 dark:bg-zinc-950/70 lg:min-h-0 lg:overflow-y-auto">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-600">Warnings</p>
				<h3 className="mt-2 text-2xl font-semibold text-default-900 dark:text-zinc-50">Review before finalizing</h3>
				<div className="mt-4 space-y-3 text-sm text-default-700 dark:text-zinc-200">
					{warnings.length > 0 ? warnings.map((warning) => (
						<div className="rounded-2xl border border-warning-300/70 bg-warning-50/90 px-4 py-3 text-warning-900 dark:border-warning-400/50 dark:bg-warning-500/20 dark:text-warning-100" key={warning}>{warning}</div>
					)) : (
						<div className="rounded-2xl border border-dashed border-default-300/70 bg-default-50/70 px-4 py-4 text-default-800 dark:border-default-700 dark:bg-zinc-900/65 dark:text-zinc-200">No warnings were raised for this run.</div>
					)}
				</div>
			</section>
		</div>
	);
}