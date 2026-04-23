"use client";

import {
	Autocomplete,
	AutocompleteItem,
	Button,
	Input,
	Link,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	Switch,
	Textarea,
	useDisclosure,
} from "@heroui/react";
import { ChangeEvent, Key, use, useEffect, useMemo, useRef, useState } from "react";
import { GrSchedules } from "react-icons/gr";
import { LuCircleHelp, LuFileUp, LuPlus, LuSearch, LuSparkles, LuTrash2, LuX } from "react-icons/lu";

import ScheduleBuilderResult from "@/components/schedule-builder-result";

import type { CreditLoadProfile, ScheduleGenerationResult, SchedulingMode } from "@/lib/schedule-ai";

interface PlannerOptionsResponse {
	terms: string[];
	poes: string[];
	warnings?: string[];
}

interface EmphasisField {
	id: string;
	selection: string;
	customValue: string;
}

interface PlannerFormState {
	term: string;
	studentPoes: EmphasisField[];
	guidance: string;
	creditLoadProfile: CreditLoadProfile;
	customTargetCredits: string;
	openSeatsOnly: boolean;
	secondaryEmphases: EmphasisField[];
	schedulingMode: SchedulingMode;
	/** When true, the student has pre-registered courses they want locked in */
	useUserChosenMode: boolean;
	/** When true, the student wants specific courses always included */
	useAlwaysInclude: boolean;
	/** Course codes the student always wants in their schedule */
	alwaysIncludeCourses: string[];
}

interface ErrorResponse {
	error?: string;
}

const OTHER_OPTION_KEY = "__other__";
const schedulingModeOptions: Array<{ key: SchedulingMode; label: string; description: string }> = [
	{ key: "balanced", label: "Balanced", description: "Mix of core requirements, gen-eds, and electives" },
	{ key: "core-focused", label: "Core-focused", description: "Prioritize major/POE core requirements" },
	{ key: "gen-ed-push", label: "Gen-ed push", description: "Fill outstanding gen-ed categories first" },
	{ key: "fun", label: "Light & fun", description: "Enjoyable, lower-stakes schedule" },
	{ key: "ai-choice", label: "AI's choice", description: "Let AlfieAI decide what's optimal" },
];

const creditLoadOptions: Array<{ key: CreditLoadProfile; label: string; description: string }> = [
	{ key: "part-time", label: "Part-time", description: "Below 12 credits" },
	{ key: "light", label: "Light", description: "12-13 credits" },
	{ key: "moderate", label: "Moderate", description: "14-16 credits" },
	{ key: "heavy", label: "Heavy", description: "17+ credits" },
	{ key: "custom", label: "Custom", description: "Pick your own target" },
];

function newEmphasisField(prefix: "primary" | "secondary"): EmphasisField {
	const random = Math.random().toString(36).slice(2, 9);
	return {
		id: `${prefix}-${Date.now()}-${random}`,
		selection: "",
		customValue: "",
	};
}

/**
 * Returns the best default term from the available list.
 * Picks the next upcoming term based on approximate term start months:
 *   Spring → January (month 1)
 *   Summer → June (month 6)
 *   Fall   → August (month 8)
 * Finds the first term that hasn't started yet, falling back to the first in the list.
 */
function getDefaultTerm(terms: string[]): string {
	if (terms.length === 0) return "";
	const now = new Date();
	const nowYearMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

	function termStartMonth(term: string): number {
		const lower = term.toLowerCase();
		if (lower.includes("spring")) return 1;
		if (lower.includes("summer")) return 6;
		if (lower.includes("fall")) return 8;
		return 1;
	}
	function termYear(term: string): number {
		const match = term.match(/(19|20)\d{2}/);
		return match ? Number(match[0]) : 0;
	}
	function termYearMonth(term: string): number {
		return termYear(term) * 100 + termStartMonth(term);
	}

	// Among all upcoming non-summer terms, pick the chronologically closest
	const upcoming = terms
		.filter((t) => termYearMonth(t) >= nowYearMonth && !t.toLowerCase().includes("summer"))
		.sort((a, b) => termYearMonth(a) - termYearMonth(b));

	return upcoming[0] ?? terms[0];
}

