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
	return (
		<div className="rounded-3xl border border-secondary-200/70 bg-secondary-50/45 p-5 pr-3 dark:border-secondary-900/55 dark:bg-secondary-950/22 sm:pr-4 lg:h-full lg:overflow-y-auto">
			<p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-500 dark:text-secondary-400">Requirements Progress</p>
			<h3 className="mt-2 text-2xl font-semibold text-white">Degree-progress evidence summary</h3>
			<p className="mt-3 max-w-4xl text-sm leading-relaxed text-default-700 dark:text-secondary-100/80">
				{progress.transcriptDetected
					? `From the uploaded degree-progress document, AlfieAI recognized ${completedEvidence.length} completed course${completedEvidence.length === 1 ? "" : "s"}, ${requirementEvidence.length} requirement marker${requirementEvidence.length === 1 ? "" : "s"}, and ${transferEvidence.length} transfer mention${transferEvidence.length === 1 ? "" : "s"}.`
					: "No structured degree-progress evidence was parsed from the uploaded document for this run."}
			</p>
			<div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
				<div className="rounded-2xl border border-secondary-200/80 bg-white/80 px-4 py-4 dark:border-secondary-900/60 dark:bg-secondary-950/42">
					<p className="text-xs uppercase tracking-wide text-secondary-500 dark:text-secondary-300">Transcript parsed</p>
					<p className="mt-1 text-2xl font-semibold text-white">{progress.transcriptDetected ? "Yes" : "No"}</p>
				</div>
				<div className="rounded-2xl border border-secondary-200/80 bg-white/80 px-4 py-4 dark:border-secondary-900/60 dark:bg-secondary-950/42">
					<p className="text-xs uppercase tracking-wide text-secondary-500 dark:text-secondary-300">Completed courses</p>
					<p className="mt-1 text-2xl font-semibold text-white">{completedEvidence.length}</p>
				</div>
				<div className="rounded-2xl border border-secondary-200/80 bg-white/80 px-4 py-4 dark:border-secondary-900/60 dark:bg-secondary-950/42">
					<p className="text-xs uppercase tracking-wide text-secondary-500 dark:text-secondary-300">Requirement markers</p>
					<p className="mt-1 text-2xl font-semibold text-white">{requirementEvidence.length}</p>
				</div>
				<div className="rounded-2xl border border-secondary-200/80 bg-white/80 px-4 py-4 dark:border-secondary-900/60 dark:bg-secondary-950/42">
					<p className="text-xs uppercase tracking-wide text-secondary-500 dark:text-secondary-300">Transfer mentions</p>
					<p className="mt-1 text-2xl font-semibold text-white">{transferEvidence.length}</p>
				</div>
			</div>

			{progress.transcriptDetected ? (
				<div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
					<section className="rounded-2xl border border-secondary-200/80 bg-white/80 p-4 dark:border-secondary-900/60 dark:bg-secondary-950/42">
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-500 dark:text-secondary-300">Completed course codes</p>
						<div className="mt-4 flex flex-wrap gap-2 pr-1 lg:max-h-80 lg:overflow-y-auto">
							{completedEvidence.length > 0 ? completedEvidence.map((courseCode) => (
								<span className="rounded-full border border-secondary-200/85 bg-secondary-50/90 px-3 py-1.5 text-sm font-medium text-secondary-900 dark:border-secondary-800/70 dark:bg-secondary-950/58 dark:text-secondary-50" key={courseCode}>{courseCode}</span>
							)) : <p className="text-sm text-default-600 dark:text-secondary-100/75">No completed course codes were recognized.</p>}
						</div>
					</section>
					<div className="grid grid-cols-1 gap-5">
						<section className="rounded-2xl border border-secondary-200/80 bg-white/80 p-4 dark:border-secondary-900/60 dark:bg-secondary-950/42">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-500 dark:text-secondary-300">Requirement markers</p>
							<div className="mt-4 space-y-2 pr-1 lg:max-h-44 lg:overflow-y-auto">
								{requirementEvidence.length > 0 ? requirementEvidence.map((marker) => (
									<div className="rounded-xl border border-secondary-200/85 bg-secondary-50/85 px-3 py-2 text-sm text-secondary-950 dark:border-secondary-800/70 dark:bg-secondary-950/58 dark:text-secondary-50" key={marker}>{marker}</div>
								)) : <p className="text-sm text-default-600 dark:text-secondary-100/75">No requirement markers were recognized.</p>}
							</div>
						</section>
						<section className="rounded-2xl border border-secondary-200/80 bg-white/80 p-4 dark:border-secondary-900/60 dark:bg-secondary-950/42">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-500 dark:text-secondary-300">Transfer credit mentions</p>
							<div className="mt-4 space-y-2 pr-1 lg:max-h-44 lg:overflow-y-auto">
								{transferEvidence.length > 0 ? transferEvidence.map((transfer) => (
									<div className="rounded-xl border border-secondary-200/85 bg-secondary-50/85 px-3 py-2 text-sm text-secondary-950 dark:border-secondary-800/70 dark:bg-secondary-950/58 dark:text-secondary-50" key={transfer}>{transfer}</div>
								)) : <p className="text-sm text-default-600 dark:text-secondary-100/75">No transfer-credit mentions were recognized.</p>}
							</div>
						</section>
					</div>
				</div>
			) : (
				<div className="mt-5 rounded-2xl border border-dashed border-secondary-300/70 bg-secondary-50/60 px-5 py-5 text-sm text-default-700 dark:border-secondary-900/55 dark:bg-secondary-950/24 dark:text-secondary-100/75">
					Upload a degree-progress PDF to see the specific completed courses, requirement markers, and transfer-credit mentions AlfieAI can ground the schedule against.
				</div>
			)}
		</div>
	);
}