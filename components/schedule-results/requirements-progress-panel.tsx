"use client";

import type { JSX } from "react";

import type { ScheduleRequirementsProgress } from "@/lib/schedule-ai";

interface RequirementsProgressPanelProps {
	progress: ScheduleRequirementsProgress;
	completedEvidence: string[];
	requirementEvidence: string[];
	transferEvidence: string[];
}

export default function RequirementsProgressPanel({
	progress,
	completedEvidence,
	requirementEvidence,
	transferEvidence,
}: RequirementsProgressPanelProps): JSX.Element {
	const completedByTerm = progress.completedByTerm || [];

	return (
		<div className="rounded-3xl border border-default-200 bg-content1/80 p-5 pr-3 dark:border-default-700 dark:bg-zinc-950/70 sm:pr-4 lg:h-full lg:overflow-y-auto">
			<p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-600">Degree Progress</p>
			<h3 className="mt-2 text-2xl font-semibold text-default-900 dark:text-zinc-50">Degree-progress evidence summary</h3>
			<p className="mt-3 max-w-4xl text-sm leading-relaxed text-default-700 dark:text-zinc-300">
				{progress.transcriptDetected
					? `From the uploaded degree-progress document, AlfieAI recognized ${completedEvidence.length} completed course${completedEvidence.length === 1 ? "" : "s"}, ${requirementEvidence.length} requirement marker${requirementEvidence.length === 1 ? "" : "s"}, and ${transferEvidence.length} transfer mention${transferEvidence.length === 1 ? "" : "s"}.`
					: "No structured degree-progress evidence was parsed from the uploaded document for this run."}
			</p>
			<div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
				<div className="rounded-2xl border border-default-200/80 bg-default-50/80 px-4 py-4 dark:border-default-700 dark:bg-zinc-900/80">
					<p className="text-xs uppercase tracking-wide text-default-500 dark:text-zinc-400">Transcript parsed</p>
					<p className="mt-1 text-2xl font-semibold text-default-900 dark:text-zinc-50">{progress.transcriptDetected ? "Yes" : "No"}</p>
				</div>
				<div className="rounded-2xl border border-default-200/80 bg-default-50/80 px-4 py-4 dark:border-default-700 dark:bg-zinc-900/80">
					<p className="text-xs uppercase tracking-wide text-default-500 dark:text-zinc-400">Completed courses</p>
					<p className="mt-1 text-2xl font-semibold text-default-900 dark:text-zinc-50">{completedEvidence.length}</p>
				</div>
				<div className="rounded-2xl border border-default-200/80 bg-default-50/80 px-4 py-4 dark:border-default-700 dark:bg-zinc-900/80">
					<p className="text-xs uppercase tracking-wide text-default-500 dark:text-zinc-400">Requirement markers</p>
					<p className="mt-1 text-2xl font-semibold text-default-900 dark:text-zinc-50">{requirementEvidence.length}</p>
				</div>
				<div className="rounded-2xl border border-default-200/80 bg-default-50/80 px-4 py-4 dark:border-default-700 dark:bg-zinc-900/80">
					<p className="text-xs uppercase tracking-wide text-default-500 dark:text-zinc-400">Transfer mentions</p>
					<p className="mt-1 text-2xl font-semibold text-default-900 dark:text-zinc-50">{transferEvidence.length}</p>
				</div>
			</div>

			{progress.transcriptDetected ? (
				<div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
					<section className="rounded-2xl border border-default-200/80 bg-default-50/80 p-4 dark:border-default-700 dark:bg-zinc-900/80">
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500 dark:text-zinc-400">Completed course codes</p>
						{completedByTerm.length > 0 ? (
							<div className="mt-3 flex flex-wrap gap-2">
								{completedByTerm.map((item) => (
									<span
										className="rounded-full border border-default-200/85 bg-default-100/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-default-700 dark:border-default-600 dark:bg-zinc-800 dark:text-zinc-200"
										key={`${item.term}-${item.count}`}
									>
										{item.term}: {item.count}
									</span>
								))}
							</div>
						) : null}
						<div className="mt-4 flex flex-wrap gap-2 pr-1 lg:max-h-80 lg:overflow-y-auto">
							{completedEvidence.length > 0 ? completedEvidence.map((courseCode) => (
								<span className="rounded-full border border-default-200/85 bg-default-100/90 px-3 py-1.5 text-sm font-medium text-default-900 dark:border-default-600 dark:bg-zinc-800 dark:text-zinc-100" key={courseCode}>{courseCode}</span>
							)) : <p className="text-sm text-default-600 dark:text-zinc-300">No completed course codes were recognized.</p>}
						</div>
					</section>
					<div className="grid grid-cols-1 gap-5">
						<section className="rounded-2xl border border-default-200/80 bg-default-50/80 p-4 dark:border-default-700 dark:bg-zinc-900/80">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500 dark:text-zinc-400">Requirement markers</p>
							<div className="mt-4 space-y-2 pr-1 lg:max-h-44 lg:overflow-y-auto">
								{requirementEvidence.length > 0 ? requirementEvidence.map((marker) => (
									<div className="rounded-xl border border-default-200/85 bg-default-100/85 px-3 py-2 text-sm text-default-900 dark:border-default-600 dark:bg-zinc-800 dark:text-zinc-100" key={marker}>{marker}</div>
								)) : <p className="text-sm text-default-600 dark:text-zinc-300">No requirement markers were recognized.</p>}
							</div>
						</section>
						<section className="rounded-2xl border border-default-200/80 bg-default-50/80 p-4 dark:border-default-700 dark:bg-zinc-900/80">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500 dark:text-zinc-400">Transfer credit mentions</p>
							<div className="mt-4 space-y-2 pr-1 lg:max-h-44 lg:overflow-y-auto">
								{transferEvidence.length > 0 ? transferEvidence.map((transfer) => (
									<div className="rounded-xl border border-default-200/85 bg-default-100/85 px-3 py-2 text-sm text-default-900 dark:border-default-600 dark:bg-zinc-800 dark:text-zinc-100" key={transfer}>{transfer}</div>
								)) : <p className="text-sm text-default-600 dark:text-zinc-300">No transfer-credit mentions were recognized.</p>}
							</div>
						</section>
					</div>
				</div>
			) : (
				<div className="mt-5 rounded-2xl border border-dashed border-default-300/70 bg-default-50/70 px-5 py-5 text-sm text-default-700 dark:border-default-700 dark:bg-zinc-900/65 dark:text-zinc-300">
					Upload a degree-progress PDF to see the specific completed courses, requirement markers, and transfer-credit mentions AlfieAI can ground the schedule against.
				</div>
			)}
		</div>
	);
}