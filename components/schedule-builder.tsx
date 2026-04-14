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
import { ChangeEvent, Key, useEffect, useState } from "react";
import { LuCircleHelp, LuFileUp } from "react-icons/lu";

import type { DualDegreeStatus, EntryType, StudyAbroadStatus } from "@/lib/gen-ed-rules";
import type { SchedulePlanningResult } from "@/lib/schedule-planner";

interface PlannerOptionsResponse {
	terms: string[];
	poes: string[];
	warnings?: string[];
}

interface PlannerFormState {
	term: string;
	poe: string;
	entryType: EntryType;
	incomingCredits: string;
	incomingCompositionCredits: string;
	targetCredits: string;
	studyAbroad: StudyAbroadStatus;
	dualDegree: DualDegreeStatus;
	legacyBlanketWaiver: boolean;
	openSeatsOnly: boolean;
	prompt: string;
}

interface AutocompleteOption {
	key: string;
	label: string;
}

interface PlannerSettingSwitchProps {
	label: string;
	description: string;
	isSelected: boolean;
	onValueChange: (value: boolean) => void;
}

const defaultForm: PlannerFormState = {
	term: "",
	poe: "",
	entryType: "continuing",
	incomingCredits: "",
	incomingCompositionCredits: "",
	targetCredits: "",
	studyAbroad: "none",
	dualDegree: "none",
	legacyBlanketWaiver: false,
	openSeatsOnly: true,
	prompt: "",
};

function getSuggestedTerm(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	if (month <= 4) {
		return `Spring Term ${year}`;
	}

	if (month <= 6) {
		return `Summer Term ${year}`;
	}

	return `Fall Term ${year}`;
}

function appendIfPresent(formData: FormData, key: string, value: string) {
	if (value.trim()) {
		formData.append(key, value.trim());
	}
}

function PlannerSettingSwitch({
	label,
	description,
	isSelected,
	onValueChange,
}: PlannerSettingSwitchProps) {
	return (
		<div className="rounded-2xl border border-default-200 bg-default-50/70 px-4 py-3">
			<Switch
				isSelected={isSelected}
				onValueChange={onValueChange}
				color="secondary"
				size="sm"
				classNames={{
					base: "inline-flex w-full max-w-none flex-row-reverse items-start justify-between gap-3",
					wrapper: "mt-0 bg-default-200 group-data-[selected=true]:bg-secondary-500",
					thumb: "bg-white shadow-sm",
					label: "w-full flex-1",
				}}
			>
				<div className="text-left">
					<p className="font-medium text-default-800">{label}</p>
					<p className="text-xs text-default-500">{description}</p>
				</div>
			</Switch>
		</div>
	);
}