const defaultForm: PlannerFormState = {
	term: "",
	studentPoes: [],
	guidance: "",
	creditLoadProfile: "moderate",
	customTargetCredits: "15",
	openSeatsOnly: false,
	secondaryEmphases: [],
	schedulingMode: "balanced",
	useUserChosenMode: false,
	useAlwaysInclude: false,
	alwaysIncludeCourses: [],
};

function resolveChoice(selection: string, customValue: string): string {
	if (selection === OTHER_OPTION_KEY) {
		return customValue.trim();
	}

	return selection.trim();
}

interface AlwaysIncludeResult {
	code: string;
	title: string;
}

export default function ScheduleBuilder() {
	const [form, setForm] = useState<PlannerFormState>(defaultForm);
	const [terms, setTerms] = useState<string[]>([]);
	const [poes, setPoes] = useState<string[]>([]);
	const [loadingOptions, setLoadingOptions] = useState(true);
	const [loadingPlan, setLoadingPlan] = useState(false);
	const [loadingGuidance, setLoadingGuidance] = useState(false);
	const [error, setError] = useState("");
	const [optionsWarning, setOptionsWarning] = useState("");
	const [result, setResult] = useState<ScheduleGenerationResult | null>(null);
	const [degreeProgressFile, setDegreeProgressFile] = useState<File | null>(null);
	const [activeView, setActiveView] = useState<"form" | "result">("form");
	const [alwaysIncludeQuery, setAlwaysIncludeQuery] = useState("");
	const [alwaysIncludeResults, setAlwaysIncludeResults] = useState<AlwaysIncludeResult[]>([]);
	const [alwaysIncludeSearching, setAlwaysIncludeSearching] = useState(false);
	const guidanceAbortRef = useRef<AbortController | null>(null);
	const alwaysIncludeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const alwaysIncludeContainerRef = useRef<HTMLDivElement>(null);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const poeSelectOptions = useMemo(
		() => [
			...poes.map((poe) => ({ key: poe, label: poe })),
			{ key: OTHER_OPTION_KEY, label: "Other (custom)" },
		],
		[poes],
	);

	const resolvedPrimaryPoes = useMemo(
		() => Array.from(new Set(
			form.studentPoes
				.map((item) => resolveChoice(item.selection, item.customValue))
				.filter(Boolean),
		)),
		[form.studentPoes],
	);
	const resolvedPoe = resolvedPrimaryPoes[0] || "";
	const resolvedSecondaryEmphases = useMemo(
		() => form.secondaryEmphases
			.map((item) => resolveChoice(item.selection, item.customValue))
			.filter(Boolean),
		[form.secondaryEmphases],
	);
	const resolvedTargetCredits = useMemo(() => {
		if (form.creditLoadProfile === "part-time") {
			return 10;
		}
		if (form.creditLoadProfile === "light") {
			return 12;
		}
		if (form.creditLoadProfile === "moderate") {
			return 15;
		}
		if (form.creditLoadProfile === "heavy") {
			return 17;
		}

		const parsed = Number(form.customTargetCredits.trim());
		if (!Number.isFinite(parsed)) {
			return 15;
		}

		return Math.min(24, Math.max(1, Math.round(parsed)));
	}, [form.creditLoadProfile, form.customTargetCredits]);

	useEffect(() => {
		let cancelled = false;

		async function loadPlannerOptions() {
			setLoadingOptions(true);

			try {
				const response = await fetch("/api/courses/planner-options", { cache: "no-store" });
				if (!response.ok) {
					throw new Error("Failed to load planner options.");
				}

				const data = (await response.json()) as PlannerOptionsResponse;
				if (cancelled) {
					return;
				}

				const loadedTerms = data.terms || [];
				const loadedPoes = data.poes || [];

				setTerms(loadedTerms);
				setPoes(loadedPoes);
				setOptionsWarning((data.warnings || []).join(" "));
				setForm((previous) => ({
					...previous,
					term: loadedTerms.includes(previous.term) ? previous.term : getDefaultTerm(loadedTerms),
					studentPoes: previous.studentPoes,
				}));
			}
			catch {
				if (!cancelled) {
					setOptionsWarning("Could not load planner terms from the database. Term selection is currently unavailable.");
				}
			}
			finally {
				if (!cancelled) {
					setLoadingOptions(false);
				}
			}
		}

		void loadPlannerOptions();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		return () => {
			guidanceAbortRef.current?.abort();
		};
	}, []);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (alwaysIncludeContainerRef.current && !alwaysIncludeContainerRef.current.contains(event.target as Node)) {
				setAlwaysIncludeResults([]);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function updateForm<K extends keyof PlannerFormState>(field: K, value: PlannerFormState[K]) {
		setForm((previous) => ({ ...previous, [field]: value }));
	}

	function searchAlwaysIncludeCourses(query: string) {
		if (alwaysIncludeTimerRef.current) {
			clearTimeout(alwaysIncludeTimerRef.current);
		}

		// Use a shorter debounce for empty query (browse all) so the list
		// appears quickly when the user first focuses the input.
		const debounceMs = query.trim() ? 300 : 100;

		alwaysIncludeTimerRef.current = setTimeout(() => {
			void (async () => {
				setAlwaysIncludeSearching(true);
				try {
					const response = await fetch("/api/courses/catalog", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							query: query.trim(),
							page: 1,
							pageSize: 50,
							filters: form.term ? { term: form.term } : {},
						}),
					});

					if (!response.ok) {
						return;
					}

					const data = (await response.json()) as { results: Array<{ course_code: string; title: string }> };
					const seen = new Set(form.alwaysIncludeCourses);
					setAlwaysIncludeResults(
						(data.results || []).filter((c) => !seen.has(c.course_code)).map((c) => ({ code: c.course_code, title: c.title })),
					);
				}
				catch {
					// silently ignore search errors
				}
				finally {
					setAlwaysIncludeSearching(false);
				}
			})();
		}, debounceMs);
	}

	function addAlwaysIncludeCourse(code: string) {
		if (!form.alwaysIncludeCourses.includes(code)) {
			updateForm("alwaysIncludeCourses", [...form.alwaysIncludeCourses, code]);
		}

		setAlwaysIncludeQuery("");
		setAlwaysIncludeResults([]);
	}

	function removeAlwaysIncludeCourse(code: string) {
		updateForm("alwaysIncludeCourses", form.alwaysIncludeCourses.filter((c) => c !== code));
	}

	function handleDegreeProgressChange(event: ChangeEvent<HTMLInputElement>) {
		const nextFile = event.target.files?.[0] || null;
		setDegreeProgressFile(nextFile);
	}

	function addPrimaryPoe() {
		setForm((previous) => ({
			...previous,
			studentPoes: [...previous.studentPoes, newEmphasisField("primary")],
		}));
	}

	function removePrimaryPoe(id: string) {
		setForm((previous) => {
			const remaining = previous.studentPoes.filter((item) => item.id !== id);
			return {
				...previous,
				studentPoes: remaining,
			};
		});
	}

	function updatePrimaryPoe(id: string, next: Partial<EmphasisField>) {
		setForm((previous) => ({
			...previous,
			studentPoes: previous.studentPoes.map((item) => (
				item.id === id ? { ...item, ...next } : item
			)),
		}));
	}

	function addSecondaryEmphasis() {
		setForm((previous) => ({
			...previous,
			secondaryEmphases: [...previous.secondaryEmphases, newEmphasisField("secondary")],
		}));
	}

	function removeSecondaryEmphasis(id: string) {
		setForm((previous) => ({
			...previous,
			secondaryEmphases: previous.secondaryEmphases.filter((item) => item.id !== id),
		}));
	}

	function updateSecondaryEmphasis(id: string, next: Partial<EmphasisField>) {
		setForm((previous) => ({
			...previous,
			secondaryEmphases: previous.secondaryEmphases.map((item) => (
				item.id === id ? { ...item, ...next } : item
			)),
		}));
	}

	async function generateGuidanceDraft() {
		guidanceAbortRef.current?.abort();
		const abortController = new AbortController();
		guidanceAbortRef.current = abortController;

		setLoadingGuidance(true);
		setError("");
		updateForm("guidance", "");

		try {
			if (!form.term.trim()) {
				throw new Error("Choose a term before generating guidance.");
			}
			if (resolvedPrimaryPoes.length === 0) {
				throw new Error("Add at least one primary POE before generating guidance.");
			}
			if (form.creditLoadProfile === "custom" && !form.customTargetCredits.trim()) {
				throw new Error("Enter a custom credit target before generating guidance.");
			}

			const response = await fetch("/api/courses/scheduling/insights", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				signal: abortController.signal,
				body: JSON.stringify({
					term: form.term,
					primaryPoes: resolvedPrimaryPoes,
					poe: resolvedPoe,
					secondaryEmphases: resolvedSecondaryEmphases,
					creditLoadProfile: form.creditLoadProfile,
					targetCredits: resolvedTargetCredits,
					currentGuidance: form.guidance,
					stream: true,
				}),
			});

			if (!response.ok) {
				const contentType = response.headers.get("content-type") || "";
				if (contentType.includes("application/json")) {
					const data = (await response.json()) as ErrorResponse;
					throw new Error(data.error || "Could not generate guidance draft.");
				}

				const rawError = await response.text();
				throw new Error(rawError || "Could not generate guidance draft.");
			}

			if (!response.body) {
				const fallbackRaw = await response.text();
				const fallbackText = fallbackRaw.trim();
				if (!fallbackText) {
					throw new Error("Could not generate guidance draft.");
				}

				updateForm("guidance", fallbackText);
				return;
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let guidanceText = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}

				const chunkText = decoder.decode(value, { stream: true });
				if (!chunkText) {
					continue;
				}

				guidanceText += chunkText;
				setForm((previous) => ({ ...previous, guidance: guidanceText }));
			}

			guidanceText += decoder.decode();
			if (!guidanceText.trim()) {
				throw new Error("Could not generate guidance draft.");
			}
		}
		catch (guidanceError) {
			if (guidanceError instanceof Error && guidanceError.name === "AbortError") {
				return;
			}

			setError((guidanceError as Error).message || "Could not generate guidance draft.");
		}
		finally {
			if (guidanceAbortRef.current === abortController) {
				guidanceAbortRef.current = null;
			}

			setLoadingGuidance(false);
		}
	}

	async function generateSchedule() {
		setLoadingPlan(true);
		setError("");
		setResult(null);
		setActiveView("result");

		try {
			if (!form.term.trim()) {
				throw new Error("Please choose a term.");
			}
			if (resolvedPrimaryPoes.length === 0) {
				throw new Error("Please add at least one primary POE.");
			}
			if (!degreeProgressFile) {
				throw new Error("Please upload your Self-Service Degree Progress PDF.");
			}
			if (form.creditLoadProfile === "custom" && !form.customTargetCredits.trim()) {
				throw new Error("Please enter a custom credit target.");
			}

			const formData = new FormData();
			formData.append("term", form.term.trim());
			formData.append("primaryPoes", JSON.stringify(resolvedPrimaryPoes));
			formData.append("poe", resolvedPoe);
			formData.append("secondaryEmphases", JSON.stringify(resolvedSecondaryEmphases));
			formData.append("creditLoadProfile", form.creditLoadProfile);
			formData.append("targetCredits", String(resolvedTargetCredits));
			formData.append("guidance", form.guidance.trim());
			formData.append("openSeatsOnly", String(form.openSeatsOnly));
			formData.append("schedulingMode", form.schedulingMode);

			if (degreeProgressFile) {
				formData.append("degreeProgressFile", degreeProgressFile);
			}

			if (form.useAlwaysInclude && form.alwaysIncludeCourses.length > 0) {
				formData.append("alwaysIncludeCourses", form.alwaysIncludeCourses.join(","));
			}

			const response = await fetch("/api/courses/scheduling", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to generate schedule.");
			}

			setResult(data as ScheduleGenerationResult);
		}
		catch (plannerError) {
			setResult(null);
			setError((plannerError as Error).message || "Could not generate a schedule right now.");
		}
		finally {
			setLoadingPlan(false);
		}
	}

	function handleBackToPlanner() {
		setActiveView("form");
		setError("");
	}

	if (activeView === "result") {
		return (
			<ScheduleBuilderResult
				error={error}
				loading={loadingPlan}
				onBack={handleBackToPlanner}
				result={result}
			/>
		);
	}

	return (
		<div className="w-full max-w-7xl mx-auto flex flex-col gap-10 mb-4">
			<div className="pt-1">
				<h1 className="text-center">
					<span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-3xl leading-tight sm:gap-x-3 sm:text-6xl">
						<span>AlfieAI</span>
						<GrSchedules className="shrink-0 text-[22px] sm:text-[34px]" />
						<span className="font-chalkboard text-purple-400">Schedule Builder</span>
					</span>
				</h1>
			</div>

			<section className="flex flex-col gap-6 rounded-3xl border border-default-200 bg-content1/80 p-5 shadow-sm dark:border-default-600 dark:bg-zinc-900/80 sm:p-7">
				<div className="flex flex-col gap-2">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-500 dark:text-purple-300">Welcome to AlfieAI's Schedule Builder </p>
					<h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Tell AlfieAI what matters for next semester.</h2>
					<span className="flex gap-2 items-center text-md font-medium text-foreground/80 sm:text-xl">
						Your degree. Your schedule. Your vibe.
						<LuSparkles/>
					</span>
					<p className="text-sm text-default-600 dark:text-default-500">
						Tell AlfieAI what you study, pick a term from available offerings, upload your Self-Service Degree Progress PDF,
						and add preferences for the model. AlfieAI will use your information to generate an optimal, personalized schedule
						for the upcoming term based on your unique academic history and preferences.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
					<div className="flex flex-col gap-4 rounded-2xl border border-default-200 bg-default-50/70 p-4 dark:border-default-700 dark:bg-zinc-900/60 sm:p-5">
						<div className="flex flex-col gap-1">
							<p className="text-sm font-medium text-foreground">Academic emphases</p>
							<p className="text-xs text-default-600 dark:text-default-500">Choose your POE(s), then optionally add secondary emphases.</p>
						</div>

						<div className="flex flex-col gap-5">
							<div className="flex flex-col">
								<div className="flex items-center justify-between gap-1">
									<p className="text-sm font-medium text-foreground">
										What is your primary area of study?
									</p>

									<Button size="sm" color="secondary" startContent={<LuPlus size={14} />} onPress={addPrimaryPoe}>
										Add POE
									</Button>
								</div>

								<div className="flex flex-col gap-3">
									{form.studentPoes.length === 0 ? (
										<p className="text-xs text-default-600 dark:text-default-500">No POEs added yet. Click Add POE to start.</p>
									) : form.studentPoes.map((item) => (
										<div className="flex flex-col gap-3" key={item.id}>
											<div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
													<Autocomplete
													label={form.studentPoes.length > 1? `POE ${form.studentPoes.indexOf(item) + 1}` : "POE"}
													labelPlacement="outside"
														defaultItems={poeSelectOptions}
														value={item.selection || null}
														onChange={(value: Key | null) => {
															if (value == null) {
																return;
															}

															const nextSelection = String(value);
															updatePrimaryPoe(item.id, {
																selection: nextSelection,
																customValue: nextSelection === OTHER_OPTION_KEY ? item.customValue : "",
															});
														}}
													isDisabled={poes.length === 0 && !loadingOptions}
													placeholder="Choose a POE"
												>
														{(option) => <AutocompleteItem key={option.key}>{option.label}</AutocompleteItem>}
													</Autocomplete>

												<Button
													variant="flat"
													color="danger"
													startContent={<LuTrash2 size={14} />}
													onPress={() => removePrimaryPoe(item.id)}
												>
													Remove
												</Button>
											</div>

											{item.selection === OTHER_OPTION_KEY && (
												<Input
													label="Custom primary POE"
													labelPlacement="outside"
													placeholder="Type a primary POE"
													value={item.customValue}
													onValueChange={(value) => updatePrimaryPoe(item.id, { customValue: value })}
												/>
											)}
										</div>
									))}
								</div>
							</div>

							<div className="flex flex-col">
								<div className="flex items-center justify-between gap-1">
									<p className="text-sm font-medium text-foreground">Do you have any secondary fields of study?</p>
									<Button size="sm" color="secondary" startContent={<LuPlus size={14} />} onPress={addSecondaryEmphasis}>
										Add secondary
									</Button>
								</div>

								{form.secondaryEmphases.length === 0 ? (
									<p className="text-xs text-default-600 dark:text-default-500">No secondary emphases added yet.</p>
								) : (
									<div className="flex flex-col gap-3">
										{form.secondaryEmphases.map((item, index) => (
											<div className="flex flex-col gap-3" key={item.id}>
												<div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
													<Autocomplete
														label={form.studentPoes.length > 1? `Secondary Emphasis ${form.studentPoes.indexOf(item) + 1}` : "Secondary Emphasis"}
														labelPlacement="outside"
														defaultItems={poeSelectOptions}
														value={item.selection || null}
														onChange={(value: Key | null) => {
															if (value == null) {
																return;
															}

															const nextSelection = String(value);
															updateSecondaryEmphasis(item.id, {
																selection: nextSelection,
																customValue: nextSelection === OTHER_OPTION_KEY ? item.customValue : "",
															});
														}}
														placeholder="Choose a secondary emphasis"
													>
														{(option) => <AutocompleteItem key={option.key}>{option.label}</AutocompleteItem>}
													</Autocomplete>

													<Button
														variant="flat"
														color="danger"
														startContent={<LuTrash2 size={14} />}
														onPress={() => removeSecondaryEmphasis(item.id)}
													>
														Remove
													</Button>
												</div>

												{item.selection === OTHER_OPTION_KEY && (
													<Input
														label="Custom secondary emphasis"
														labelPlacement="outside"
														placeholder="Type a secondary emphasis"
														value={item.customValue}
														onValueChange={(value) => updateSecondaryEmphasis(item.id, { customValue: value })}
													/>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4 rounded-2xl border border-default-200 bg-default-50/70 p-4 dark:border-default-700 dark:bg-zinc-900/60 sm:p-5">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-medium text-foreground">Self-Service Degree Progress</p>
								<p className="text-xs text-default-600 dark:text-default-500">Upload your degree progress PDF so AlfieAI can ground recommendations in completed work.</p>
							</div>
							<Button variant="light" startContent={<LuCircleHelp size={16} />} onPress={onOpen}>
								Help
							</Button>
						</div>

						<div className="flex flex-col gap-1.5">
							<p className="text-sm font-medium text-foreground">Degree Progress PDF</p>
							<div className="flex items-center gap-3">
								<Button
									size="sm"
									variant="flat"
									startContent={<LuFileUp size={15} />}
									onPress={() => { document.getElementById("degree-progress-file-input")?.click(); }}
								>
									{degreeProgressFile ? "Replace file" : "Choose PDF"}
								</Button>
								<input
									id="degree-progress-file-input"
									type="file"
									accept="application/pdf,.pdf"
									className="sr-only"
									onChange={handleDegreeProgressChange}
								/>
								{degreeProgressFile ? (
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<span className="truncate text-sm text-foreground">{degreeProgressFile.name}</span>
										<Button
											className="shrink-0 border-none"
											color="danger"
											variant="ghost"
											aria-label="Remove file"
											size="sm"
											radius="md"
											onPress={() => setDegreeProgressFile(null)}
											startContent={<LuTrash2 size={14} />}
											isIconOnly
										/>
									</div>
								) : (
									<span className="text-sm text-danger-600 dark:text-danger-400">PDF required · no file selected</span>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Select
						label="Term"
						labelPlacement="outside"
						selectedKeys={form.term ? [form.term] : []}
						onSelectionChange={(keys) => {
							const selected = Array.from(keys as Set<Key>)[0];
							if (selected) {
								updateForm("term", String(selected));
							}
						}}
						isDisabled={loadingOptions || terms.length === 0}
						placeholder={loadingOptions ? "Loading available terms..." : "Select a term"}
					>
						{terms.map((term) => (
							<SelectItem key={term}>{term}</SelectItem>
						))}
					</Select>

					<div className="flex flex-col gap-2">
						<Select
							label="Credit load"
							labelPlacement="outside"
							selectedKeys={form.creditLoadProfile ? [form.creditLoadProfile] : []}
							onSelectionChange={(keys) => {
								const selected = Array.from(keys as Set<Key>)[0];
								if (!selected) {
									return;
								}

								updateForm("creditLoadProfile", String(selected) as CreditLoadProfile);
							}}
							placeholder="Select credit load"
						>
							{creditLoadOptions.map((option) => (
								<SelectItem key={option.key} description={option.description}>
									{option.label}
								</SelectItem>
							))}
						</Select>

						{form.creditLoadProfile === "custom" && (
							<Input
								type="number"
								label="Custom target credits"
								labelPlacement="outside"
								placeholder="e.g. 16"
								min={1}
								max={24}
								value={form.customTargetCredits}
								onValueChange={(value) => updateForm("customTargetCredits", value)}
							/>
						)}
					</div>

					<Select
						label="Scheduling priority"
						labelPlacement="outside"
						selectedKeys={[form.schedulingMode]}
						onSelectionChange={(keys) => {
							const selected = Array.from(keys as Set<Key>)[0];
							if (selected) {
								updateForm("schedulingMode", String(selected) as SchedulingMode);
							}
						}}
						placeholder="Select scheduling priority"
					>
						{schedulingModeOptions.map((option) => (
							<SelectItem key={option.key} description={option.description}>
								{option.label}
							</SelectItem>
						))}
					</Select>
				</div>
				
				<div className="flex flex-col gap-y-5">
					<div className="flex flex-col gap-1">
						<p className="text-sm font-medium text-foreground">Course preferences</p>
						<p className="text-xs text-default-600 dark:text-default-500">
							Bring some courses you've already chosen or ask AlfieAI to prioritize sections with open seats.
						</p>
					</div>

					<div className="rounded-2xl border border-default-200 bg-default-50/70 px-4 py-3 dark:border-default-700 dark:bg-zinc-900/60">
						<Switch
							isSelected={form.openSeatsOnly}
							onValueChange={(value) => updateForm("openSeatsOnly", value)}
							color="secondary"
							size="sm"
						>
							<div className="text-left">
								<p className="font-medium text-foreground">Prefer open sections only</p>
								<p className="text-xs text-default-600 dark:text-default-300">Try to avoid closed/waitlisted sections when possible.</p>
							</div>
						</Switch>
					</div>

					<div className="rounded-2xl border border-default-200 bg-default-50/70 px-4 py-3 dark:border-default-700 dark:bg-zinc-900/60">
						<Switch
							isSelected={form.useUserChosenMode}
							onValueChange={(value) => updateForm("useUserChosenMode", value)}
							color="secondary"
							size="sm"
						>
							<div className="text-left">
								<p className="font-medium text-foreground">I've already chosen some courses</p>
								<p className="text-xs text-default-600 dark:text-default-300">Lock in your pre-registered courses as <strong>User's Choice</strong> — AlfieAI suggests what to add around them.</p>
							</div>
						</Switch>
					</div>

					<div className="flex flex-col gap-3 rounded-2xl border border-default-200 bg-default-50/70 px-4 py-3 dark:border-default-700 dark:bg-zinc-900/60">
						<Switch
							isSelected={form.useAlwaysInclude}
							onValueChange={(value) => {
								updateForm("useAlwaysInclude", value);
								if (!value) {
									updateForm("alwaysIncludeCourses", []);
									setAlwaysIncludeQuery("");
									setAlwaysIncludeResults([]);
								}
							}}
							color="secondary"
							size="sm"
						>
							<div className="text-left">
								<p className="font-medium text-foreground">Always include specific courses</p>
								<p className="text-xs text-default-600 dark:text-default-300">Pick courses from the catalog that AlfieAI must include in your schedule.</p>
							</div>
						</Switch>
						{form.useAlwaysInclude && (
							<div className="flex flex-col gap-3 pt-1">
								{form.alwaysIncludeCourses.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{form.alwaysIncludeCourses.map((code) => (
											<span
												key={code}
												className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/70 bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:border-violet-400/35 dark:bg-violet-500/20 dark:text-violet-200"
											>
												{code}
												<button
													type="button"
													aria-label={`Remove ${code}`}
													className="ml-0.5 rounded-full text-violet-700 transition-colors hover:text-danger dark:text-violet-300"
													onClick={() => removeAlwaysIncludeCourse(code)}
												>
													<LuX size={11} />
												</button>
											</span>
										))}
									</div>
								)}
								<div className="relative" ref={alwaysIncludeContainerRef}>
									<Input
										size="sm"
										placeholder={form.term ? "Search courses by name or code…" : "Select a term above to search courses"}
										isDisabled={!form.term}
										value={alwaysIncludeQuery}
										onValueChange={(value) => {
											setAlwaysIncludeQuery(value);
											searchAlwaysIncludeCourses(value);
										}}
										onFocus={() => {
											if (alwaysIncludeResults.length === 0) {
												searchAlwaysIncludeCourses(alwaysIncludeQuery);
											}
										}}
										startContent={alwaysIncludeSearching ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-secondary border-t-transparent" /> : <LuSearch size={14} className="text-default-400" />}
									/>
									{alwaysIncludeResults.length > 0 && (
										<ul className="absolute z-20 mt-1 w-full rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
											{alwaysIncludeResults.map((r) => (
												<li key={r.code}>
													<button
														type="button"
														className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
														onClick={() => addAlwaysIncludeCourse(r.code)}
													>
														<span className="font-medium text-secondary-600 dark:text-secondary-300">{r.code}</span>
														<span className="truncate text-zinc-600 dark:text-zinc-400">{r.title}</span>
													</button>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<Textarea
						label="What are your academic goals for next semester?"
						labelPlacement="outside"
						placeholder="Example: I want 14-16 credits, no early mornings, at least one writing-heavy course, and a balanced workload across weekdays."
						minRows={6}
						value={form.guidance}
						onValueChange={(value) => updateForm("guidance", value)}
				/>
					<div className="flex flex-wrap justify-between items-center gap-3">
						<div className="flex flex-col justify-center items-start gap-2">
							<Button
								variant="flat"
								color="secondary"
								startContent={<LuSparkles size={16}/>}
								onPress={() => void generateGuidanceDraft()}
								isLoading={loadingGuidance}
								isDisabled={!form.term.trim() || resolvedPrimaryPoes.length === 0}
							>
								Draft with AlfieAI
							</Button>
							
							<p className="text-xs text-default-600 dark:text-default-500">
								Autofill a high-quality preference paragraph you can edit before generating.
							</p>
						</div>
					
						<Button
							color="secondary"
							size="md"
							onPress={() => void generateSchedule()}
							isLoading={loadingPlan}
							isDisabled={!form.term.trim() || resolvedPrimaryPoes.length === 0 || !degreeProgressFile}
						>
							Generate schedule
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					
				</div>
			</section>

			<Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader>Download Self-Service Degree Progress PDF</ModalHeader>
							<ModalBody className="flex flex-col gap-4 px-1 sm:px-2 pb-1">
								<ol className="list-decimal pl-6 pr-1 text-sm leading-relaxed text-foreground marker:text-default-500 space-y-3">
									<li>
										Go to {" "}
										<Link className="text-[1em] font-semibold underline underline-offset-2" href="https://selfservice.juniata.edu" target="_blank" rel="noreferrer">
											selfservice.juniata.edu
										</Link>
										.
									</li>
									<li>Click on Student Planning.</li>
									<li>Click on Go to My Progress.</li>
									<li>
										Click Expand All next to Requirements.
										<figure className="mt-2 rounded-xl border border-default-200 bg-default-50/70 p-2 dark:border-default-700 dark:bg-zinc-900/60">
											<img
												src="/images/selfservice/step4-expand-all.png"
												alt="Example of the Expand All button next to Requirements in Self-Service"
												className="mx-auto h-auto max-h-40 w-auto max-w-full rounded-lg border border-default-200 dark:border-default-700"
												onError={(event) => {
													const image = event.currentTarget as HTMLImageElement;
													image.onerror = null;
													image.src = "/images/selfservice/step4-expand-all-fallback.svg";
												}}
											/>
										</figure>
									</li>
									<li>
										Click Print.
										<figure className="mt-2 rounded-xl border border-default-200 bg-default-50/70 p-2 dark:border-default-700 dark:bg-zinc-900/60">
											<img
												src="/images/selfservice/step5-print.png"
												alt="Example of the Print button in Self-Service"
												className="mx-auto h-auto max-h-40 w-auto max-w-full rounded-lg border border-default-200 dark:border-default-700"
												onError={(event) => {
													const image = event.currentTarget as HTMLImageElement;
													image.onerror = null;
													image.src = "/images/selfservice/step5-print-fallback.svg";
												}}
											/>
										</figure>
									</li>
									<li>Save the result as a PDF, then upload that PDF here.</li>
								</ol>
								<div className="rounded-xl border border-amber-300/70 bg-amber-50/70 p-3 text-sm leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/12 dark:text-amber-200">
									<strong>Note:</strong> Degree Progress PDF parsing helps suggestions, but advisor and registrar guidance should still be treated as final.
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="flat" onPress={onClose}>Close</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
