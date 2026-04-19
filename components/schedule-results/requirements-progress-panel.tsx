"use client";

import type { JSX } from "react";
import { useState } from "react";
import { FiAward, FiBook, FiCheckCircle, FiChevronDown, FiChevronRight, FiCircle, FiClock, FiHash, FiTrendingUp, FiX } from "react-icons/fi";
import { LuArrowUpRight } from "react-icons/lu";

import type { GenEdCategoryStatus, ScheduleRequirementsProgress } from "@/lib/schedule-ai";
import { FIXED_REQUIREMENT_ORDER, CATEGORY_LABELS, WK_CATEGORIES, SW_CATEGORIES } from "@/lib/gen-ed-rules";

interface RequirementsProgressPanelProps {
	progress: ScheduleRequirementsProgress;
}

interface StatCardProps {
	label: string;
	value: string | number;
	sub?: string;
	icon: JSX.Element;
	accent: string;
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps): JSX.Element {
	return (
		<div className={`flex items-start gap-3 rounded-2xl border px-4 py-4 ${accent}`}>
			<div className="mt-0.5 shrink-0 text-xl opacity-80">{icon}</div>
			<div className="min-w-0">
				<p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">{label}</p>
				<p className="mt-0.5 text-2xl font-semibold leading-none">{value}</p>
				{sub && <p className="mt-1 text-[11px] opacity-55">{sub}</p>}
			</div>
		</div>
	);
}

type GenEdDetailModalProps = {
	category: GenEdCategoryStatus;
	onClose: () => void;
};