export default function ScheduleBuilder() {
	const [form, setForm] = useState<PlannerFormState>(defaultForm);
	const [terms, setTerms] = useState<string[]>([]);
	const [poes, setPoes] = useState<string[]>([]);
	const [loadingOptions, setLoadingOptions] = useState(true);
	const [loadingPlan, setLoadingPlan] = useState(false);
	const [error, setError] = useState("");
	const [optionsWarning, setOptionsWarning] = useState("");
	const [result, setResult] = useState<SchedulePlanningResult | null>(null);
	const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const poeOptions: AutocompleteOption[] = poes.map((poe) => ({ key: poe, label: poe }));

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
					poe: previous.poe || loadedPoes[0] || "",
				}));
			}
			catch {
				if (!cancelled) {
					setOptionsWarning("Could not load planner terms from the database. Term selection is currently unavailable.");
					setForm((previous) => ({
						...previous,
						term: "",
					}));
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

	function updateField<K extends keyof PlannerFormState>(field: K, value: PlannerFormState[K]) {
		setForm((previous) => ({ ...previous, [field]: value }));
	}

	function handleTranscriptChange(event: ChangeEvent<HTMLInputElement>) {
		const nextFile = event.target.files?.[0] || null;
		setTranscriptFile(nextFile);
	}

	async function generateSchedule() {
		setLoadingPlan(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("term", form.term);
			formData.append("poe", form.poe);
			formData.append("entryType", form.entryType);
			formData.append("studyAbroad", form.studyAbroad);
			formData.append("dualDegree", form.dualDegree);
			formData.append("legacyBlanketWaiver", String(form.legacyBlanketWaiver));
			formData.append("openSeatsOnly", String(form.openSeatsOnly));
			appendIfPresent(formData, "incomingCredits", form.incomingCredits);
			appendIfPresent(formData, "incomingCompositionCredits", form.incomingCompositionCredits);
			appendIfPresent(formData, "targetCredits", form.targetCredits);
			appendIfPresent(formData, "prompt", form.prompt);

			if (transcriptFile) {
				formData.append("transcriptFile", transcriptFile);
			}

			const response = await fetch("/api/courses/scheduling", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to generate schedule.");
			}

			setResult(data as SchedulePlanningResult);
		}
		catch (plannerError) {
			setResult(null);
			setError((plannerError as Error).message || "Could not generate a schedule right now.");
		}
		finally {
			setLoadingPlan(false);
		}
	}

	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-10">
			<div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-5">
				<section className="rounded-3xl border border-default-200 bg-content1/70 p-5 sm:p-7 shadow-sm">
					<div className="flex flex-col gap-2">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-400">AlfieAI Courses</p>
						<h2 className="text-2xl sm:text-3xl font-semibold">Build a requirement-aware schedule for one specific term.</h2>
						<p className="text-default-600">
							Choose a term, upload an unofficial transcript PDF if you have one, and let AlfieAI Courses
							balance waivers, remaining gen-ed coverage, available offerings, and section conflicts.
						</p>
					</div>

					<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Term"
							labelPlacement="outside"
							selectedKeys={form.term ? [form.term] : []}
							onSelectionChange={(keys) => {
								const selected = Array.from(keys as Set<Key>)[0];
								if (selected) {
									updateField("term", String(selected));
								}
							}}
							isDisabled={loadingOptions || terms.length === 0}
							placeholder={loadingOptions ? "Loading available terms..." : "Select a term"}
						>
							{terms.map((term) => (
								<SelectItem key={term}>{term}</SelectItem>
							))}
						</Select>

						<Autocomplete
							label="POE / Major"
							labelPlacement="outside"
							defaultItems={poeOptions}
							inputValue={form.poe}
							onInputChange={(value) => updateField("poe", value)}
							onSelectionChange={(key) => {
								if (key) {
									updateField("poe", String(key));
								}
							}}
							allowsCustomValue
							placeholder="Select or type a POE"
						>
							{(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
						</Autocomplete>

						<Select
							label="Student status"
							labelPlacement="outside"
							selectedKeys={[form.entryType]}
							onSelectionChange={(keys) => {
								const selected = Array.from(keys as Set<Key>)[0];
								if (selected) {
									updateField("entryType", String(selected) as EntryType);
								}
							}}
						>
							<SelectItem key="continuing">Continuing Juniata student</SelectItem>
							<SelectItem key="first-year">Incoming first-year student</SelectItem>
							<SelectItem key="transfer">Incoming transfer student</SelectItem>
						</Select>

						<Input
							type="number"
							label="Target credits"
							labelPlacement="outside"
							placeholder="15"
							value={form.targetCredits}
							onValueChange={(value) => updateField("targetCredits", value)}
						/>

						<Input
							type="number"
							label="Incoming credits before Juniata"
							labelPlacement="outside"
							placeholder="24"
							value={form.incomingCredits}
							onValueChange={(value) => updateField("incomingCredits", value)}
						/>

						<Input
							type="number"
							label="Incoming English comp / seminar credits"
							labelPlacement="outside"
							placeholder="6"
							value={form.incomingCompositionCredits}
							onValueChange={(value) => updateField("incomingCompositionCredits", value)}
						/>

						<Select
							label="Study abroad status"
							labelPlacement="outside"
							selectedKeys={[form.studyAbroad]}
							onSelectionChange={(keys) => {
								const selected = Array.from(keys as Set<Key>)[0];
								if (selected) {
									updateField("studyAbroad", String(selected) as StudyAbroadStatus);
								}
							}}
						>
							<SelectItem key="none">None</SelectItem>
							<SelectItem key="semester">Semester abroad</SelectItem>
							<SelectItem key="year">Academic year abroad</SelectItem>
						</Select>

						<Select
							label="Dual-degree status"
							labelPlacement="outside"
							selectedKeys={[form.dualDegree]}
							onSelectionChange={(keys) => {
								const selected = Array.from(keys as Set<Key>)[0];
								if (selected) {
									updateField("dualDegree", String(selected) as DualDegreeStatus);
								}
							}}
						>
							<SelectItem key="none">None</SelectItem>
							<SelectItem key="domestic">3+ dual degree (domestic partner)</SelectItem>
							<SelectItem key="abroad">3+ dual degree (abroad partner)</SelectItem>
						</Select>
					</div>

					<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
						<PlannerSettingSwitch
							label="Legacy blanket waiver"
							description="Entered Juniata in 2019 FA, 2020 SP, 2020 FA, or 2021 SP."
							isSelected={form.legacyBlanketWaiver}
							onValueChange={(value) => updateField("legacyBlanketWaiver", value)}
						/>

						<PlannerSettingSwitch
							label="Prefer open sections only"
							description="Skip closed and waitlisted sections whenever possible."
							isSelected={form.openSeatsOnly}
							onValueChange={(value) => updateField("openSeatsOnly", value)}
						/>
					</div>

					{optionsWarning && (
						<div className="mt-5 rounded-2xl border border-warning-200 bg-warning-50/70 px-4 py-3 text-sm text-warning-900">
							{optionsWarning}
						</div>
					)}

					<div className="mt-5 space-y-4">
						<div className="rounded-2xl border border-default-200 bg-default-50/70 p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-default-700">Transcript upload</p>
									<p className="text-xs text-default-500">Upload a Juniata unofficial transcript PDF for course recognition.</p>
								</div>
								<Button variant="light" startContent={<LuCircleHelp size={16} />} onPress={onOpen}>
									Help
								</Button>
							</div>

							<Input
								className="mt-4"
								type="file"
								accept="application/pdf,.pdf"
								label="Unofficial transcript PDF"
								labelPlacement="outside"
								onChange={handleTranscriptChange}
								startContent={<LuFileUp size={16} />}
								description={transcriptFile ? `Selected: ${transcriptFile.name}` : "Optional. PDF only."}
							/>
						</div>

						<Textarea
							label="Goals and scheduling preferences"
							labelPlacement="outside"
							placeholder="Examples: I want around 15 credits, no Friday classes, afternoons only, and I need more CS plus any gen-ed coverage I still have left."
							minRows={6}
							value={form.prompt}
							onValueChange={(value) => updateField("prompt", value)}
						/>
					</div>

					<div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
						<Button
							color="secondary"
							size="lg"
							onPress={() => void generateSchedule()}
							isLoading={loadingPlan}
							isDisabled={!form.term.trim()}
						>
							Generate Optimal Schedule
						</Button>
						<p className="text-sm text-default-500">
							The planner uses your Juniata gen-ed waiver charts, completed work, and current term offerings.
						</p>
					</div>
				</section>

				<section className="rounded-3xl border border-default-200 dark:border-default-600 bg-linear-to-br from-purple-50/75 via-content1/85 to-default-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-slate-950 p-5 sm:p-7">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-500 dark:text-purple-300">Schedule Preview</p>
					<h3 className="mt-2 text-2xl font-semibold text-foreground">Recommended schedule</h3>

					{error && (
						<div className="mt-4 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
							{error}
						</div>
					)}

					{!result && !loadingPlan && !error && (
						<div className="mt-4 rounded-2xl border border-dashed border-default-300 dark:border-default-600 bg-default-50/70 dark:bg-zinc-900/60 px-5 py-5 text-sm text-foreground/90">
							Your result will show recognized completed courses, applied waivers, a suggested term schedule, remaining requirements, and backup options.
						</div>
					)}

					{loadingPlan && (
						<div className="mt-4 rounded-2xl border border-secondary-200 bg-secondary-50/80 px-5 py-5">
							<p className="text-sm font-medium text-secondary-700">AlfieAI is building the schedule.</p>
							<p className="mt-1 text-sm text-secondary-900">
								Checking remaining gen-ed categories, waiver eligibility, available sections, and time conflicts.
							</p>
						</div>
					)}

					{result && (
						<div className="mt-4 space-y-5">
							<div className="rounded-2xl border border-default-200 bg-content1/80 p-4">
								<div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-default-500">
									<span>{result.term}</span>
									<span>•</span>
									<span>{result.schedule.totalCredits} credits</span>
									<span>•</span>
									<span>{result.schedule.courseCount} courses</span>
								</div>
								<p className="mt-2 text-lg font-semibold">Recognized profile</p>
								<div className="mt-3 flex flex-wrap gap-2 text-sm">
									<span className="rounded-full bg-default-100 px-3 py-1">Target: {result.recognized.targetCredits} credits</span>
									<span className="rounded-full bg-default-100 px-3 py-1">Target load: {result.recognized.targetCourseCount} courses</span>
									{result.recognized.preferredDepartments.map((department) => (
										<span key={department} className="rounded-full bg-secondary-100 px-3 py-1 text-secondary-700">{department}</span>
									))}
								</div>
								{result.recognized.completedCourseCodes.length > 0 && (
									<p className="mt-3 text-sm text-default-600">
										<strong>Completed courses recognized:</strong> {result.recognized.completedCourseCodes.join(", ")}
									</p>
								)}
								{result.recognized.requestedCourseCodes.length > 0 && (
									<p className="mt-2 text-sm text-default-600">
										<strong>Requested courses recognized:</strong> {result.recognized.requestedCourseCodes.join(", ")}
									</p>
								)}
							</div>

							{result.waiverSummary.length > 0 && (
								<div className="rounded-2xl border border-default-200 bg-content1/80 p-4">
									<p className="text-lg font-semibold">Applied waivers and assumptions</p>
									<div className="mt-3 space-y-2 text-sm text-default-700">
										{result.waiverSummary.map((item) => (
											<p key={item}>{item}</p>
										))}
									</div>
								</div>
							)}

							{result.poeProgress && (
								<div className="rounded-2xl border border-default-200 bg-content1/80 p-4">
									<div className="flex flex-col gap-2">
										<p className="text-lg font-semibold">{result.poeProgress.poe} POE progress</p>
										<p className="text-sm text-default-600">
											Using {result.poeProgress.catalogSource}. Catalog credit total: {result.poeProgress.poeCreditTotal}
											{typeof result.poeProgress.minimumUpperLevelCredits === "number" ? ` • ${result.poeProgress.minimumUpperLevelCredits}+ upper-level credits required` : ""}
										</p>
									</div>

									<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
										{result.poeProgress.requirements.map((requirement) => (
											<div key={requirement.id} className="rounded-2xl bg-default-50 px-4 py-3 text-sm">
												<div className="flex items-center justify-between gap-3">
													<p className="font-medium">{requirement.label}</p>
													<span className="rounded-full bg-default-100 px-2 py-1 text-[11px] uppercase tracking-wide text-default-600">
														{requirement.status.replace("_", " ")}
													</span>
												</div>
												<p className="mt-2 text-default-600">Required: {requirement.required}</p>
												<p className="text-default-600">Completed: {requirement.completed}</p>
												<p className="text-default-600">Planned now: {requirement.planned}</p>
												<p className="text-default-600">Remaining: {requirement.remaining}</p>
											</div>
										))}
									</div>

									{result.poeProgress.notes.length > 0 && (
										<div className="mt-4 space-y-2 text-sm text-default-700">
											{result.poeProgress.notes.map((note) => (
												<p key={note}>{note}</p>
											))}
										</div>
									)}
								</div>
							)}

							<div className="space-y-3">
								{result.schedule.courses.map((course) => (
									<article key={`${course.courseCode}-${course.section.sectionName}`} className="rounded-2xl border border-default-200 bg-content1/80 p-4">
										<div className="flex flex-col gap-2">
											<div className="flex flex-wrap items-center justify-between gap-2">
												<div>
													<p className="text-lg font-semibold">{course.courseCode}: {course.title}</p>
													<p className="text-sm text-default-500">
														{course.credits} credits • Section {course.section.sectionName} • {course.section.term}
													</p>
												</div>
												<span className="rounded-full bg-default-100 px-3 py-1 text-sm">
													{course.section.openSeats} open / {course.section.capacity} seats
												</span>
											</div>

											<div className="flex flex-wrap gap-2 text-xs">
												{course.categories.map((category) => (
													<span key={`${course.courseCode}-${category}`} className="rounded-full bg-secondary-100 px-3 py-1 text-secondary-700">
														{category}
													</span>
												))}
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-default-700">
												<p><strong>Location:</strong> {course.section.location || "TBA"}</p>
												<p><strong>Instructor{course.section.instructors.length === 1 ? "" : "s"}:</strong> {course.section.instructors.join(", ") || "TBA"}</p>
												<p className="sm:col-span-2"><strong>Meetings:</strong> {course.section.meetings.join(" | ") || "TBA"}</p>
											</div>

											<div className="rounded-xl bg-default-50 px-4 py-3 text-sm text-default-700">
												<strong>Why it made the plan:</strong> {course.reasons.join(" ")}
											</div>
										</div>
									</article>
								))}
							</div>

							<div className="rounded-2xl border border-default-200 bg-content1/80 p-4">
								<p className="text-lg font-semibold">Requirement progress</p>
								<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
									{result.requirements.map((requirement) => (
										<div key={requirement.id} className="rounded-2xl bg-default-50 px-4 py-3 text-sm">
											<p className="font-medium">{requirement.label}</p>
											<p className="mt-1 text-default-600">
												Required now: {requirement.required} • Completed before plan: {requirement.completedBeforePlan}
											</p>
											<p className="text-default-600">
												Planned now: {requirement.plannedNow} • Waived: {requirement.waived} • Remaining: {requirement.remainingAfterPlan}
											</p>
										</div>
									))}
								</div>
							</div>

							{result.alternatives.length > 0 && (
								<div className="rounded-2xl border border-default-200 bg-content1/80 p-4">
									<p className="text-lg font-semibold">Backup options</p>
									<div className="mt-3 space-y-4">
										{result.alternatives.map((alternative) => (
											<div key={alternative.requirement}>
												<p className="font-medium">{alternative.requirement}</p>
												<div className="mt-2 space-y-2">
													{alternative.options.map((option) => (
														<div key={`${alternative.requirement}-${option.courseCode}`} className="rounded-xl bg-default-50 px-4 py-3 text-sm text-default-700">
															<p className="font-medium">{option.courseCode}: {option.title}</p>
															<p>{option.credits} credits • {option.reason}</p>
															<p>{option.meetings.join(" | ") || "TBA"}</p>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{result.warnings.length > 0 && (
								<div className="rounded-2xl border border-warning-200 bg-warning-50/80 p-4">
									<p className="text-lg font-semibold text-warning-800">Warnings</p>
									<div className="mt-3 space-y-2 text-sm text-warning-900">
										{result.warnings.map((warning) => (
											<p key={warning}>{warning}</p>
										))}
									</div>
								</div>
							)}

							<div className="rounded-2xl border border-default-200 bg-content1/80 p-4">
								<p className="text-lg font-semibold">Notes</p>
								<div className="mt-3 space-y-2 text-sm text-default-700">
									{result.notes.map((note) => (
										<p key={note}>{note}</p>
									))}
								</div>
							</div>
						</div>
					)}
				</section>
			</div>

			<Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader>Directions to download transcript</ModalHeader>
							<ModalBody>
								<ol className="list-decimal pl-5 space-y-2 text-sm text-default-700">
									<li>
										Log onto self service (
										<Link href="https://selfservice.juniata.edu" target="_blank" rel="noreferrer">
											selfservice.juniata.edu
										</Link>
										).
									</li>
									<li>Click on the three-bar menu.</li>
									<li>Click on Academics.</li>
									<li>Choose Unofficial Transcript.</li>
									<li>Click on Degree Audit Transcript.</li>
								</ol>
								<p className="text-sm text-default-700">Download should start promptly.</p>
								<div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-900">
									<strong>Disclaimer:</strong> the transcript copy downloaded from Self Service is unofficial and should not replace the official signed and sealed transcript provided by the registrar.
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
