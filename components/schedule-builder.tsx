"use client";

import {
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
import { LuCircleHelp, LuFileUp, LuPlus, LuSparkles, LuTrash2 } from "react-icons/lu";

import ScheduleBuilderResult from "@/components/schedule-builder-result";

import type { ScheduleGenerationResult } from "@/lib/schedule-ai";

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
	openSeatsOnly: boolean;
	secondaryEmphases: EmphasisField[];
}

interface ErrorResponse {
	error?: string;
}

const OTHER_OPTION_KEY = "__other__";

function newEmphasisField(prefix: "primary" | "secondary"): EmphasisField {
	const random = Math.random().toString(36).slice(2, 9);
	return {
		id: `${prefix}-${Date.now()}-${random}`,
		selection: "",
		customValue: "",
	};
}

const defaultForm: PlannerFormState = {
	term: "",
	studentPoes: [],
	guidance: "",
	openSeatsOnly: true,
	secondaryEmphases: [],
};

function resolveChoice(selection: string, customValue: string): string {
	if (selection === OTHER_OPTION_KEY) {
		return customValue.trim();
	}

	return selection.trim();
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
	const guidanceAbortRef = useRef<AbortController | null>(null);
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

	useEffect(() => {
		let cancelled = false;

		async function loadPlannerOptions() {
			setLoadingOptions(true);

			try {
				const response = await fetch("/api/courses/planner-options");
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
					term: loadedTerms.includes(previous.term) ? previous.term : (loadedTerms[0] || ""),
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

	function updateForm<K extends keyof PlannerFormState>(field: K, value: PlannerFormState[K]) {
		setForm((previous) => ({ ...previous, [field]: value }));
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

			const response = await fetch("/api/courses/scheduling/insights", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				signal: abortController.signal,
				body: JSON.stringify({
					term: form.term,
					primaryPoes: resolvedPrimaryPoes,
					poe: resolvedPoe,
					secondaryEmphases: resolvedSecondaryEmphases,
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

			const formData = new FormData();
			formData.append("term", form.term.trim());
			formData.append("primaryPoes", JSON.stringify(resolvedPrimaryPoes));
			formData.append("poe", resolvedPoe);
			formData.append("secondaryEmphases", JSON.stringify(resolvedSecondaryEmphases));
			formData.append("guidance", form.guidance.trim());
			formData.append("openSeatsOnly", String(form.openSeatsOnly));

			if (degreeProgressFile) {
				formData.append("degreeProgressFile", degreeProgressFile);
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
												<Select
													label={form.studentPoes.length > 1? `POE ${form.studentPoes.indexOf(item) + 1}` : "POE"}
													labelPlacement="outside"
													items={poeSelectOptions}
													selectedKeys={item.selection ? [item.selection] : []}
													onSelectionChange={(keys) => {
														const selected = Array.from(keys as Set<Key>)[0];
														if (!selected) {
															return;
														}

														const nextSelection = String(selected);
														updatePrimaryPoe(item.id, {
															selection: nextSelection,
															customValue: nextSelection === OTHER_OPTION_KEY ? item.customValue : "",
														});
													}}
													isDisabled={poes.length === 0 && !loadingOptions}
													placeholder="Choose a POE"
												>
													{(option) => <SelectItem key={option.key}>{option.label}</SelectItem>}
												</Select>

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
													<Select
														label={form.studentPoes.length > 1? `Secondary Emphasis ${form.studentPoes.indexOf(item) + 1}` : "Secondary Emphasis"}
														labelPlacement="outside"
														items={poeSelectOptions}
														selectedKeys={item.selection ? [item.selection] : []}
														onSelectionChange={(keys) => {
															const selected = Array.from(keys as Set<Key>)[0];
															if (!selected) {
																return;
															}

															const nextSelection = String(selected);
															updateSecondaryEmphasis(item.id, {
																selection: nextSelection,
																customValue: nextSelection === OTHER_OPTION_KEY ? item.customValue : "",
															});
														}}
														placeholder="Choose a secondary emphasis"
													>
														{(option) => <SelectItem key={option.key}>{option.label}</SelectItem>}
													</Select>

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
									<span className="text-sm text-default-500 dark:text-default-600">No file selected · PDF only</span>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="max-w-md">
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
					<div className="flex flex-wrap items-center gap-3">
						<Button
							variant="flat"
							color="secondary"
							startContent={<LuSparkles size={16} />}
							onPress={() => void generateGuidanceDraft()}
							isLoading={loadingGuidance}
						isDisabled={!form.term.trim() || resolvedPrimaryPoes.length === 0}
						>
							Draft with AlfieAI
						</Button>
						<p className="text-xs text-default-600 dark:text-default-300">Autofill a high-quality preference paragraph you can edit before generating.</p>
					</div>
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

				{optionsWarning && (
					<div className="rounded-2xl border border-warning-200 bg-warning-50/70 px-4 py-3 text-sm text-warning-900 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-200">
						{optionsWarning}
					</div>
				)}

				{error && (
					<div className="rounded-2xl border border-danger-200 bg-danger-50/80 px-4 py-3 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-300">
						{error}
					</div>
				)}

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Button
						color="secondary"
						size="md"
						onPress={() => void generateSchedule()}
						isLoading={loadingPlan}
						isDisabled={!form.term.trim() || resolvedPrimaryPoes.length === 0}
					>
						Generate schedule
					</Button>
				</div>
			</section>

			<Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader>Download Self-Service Degree Progress</ModalHeader>
							<ModalBody className="flex flex-col gap-3">
								<ol className="list-decimal text-sm text-default-700 dark:text-default-200">
									<li>
										Log onto self service (
										<Link href="https://selfservice.juniata.edu" target="_blank" rel="noreferrer">
											selfservice.juniata.edu
										</Link>
										).
									</li>
									<li>Open the main menu.</li>
									<li>Go to Academics.</li>
									<li>Open Degree Progress.</li>
									<li>Print or save the page as a PDF, then upload that file here.</li>
								</ol>
								<div className="rounded-xl border border-warning-200 bg-warning-50 text-sm text-warning-900 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-200">
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