function GenEdDetailModal({ category, onClose }: GenEdDetailModalProps): JSX.Element {
	const isEmpty = category.satisfiedBy.length === 0 && category.plannedBy.length === 0;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="relative w-full max-w-md overflow-hidden rounded-3xl border border-default-200 bg-content1 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className={`flex items-start justify-between gap-3 border-b border-default-200/70 px-5 py-4 dark:border-zinc-800 ${
					category.status === "completed"
						? "bg-emerald-50/60 dark:bg-emerald-950/40"
						: category.status === "waived"
							? "bg-blue-50/60 dark:bg-blue-950/40"
							: category.status === "in-progress"
								? "bg-amber-50/60 dark:bg-amber-950/30"
								: "bg-danger-50/60 dark:bg-danger-950/30"
				}`}>
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-default-500 dark:text-zinc-400">Gen-ed Category</p>
						<h3 className="mt-0.5 text-xl font-semibold text-default-900 dark:text-zinc-50">{category.label}</h3>
						<span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
							category.status === "completed"
								? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
							: category.status === "waived"
								? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
								: category.status === "in-progress"
									? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
									: "bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-300"
					}`}>
						{category.status === "completed" ? (
							<><FiCheckCircle size={10} /> Completed</>
						) : category.status === "waived" ? (
							<><FiCheckCircle size={10} /> Waived</>
							) : category.status === "in-progress" ? (
								<><FiClock size={10} /> In progress</>
							) : (
								<><FiCircle size={10} /> Not yet satisfied</>
							)}
						</span>
					</div>
					<button
						className="cursor-pointer rounded-full p-1.5 text-default-400 transition hover:bg-default-100 hover:text-default-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
						onClick={onClose}
						type="button"
					>
						<FiX size={18} />
					</button>
				</div>

				<div className="flex flex-col gap-4 p-5">
					{/* Waived reason */}
					{category.status === "waived" && category.waivedBy && (
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Waived by</p>
							<div className="mt-2">
								{category.waivedBy === "poe" ? (
									<span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
										<FiAward size={11} />
										Designated POE waiver
									</span>
								) : (
									<span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
										<FiCheckCircle size={11} />
										{category.waivedBy} (transfer credit)
									</span>
								)}
							</div>
						</div>
					)}

					{/* Completed courses */}
					{category.satisfiedBy.length > 0 && (
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Satisfied by</p>
							<div className="mt-2 flex flex-wrap gap-2">
								{category.satisfiedBy.map((code) => (
									<span
										className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
										key={code}
									>
										<FiCheckCircle size={11} />
										{code}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Planned courses */}
					{category.plannedBy.length > 0 && (
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">Planned / in-progress</p>
							<div className="mt-2 flex flex-wrap gap-2">
								{category.plannedBy.map((code) => (
									<span
										className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
										key={code}
									>
										<FiClock size={11} />
										{code}
									</span>
								))}
							</div>
						</div>
					)}

					{isEmpty && (
						<p className="text-sm text-default-500 dark:text-zinc-400">
							No completed or planned courses were matched to this category from your transcript.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

const CATEGORY_SECTIONS: Array<{ title: string; subtitle: string; ids: readonly string[] }> = [
	{ title: "Core Requirements", subtitle: "First-year experience and program milestones", ids: FIXED_REQUIREMENT_ORDER },
	{ title: "Ways of Knowing", subtitle: "5 required categories — one each", ids: WK_CATEGORIES },
	{ title: "Self and the World", subtitle: "4 required categories — one each (Global Engagement requires two)", ids: SW_CATEGORIES },
];

function GenEdSection({
	title,
	subtitle,
	categories,
	onSelect,
}: {
	title: string;
	subtitle: string;
	categories: GenEdCategoryStatus[];
	onSelect: (cat: GenEdCategoryStatus) => void;
}): JSX.Element {
	return (
		<section>
			<div className="mb-3">
				<h4 className="text-sm font-semibold text-default-800 dark:text-zinc-200">{title}</h4>
				<p className="text-[11px] text-default-500 dark:text-zinc-500">{subtitle}</p>
			</div>
			<div className="flex flex-wrap gap-2">
				{categories.map((cat) => (
					<button
						className={`group flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition hover:scale-[1.02] hover:shadow-md ${
							cat.status === "completed"
								? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
								: cat.status === "waived"
									? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200"
									: cat.status === "in-progress"
										? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
										: "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-300"
						}`}
						key={cat.categoryId}
						onClick={() => onSelect(cat)}
						type="button"
					>
						{cat.status === "completed" ? (
							<FiCheckCircle size={13} className="shrink-0" />
						) : cat.status === "waived" ? (
							<FiCheckCircle size={13} className="shrink-0" />
						) : cat.status === "in-progress" ? (
							<FiClock size={13} className="shrink-0" />
						) : (
							<FiCircle size={13} className="shrink-0 opacity-60" />
						)}
						{cat.label}
						<LuArrowUpRight size={12} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
					</button>
				))}
			</div>
		</section>
	);
}

export default function RequirementsProgressPanel({
	progress,
}: RequirementsProgressPanelProps): JSX.Element {
	const [selectedCategory, setSelectedCategory] = useState<GenEdCategoryStatus | null>(null);

	const genEdMap = new Map(progress.genEdStatus.map((s) => [s.categoryId, s]));
	const getGenEdCategories = (ids: readonly string[]) =>
		ids.map((id) => genEdMap.get(id)).filter((s): s is GenEdCategoryStatus => Boolean(s));

	const completedCount = progress.completedCourses.length;
	const [definitelyWant, setDefinitelyWant] = useState<Record<string, boolean>>(() => ({}));
	const plannedCount = progress.plannedCourses.length;
	const transferCount = progress.transferCourses.length;
	const gpaDisplay = progress.gpa !== null ? progress.gpa.toFixed(2) : "—";
	const completedCreditsDisplay = progress.completedCredits > 0 ? String(progress.completedCredits) : "—";
	const transferCreditsDisplay = progress.transferCredits > 0
		? String(progress.transferCredits)
		: transferCount > 0
		? `${transferCount} record${transferCount === 1 ? "" : "s"}`
		: "—";
	const transferSub = progress.transferCredits > 0
		? (transferCount > 0 ? `${transferCount} record${transferCount === 1 ? "" : "s"}` : undefined)
		: undefined;

	// Group completed courses by term for the history list
	const completedByTerm = new Map<string, typeof progress.completedCourses>();
	for (const course of progress.completedCourses) {
		const list = completedByTerm.get(course.term) || [];
		list.push(course);
		completedByTerm.set(course.term, list);
	}
	const sortedTerms = [...completedByTerm.keys()].sort((a, b) => b.localeCompare(a));
	const [collapsedTerms, setCollapsedTerms] = useState<Set<string>>(() => new Set(sortedTerms.slice(1)));

	const toggleTerm = (term: string) => {
		setCollapsedTerms((prev) => {
			const next = new Set(prev);
			if (next.has(term)) next.delete(term); else next.add(term);
			return next;
		});
	};

	return (
		<div className="rounded-3xl border border-default-200 bg-content1/80 p-5 pr-3 dark:border-default-700 dark:bg-zinc-950/70 sm:pr-4 lg:h-full lg:overflow-y-auto">
			<p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-600">Degree Progress</p>
			<h3 className="mt-2 text-2xl font-semibold text-default-900 dark:text-zinc-50">Academic summary</h3>
			<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
				<p className="text-sm text-default-600 dark:text-zinc-400">
					{progress.transcriptDetected
						? "Parsed from your Self-Service Degree Progress PDF. Click any gen-ed category for details."
						: "Upload a Degree Progress PDF to see your academic history, gen-ed status, and completion details."}
				</p>
				{progress.studentId && (
					<span className="inline-flex items-center gap-1 rounded-full border border-default-200 bg-default-100/80 px-2.5 py-0.5 text-[11px] font-medium text-default-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
						<FiHash size={10} />{progress.studentId}
					</span>
				)}
			</div>

			{/* ── Stats row ─────────────────────────────── */}
			<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
				<StatCard
					accent="border-default-200 bg-default-50 text-default-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
					icon={<FiBook />}
					label="Courses completed"
					value={completedCount || "—"}
				/>
				<StatCard
					accent="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
					icon={<FiCheckCircle />}
					label="Earned credits"
					value={completedCreditsDisplay}
				/>
				<StatCard
					accent="border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100"
					icon={<LuArrowUpRight />}
					label="Transfer credits"
					value={transferCreditsDisplay}
					sub={transferSub}
				/>
				<StatCard
					accent="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
					icon={<FiClock />}
					label="Planned courses"
					value={plannedCount || "—"}
				/>
				<StatCard
					accent="border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100"
					icon={<FiTrendingUp />}
					label="GPA"
					value={gpaDisplay}
					sub="out of 4.00"
				/>
				<StatCard
					accent="border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-100"
					icon={<FiAward />}
					label="Degree program"
					value={progress.degreeProgram || "—"}
				/>
			</div>

			{progress.transcriptDetected ? (
				<>
					{/* ── Gen-ed status grid ─────────────────── */}
					<div className="mt-6 flex flex-col gap-6 rounded-2xl border border-default-200/80 bg-default-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
						<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-default-500 dark:text-zinc-500">
							Gen-ed &amp; Core Requirements — click any badge for details
						</p>
						{CATEGORY_SECTIONS.map((section) => (
							<GenEdSection
								categories={getGenEdCategories(section.ids)}
								key={section.title}
								onSelect={setSelectedCategory}
								subtitle={section.subtitle}
								title={section.title}
							/>
						))}
					</div>

					{/* ── Legend ───────────────────────────────── */}
					<div className="mt-3 flex flex-wrap items-center gap-4 px-1 text-[11px] text-default-500 dark:text-zinc-500">
						<span className="flex items-center gap-1.5"><FiCheckCircle size={11} className="text-emerald-500" /> Completed</span>
						<span className="flex items-center gap-1.5"><FiCheckCircle size={11} className="text-blue-500" /> Waived</span>
						<span className="flex items-center gap-1.5"><FiClock size={11} className="text-amber-500" /> In progress / planned</span>
						<span className="flex items-center gap-1.5"><FiCircle size={11} className="text-danger-400" /> Not yet satisfied</span>
					</div>

					{/* ── POE requirement progress ─────────────── */}
					{progress.poeProgress && progress.poeProgress.length > 0 && (
						<div className="mt-6 flex flex-col gap-5">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-default-500 dark:text-zinc-500">Program of Emphasis requirements</p>
							{progress.poeProgress.map((poe) => (
								<div
									className="rounded-2xl border border-default-200/80 bg-default-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
									key={poe.poeName}
								>
									<div className="mb-3 flex items-center justify-between gap-2">
										<div>
											<span className="text-sm font-semibold text-default-800 dark:text-zinc-200">{poe.poeName}</span>
											{poe.isPrimary && <span className="ml-2 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-600 dark:bg-secondary-500/20 dark:text-secondary-500">
												POE
											</span>}
										</div>
										<span className="text-[11px] text-default-500 dark:text-zinc-500">
											Core {Math.round(poe.coreCompletionRatio * 100)}%
										</span>
									</div>
									{/* Progress bar */}
									<div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-default-200 dark:bg-zinc-700">
										<div
											className="h-full rounded-full bg-secondary-400 transition-all duration-500 dark:bg-secondary-500"
											style={{ width: `${Math.round(poe.coreCompletionRatio * 100)}%` }}
										/>
									</div>
									<div className="flex flex-col gap-2">
										{poe.groups.map((group) => (
											<div
												className={`rounded-xl border px-3 py-2.5 text-sm ${
													group.status === "complete"
														? "border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/8"
														: group.status === "in_progress"
															? "border-amber-200/80 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/8"
															: "border-default-200/60 bg-default-50/60 dark:border-zinc-800 dark:bg-zinc-900/40"
												}`}
												key={group.id}
											>
												<div className="flex items-center justify-between gap-2">
													<div className="flex items-center gap-2 min-w-0">
														{group.status === "complete" ? (
															<FiCheckCircle size={12} className="shrink-0 text-emerald-500" />
														) : group.status === "in_progress" ? (
															<FiClock size={12} className="shrink-0 text-amber-500" />
														) : (
															<FiCircle size={12} className="shrink-0 text-default-400 dark:text-zinc-600" />
														)}
														<span className={`truncate font-medium ${
															group.status === "complete"
																? "text-emerald-800 dark:text-emerald-300"
																: group.status === "in_progress"
																	? "text-amber-800 dark:text-amber-300"
																	: "text-default-700 dark:text-zinc-400"
														}`}>{group.label}</span>
													</div>
												<span className="shrink-0 text-[11px] text-default-500 dark:text-zinc-500">
														{group.countUnit === "credit"
															? `${group.completedCount} / ${group.requiredCount} cr`
															: `${group.completedCount} / ${group.requiredCount} course${group.requiredCount === 1 ? "" : "s"}${group.completedCreditCount > 0 ? ` (${group.completedCreditCount} cr)` : ""}`
														}
													</span>
												</div>
												{group.remainingCourseCodes.length > 0 && group.status !== "complete" && (
													<div className="mt-1.5 flex flex-wrap gap-1 pl-5">
														{group.remainingCourseCodes.slice(0, 8).map((code) => (
															<span
																className="rounded-full border border-default-200 bg-default-100/80 px-2 py-0.5 text-[10px] font-mono font-medium text-default-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
																key={code}
															>{code}</span>
														))}
														{group.remainingCourseCodes.length > 8 && (
															<span className="text-[10px] text-default-400 dark:text-zinc-600">+{group.remainingCourseCodes.length - 8} more</span>
														)}
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}

					{/* ── Completed course history ──────────────── */}
					{sortedTerms.length > 0 && (
						<div className="mt-6">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-default-500 dark:text-zinc-500">Course history by term</p>
						<div className="mt-3 flex flex-col gap-1">
							{sortedTerms.map((term) => {
								const isCollapsed = collapsedTerms.has(term);
								const courses = completedByTerm.get(term) || [];
								return (
									<div key={term}>
										<button
											className="flex w-full items-center gap-1.5 py-1.5 text-left"
											onClick={() => toggleTerm(term)}
											type="button"
										>
											{isCollapsed
												? <FiChevronRight size={12} className="shrink-0 text-default-400 dark:text-zinc-500" />
												: <FiChevronDown size={12} className="shrink-0 text-default-400 dark:text-zinc-500" />
											}
											<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-500 dark:text-secondary-400">{term}</span>
											<span className="text-[11px] text-default-400 dark:text-zinc-600">· {courses.length}</span>
										</button>
										{!isCollapsed && (
											<div className="mb-2 flex flex-col gap-1">
												{courses.map((course) => (
													<div
														className="flex items-baseline justify-between gap-3 rounded-xl border border-default-200/80 bg-default-50/80 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/80"
														key={`${course.courseCode}-${course.term}`}
													>
														<div className="flex items-baseline gap-2 min-w-0">
															<span className="shrink-0 font-mono text-[12px] font-semibold text-default-700 dark:text-zinc-300">{course.courseCode}</span>
															<span className="truncate text-default-600 dark:text-zinc-400">{course.title}</span>
														</div>
														<div className="flex shrink-0 items-center gap-3 text-[11px]">
															{course.credits > 0 && (
																<span className="text-default-500 dark:text-zinc-500">{course.credits} cr</span>
															)}
															{course.grade && (
																<span className={`font-semibold ${
																	course.grade.startsWith("A") ? "text-emerald-600 dark:text-emerald-400" :
																	course.grade.startsWith("B") ? "text-sky-600 dark:text-sky-400" :
																	course.grade.startsWith("C") ? "text-amber-600 dark:text-amber-400" :
																	course.grade === "F" ? "text-danger-500" :
																	"text-default-500 dark:text-zinc-500"
																}`}>{course.grade}</span>
															)}
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}

					{/* ── Planned courses ──────────────────────── */}
					   {progress.plannedCourses.length > 0 && (
						   <div className="mt-6">
							   <p className="text-xs font-semibold uppercase tracking-[0.2em] text-default-500 dark:text-zinc-500">In-progress / planned</p>
							   <div className="mt-3 flex flex-col gap-1">
								   {progress.plannedCourses.map((course) => (
									   <div
										   className="flex items-baseline justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2 text-sm dark:border-amber-500/20 dark:bg-amber-500/8"
										   key={`${course.courseCode}-${course.term}`}
									   >
										   <div className="flex items-baseline gap-2 min-w-0">
											   <FiClock size={12} className="mt-0.5 shrink-0 text-amber-500" />
											   <span className="shrink-0 font-mono text-[12px] font-semibold text-amber-800 dark:text-amber-300">{course.courseCode}</span>
											   <span className="truncate text-amber-700 dark:text-amber-400">{course.title}</span>
										   </div>
										   <span className="shrink-0 text-[11px] text-amber-600 dark:text-amber-500">{course.term}</span>
									   </div>
								   ))}
							   </div>
						   </div>
					   )}

					{/* ── Transfer records ──────────────────────── */}
					{progress.transferCourses.length > 0 && (
						<div className="mt-6">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-default-500 dark:text-zinc-500">Transfer / AP / test credit</p>
							<div className="mt-3 flex flex-col gap-1">
								{progress.transferCourses.map((course, i) => (
									<div
										className="flex items-baseline justify-between gap-3 rounded-xl border border-sky-200/70 bg-sky-50/60 px-3 py-2 text-sm dark:border-sky-500/20 dark:bg-sky-500/8"
										key={`${course.courseCode}-${i}`}
									>
										<div className="flex items-baseline gap-2 min-w-0">
											<LuArrowUpRight size={12} className="mt-0.5 shrink-0 text-sky-500" />
											<span className="shrink-0 font-mono text-[12px] font-semibold text-sky-800 dark:text-sky-300">{course.courseCode}</span>
											<span className="truncate text-sky-700 dark:text-sky-400">{course.title}</span>
										</div>
										<div className="flex shrink-0 items-center gap-2 text-[11px]">
											{course.credits > 0 && <span className="text-sky-600 dark:text-sky-500">{course.credits} cr</span>}
											<span className="text-sky-500 dark:text-sky-600">{course.term}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			) : (
				<div className="mt-5 rounded-2xl border border-dashed border-default-300/70 bg-default-50/70 px-5 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900/65">
					<FiBook size={28} className="mx-auto mb-3 text-default-300 dark:text-zinc-600" />
					<p className="text-sm font-medium text-default-700 dark:text-zinc-300">No transcript uploaded</p>
					<p className="mt-1 text-xs text-default-500 dark:text-zinc-500">
						Upload a Self-Service Degree Progress PDF to see completed courses, gen-ed status, GPA, and your full academic history here.
					</p>
				</div>
			)}

			{/* ── Gen-ed detail modal ────────────────────── */}
			{selectedCategory && (
				<GenEdDetailModal
					category={selectedCategory}
					onClose={() => setSelectedCategory(null)}
				/>
			)}
		</div>
	);
}

