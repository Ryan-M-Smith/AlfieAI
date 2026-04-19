export type PoeRequirementGroup =
	| {
		id: string;
		label: string;
		type: "all_of";
		courseCodes: string[];
		phase?: "core" | "elective" | "capstone";
		fulfillsCapstone?: boolean;
	}
	| {
		id: string;
		label: string;
		type: "choose_one";
		courseCodes: string[];
		phase?: "core" | "elective" | "capstone";
		fulfillsCapstone?: boolean;
	}
	| {
		id: string;
		label: string;
		type: "choose_n";
		courseCodes: string[];
		count: number;
		phase?: "core" | "elective" | "capstone";
		fulfillsCapstone?: boolean;
	}
	| {
		id: string;
		label: string;
		type: "credits_from_courses";
		courseCodes: string[];
		minCredits: number;
		phase?: "core" | "elective" | "capstone";
		fulfillsCapstone?: boolean;
	}
	| {
		id: string;
		label: string;
		type: "choose_n_from_prefixes";
		prefixes: string[];
		count: number;
		minLevel?: number;
		excludeCourseCodes?: string[];
		phase?: "core" | "elective" | "capstone";
		fulfillsCapstone?: boolean;
	}
	| {
		id: string;
		label: string;
		type: "credits_from_prefixes";
		prefixes: string[];
		minCredits: number;
		minLevel?: number;
		excludeCourseCodes?: string[];
		phase?: "core" | "elective" | "capstone";
		fulfillsCapstone?: boolean;
	}
	| {
		id: string;
		label: string;
		type: "one_bundle";
		bundles: Array<{
			id: string;
			label: string;
			courseCodes: string[];
		}>;
		phase?: "core" | "elective" | "capstone";
		fulfillsCapstone?: boolean;
	};

export interface PoeRequirementProfile {
	name: string;
	aliases?: string[];
	preferredPrefixes: string[];
	catalogSource: string;
	poeCreditTotal: string;
	minimumUpperLevelCredits?: number;
	notes?: string[];
	groups: PoeRequirementGroup[];
}

export interface PoeCourseLike {
	baseCode: string;
	courseCode: string;
	title: string;
	credits: number;
	prefix: string;
}

export interface PoeRequirementProgressItem {
	id: string;
	label: string;
	status: "remaining" | "in_progress" | "complete";
	required: string;
	completed: string;
	planned: string;
	remaining: string;
	progressRatio: number;
	phase: "core" | "elective" | "capstone";
	remainingCourseCodes: string[];
	/** Numeric count of completed items (courses or credits) for display */
	completedCount: number;
	/** Numeric count of required items (courses or credits) for display */
	requiredCount: number;
	/** Unit of the counts */
	countUnit: "course" | "credit";
	/** Total credits earned toward this requirement group (supplemental display) */
	completedCreditCount: number;
}

export interface PoeEvaluation {
	profile: PoeRequirementProfile;
	items: PoeRequirementProgressItem[];
	coreCompletionRatio: number;
	capstoneReadiness: number;
}

function normalizeKey(value: string): string {
	return value
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/\//g, " ")
		.replace(/[^a-z0-9]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function normalizeCourseCode(value: string): string {
	const normalized = value.toUpperCase().replace(/[^A-Z0-9- ]/g, " ");
	const match = normalized.match(/\b([A-Z]{2,4})[- ]?(\d{3}(?:[A-Z]{1,2})?)\b/);
	if (!match) {
		return normalized.trim().replace(/\s+/g, "-");
	}

	return `${match[1]}-${match[2]}`;
}

function getEquivalentCourseCodes(value: string): string[] {
	const normalized = normalizeCourseCode(value);
	const equivalents = new Set<string>([normalized]);

	if (/^[A-Z]{2,4}-\d{3}CW$/.test(normalized)) {
		equivalents.add(normalized.slice(0, -2));
	}
	else if (/^[A-Z]{2,4}-\d{3}$/.test(normalized)) {
		equivalents.add(`${normalized}CW`);
	}

	return [...equivalents];
}

function groupCourseCodes(...codes: string[]): string[] {
	return codes.map(normalizeCourseCode);
}

function getCourseLevel(courseCode: string): number {
	const match = normalizeCourseCode(courseCode).match(/-(\d{3})(?:[A-Z]{1,2})?$/);
	return match ? Number(match[1]) : 0;
}

function matchesPrefixRule(
	course: PoeCourseLike,
	prefixes: string[],
	minLevel?: number,
	excludeCourseCodes?: string[]
): boolean {
	const excluded = new Set((excludeCourseCodes || []).map(normalizeCourseCode));
	return prefixes.includes(course.prefix)
		&& (!minLevel || getCourseLevel(course.baseCode) >= minLevel)
		&& !excluded.has(course.baseCode);
}

function buildCourseMap(courses: PoeCourseLike[]): Map<string, PoeCourseLike> {
	const map = new Map<string, PoeCourseLike>();

	for (const course of courses) {
		const normalized = normalizeCourseCode(course.baseCode || course.courseCode);
		const normalizedCourse = {
			...course,
			baseCode: normalized,
		};

		for (const equivalent of getEquivalentCourseCodes(normalized)) {
			const existing = map.get(equivalent);
			if (!existing || course.credits > existing.credits) {
				map.set(equivalent, normalizedCourse);
			}
		}
	}

	return map;
}

function uniqueCourseCodes(codes: string[]): string[] {
	return [...new Set(codes.map(normalizeCourseCode))];
}

function courseCodeListIncludes(courseCodes: string[], value: string): boolean {
	const equivalents = new Set(getEquivalentCourseCodes(value));
	return courseCodes.some((courseCode) => getEquivalentCourseCodes(courseCode).some((equivalent) => equivalents.has(equivalent)));
}

function mergeCourseCodes(completed: string[], planned: string[]): string[] {
	return uniqueCourseCodes([...completed, ...planned]);
}

function toStatus(progressRatio: number, hasStarted: boolean): "remaining" | "in_progress" | "complete" {
	if (progressRatio >= 1) {
		return "complete";
	}

	return hasStarted ? "in_progress" : "remaining";
}

function evaluateCourseCodeGroup(
	group:
		| Extract<PoeRequirementGroup, { type: "all_of" }>
		| Extract<PoeRequirementGroup, { type: "choose_one" }>
		| Extract<PoeRequirementGroup, { type: "choose_n" }>,
	completedMap: Map<string, PoeCourseLike>,
	plannedMap: Map<string, PoeCourseLike>
): PoeRequirementProgressItem {
	const completedCodes = uniqueCourseCodes(group.courseCodes.filter((code) => completedMap.has(normalizeCourseCode(code))));
	const plannedOnlyCodes = uniqueCourseCodes(group.courseCodes.filter((code) => !completedMap.has(normalizeCourseCode(code)) && plannedMap.has(normalizeCourseCode(code))));
	const combinedCodes = mergeCourseCodes(completedCodes, plannedOnlyCodes);
	let requiredCount = group.type === "choose_n" ? group.count : 1;
	let requiredLabel = "";

	if (group.type === "all_of") {
		requiredCount = group.courseCodes.length;
		requiredLabel = `${requiredCount} required courses`;
	}
	else if (group.type === "choose_one") {
		requiredLabel = `1 of ${group.courseCodes.length} approved courses`;
	}
	else {
		requiredLabel = `${group.count} of ${group.courseCodes.length} approved courses`;
	}

	const progressCount = Math.min(requiredCount, combinedCodes.length);
	const remainingCodes = group.type === "all_of"
		? uniqueCourseCodes(group.courseCodes.filter((code) => !combinedCodes.includes(normalizeCourseCode(code))))
		: progressCount >= requiredCount
			? []
			: uniqueCourseCodes(group.courseCodes.filter((code) => !combinedCodes.includes(normalizeCourseCode(code))));
	const progressRatio = requiredCount === 0 ? 1 : Math.min(1, progressCount / requiredCount);
	const hasStarted = completedCodes.length > 0 || plannedOnlyCodes.length > 0;

	const completedCountVal = Math.min(requiredCount, completedCodes.length);
	const completedCreditCount = completedCodes
		.slice(0, requiredCount)
		.reduce((sum, code) => sum + (completedMap.get(normalizeCourseCode(code))?.credits || 0), 0);
	return {
		id: group.id,
		label: group.label,
		status: toStatus(progressRatio, hasStarted),
		required: requiredLabel,
		completed: `${completedCountVal} course${requiredCount === 1 ? "" : "s"}`,
		planned: `${Math.min(Math.max(0, requiredCount - completedCodes.length), plannedOnlyCodes.length)} course${requiredCount === 1 ? "" : "s"}`,
		remaining: remainingCodes.length > 0 ? remainingCodes.join(", ") : "None",
		progressRatio,
		phase: group.phase || "core",
		remainingCourseCodes: remainingCodes,
		completedCount: completedCountVal,
		requiredCount,
		countUnit: "course",
		completedCreditCount,
	};
}

function evaluateCreditsFromCoursesGroup(
	group: Extract<PoeRequirementGroup, { type: "credits_from_courses" }>,
	completedMap: Map<string, PoeCourseLike>,
	plannedMap: Map<string, PoeCourseLike>
): PoeRequirementProgressItem {
	const completedCredits = uniqueCourseCodes(group.courseCodes)
		.map((code) => completedMap.get(code)?.credits || 0)
		.reduce((sum, credits) => sum + credits, 0);
	const plannedCredits = uniqueCourseCodes(group.courseCodes)
		.filter((code) => !completedMap.has(code))
		.map((code) => plannedMap.get(code)?.credits || 0)
		.reduce((sum, credits) => sum + credits, 0);
	const totalCredits = completedCredits + plannedCredits;
	const remainingCredits = Math.max(0, group.minCredits - totalCredits);
	const progressRatio = group.minCredits === 0 ? 1 : Math.min(1, totalCredits / group.minCredits);
	const remainingCodes = remainingCredits > 0
		? uniqueCourseCodes(group.courseCodes.filter((code) => !completedMap.has(normalizeCourseCode(code)) && !plannedMap.has(normalizeCourseCode(code))))
		: [];

	return {
		id: group.id,
		label: group.label,
		status: toStatus(progressRatio, completedCredits > 0 || plannedCredits > 0),
		required: `${group.minCredits} credits`,
		completed: `${completedCredits} credits`,
		planned: `${plannedCredits} credits`,
		remaining: remainingCredits > 0 ? `${remainingCredits} more credits` : "None",
		progressRatio,
		phase: group.phase || "elective",
		remainingCourseCodes: remainingCodes,
		completedCount: completedCredits,
		requiredCount: group.minCredits,
		countUnit: "credit",
		completedCreditCount: completedCredits,
	};
}

function evaluatePrefixCountGroup(
	group: Extract<PoeRequirementGroup, { type: "choose_n_from_prefixes" }>,
	completedMap: Map<string, PoeCourseLike>,
	plannedMap: Map<string, PoeCourseLike>
): PoeRequirementProgressItem {
	const completedMatches = [...completedMap.values()].filter((course) =>
		matchesPrefixRule(course, group.prefixes, group.minLevel, group.excludeCourseCodes)
	);
	const plannedMatches = [...plannedMap.values()].filter((course) =>
		!completedMap.has(course.baseCode) && matchesPrefixRule(course, group.prefixes, group.minLevel, group.excludeCourseCodes)
	);
	const totalCount = completedMatches.length + plannedMatches.length;
	const remainingCount = Math.max(0, group.count - totalCount);
	const progressRatio = group.count === 0 ? 1 : Math.min(1, totalCount / group.count);

	return {
		id: group.id,
		label: group.label,
		status: toStatus(progressRatio, totalCount > 0),
		required: `${group.count} course${group.count === 1 ? "" : "s"}`,
		completed: `${Math.min(group.count, completedMatches.length)} course${group.count === 1 ? "" : "s"}`,
		planned: `${Math.min(Math.max(0, group.count - completedMatches.length), plannedMatches.length)} course${group.count === 1 ? "" : "s"}`,
		remaining: remainingCount > 0 ? `${remainingCount} additional course${remainingCount === 1 ? "" : "s"} from ${group.prefixes.join("/")}` : "None",
		progressRatio,
		phase: group.phase || "elective",
		remainingCourseCodes: [],
		completedCount: Math.min(group.count, completedMatches.length),
		requiredCount: group.count,
		countUnit: "course",
		completedCreditCount: completedMatches
			.slice(0, group.count)
			.reduce((sum, c) => sum + c.credits, 0),
	};
}

function evaluatePrefixCreditsGroup(
	group: Extract<PoeRequirementGroup, { type: "credits_from_prefixes" }>,
	completedMap: Map<string, PoeCourseLike>,
	plannedMap: Map<string, PoeCourseLike>
): PoeRequirementProgressItem {
	const completedCredits = [...completedMap.values()]
		.filter((course) => matchesPrefixRule(course, group.prefixes, group.minLevel, group.excludeCourseCodes))
		.reduce((sum, course) => sum + course.credits, 0);
	const plannedCredits = [...plannedMap.values()]
		.filter((course) => !completedMap.has(course.baseCode) && matchesPrefixRule(course, group.prefixes, group.minLevel, group.excludeCourseCodes))
		.reduce((sum, course) => sum + course.credits, 0);
	const totalCredits = completedCredits + plannedCredits;
	const remainingCredits = Math.max(0, group.minCredits - totalCredits);
	const progressRatio = group.minCredits === 0 ? 1 : Math.min(1, totalCredits / group.minCredits);

	return {
		id: group.id,
		label: group.label,
		status: toStatus(progressRatio, totalCredits > 0),
		required: `${group.minCredits} credits`,
		completed: `${completedCredits} credits`,
		planned: `${plannedCredits} credits`,
		remaining: remainingCredits > 0 ? `${remainingCredits} more credits from ${group.prefixes.join("/")}` : "None",
		progressRatio,
		phase: group.phase || "elective",
		remainingCourseCodes: [],
		completedCount: completedCredits,
		requiredCount: group.minCredits,
		countUnit: "credit",
		completedCreditCount: completedCredits,
	};
}

function evaluateBundleGroup(
	group: Extract<PoeRequirementGroup, { type: "one_bundle" }>,
	completedMap: Map<string, PoeCourseLike>,
	plannedMap: Map<string, PoeCourseLike>
): PoeRequirementProgressItem {
	let best = {
		label: group.bundles[0]?.label || "Approved sequence",
		total: 1,
		completed: 0,
		planned: 0,
		remainingCourseCodes: [] as string[],
		progressRatio: 0,
	};

	for (const bundle of group.bundles) {
		const completedCodes = uniqueCourseCodes(bundle.courseCodes.filter((code) => completedMap.has(normalizeCourseCode(code))));
		const plannedOnlyCodes = uniqueCourseCodes(bundle.courseCodes.filter((code) => !completedMap.has(normalizeCourseCode(code)) && plannedMap.has(normalizeCourseCode(code))));
		const combinedCodes = mergeCourseCodes(completedCodes, plannedOnlyCodes);
		const total = bundle.courseCodes.length;
		const progressRatio = total === 0 ? 1 : combinedCodes.length / total;
		const candidate = {
			label: bundle.label,
			total,
			completed: completedCodes.length,
			planned: plannedOnlyCodes.length,
			remainingCourseCodes: uniqueCourseCodes(bundle.courseCodes.filter((code) => !combinedCodes.includes(normalizeCourseCode(code)))),
			progressRatio,
		};

		if (candidate.progressRatio > best.progressRatio || (candidate.progressRatio === best.progressRatio && candidate.completed > best.completed)) {
			best = candidate;
		}
	}

	const bestCompletedCredits = (() => {
		for (const bundle of group.bundles) {
			const completedCodes = uniqueCourseCodes(bundle.courseCodes.filter((code) => completedMap.has(normalizeCourseCode(code))));
			const total = bundle.courseCodes.length;
			const progressRatio = total === 0 ? 1 : completedCodes.length / total;
			if (progressRatio === best.progressRatio && completedCodes.length === best.completed) {
				return completedCodes.reduce((sum, code) => sum + (completedMap.get(normalizeCourseCode(code))?.credits || 0), 0);
			}
		}
		return 0;
	})();

	return {
		id: group.id,
		label: group.label,
		status: toStatus(Math.min(1, best.progressRatio), best.completed > 0),
		required: `Approved sequence: ${best.label}`,
		completed: `${best.completed} of ${best.total} courses`,
		planned: `${best.planned} course${best.planned === 1 ? "" : "s"}`,
		remaining: best.remainingCourseCodes.length > 0 ? best.remainingCourseCodes.join(", ") : "None",
		progressRatio: Math.min(1, best.progressRatio),
		phase: group.phase || "core",
		remainingCourseCodes: best.remainingCourseCodes,
		completedCount: best.completed,
		requiredCount: best.total,
		countUnit: "course",
		completedCreditCount: bestCompletedCredits,
	};
}

function evaluateGroup(
	group: PoeRequirementGroup,
	completedMap: Map<string, PoeCourseLike>,
	plannedMap: Map<string, PoeCourseLike>
): PoeRequirementProgressItem {
	switch (group.type) {
		case "all_of":
		case "choose_one":
		case "choose_n":
			return evaluateCourseCodeGroup(group, completedMap, plannedMap);
		case "credits_from_courses":
			return evaluateCreditsFromCoursesGroup(group, completedMap, plannedMap);
		case "choose_n_from_prefixes":
			return evaluatePrefixCountGroup(group, completedMap, plannedMap);
		case "credits_from_prefixes":
			return evaluatePrefixCreditsGroup(group, completedMap, plannedMap);
		case "one_bundle":
			return evaluateBundleGroup(group, completedMap, plannedMap);
	}
}

function coursesFromPrefixRule(
	group: Extract<PoeRequirementGroup, { type: "choose_n_from_prefixes" | "credits_from_prefixes" }>,
	course: PoeCourseLike
): boolean {
	return matchesPrefixRule(course, group.prefixes, group.minLevel, group.excludeCourseCodes);
}

function courseMatchesGroup(group: PoeRequirementGroup, course: PoeCourseLike): boolean {
	switch (group.type) {
		case "all_of":
		case "choose_one":
		case "choose_n":
		case "credits_from_courses":
			return courseCodeListIncludes(group.courseCodes, course.baseCode);
		case "choose_n_from_prefixes":
		case "credits_from_prefixes":
			return coursesFromPrefixRule(group, course);
		case "one_bundle":
			return group.bundles.some((bundle) => courseCodeListIncludes(bundle.courseCodes, course.baseCode));
	}
}

function getMatchBonus(group: PoeRequirementGroup): number {
	switch (group.type) {
		case "all_of":
			return group.phase === "core" ? 150 : 115;
		case "choose_one":
			return group.phase === "capstone" ? 110 : 105;
		case "choose_n":
			return group.phase === "core" ? 95 : 80;
		case "credits_from_courses":
			return 68;
		case "choose_n_from_prefixes":
			return 64;
		case "credits_from_prefixes":
			return 58;
		case "one_bundle":
			return 120;
	}
}

function getMatchReason(group: PoeRequirementGroup): string {
	if (group.phase === "capstone" || group.fulfillsCapstone) {
		return `Advances the ${group.label.toLowerCase()} requirement for your POE.`;
	}

	if (group.phase === "elective") {
		return `Counts toward ${group.label.toLowerCase()} in your POE plan.`;
	}

	return `Matches ${group.label.toLowerCase()} in your catalog-based POE requirements.`;
}

function categories(...groups: PoeRequirementGroup[]): PoeRequirementGroup[] {
	return groups;
}

const profiles: PoeRequirementProfile[] = [
	{
		name: "Business Analytics",
		preferredPrefixes: ["EB", "ESS", "CS", "DS", "IM", "MA"],
		catalogSource: "Juniata College Catalog 2025-2026, p. 49",
		poeCreditTotal: "56-58 credits",
		minimumUpperLevelCredits: 18,
		groups: categories(
			{ id: "business-analytics-core", label: "Business Analytics core", type: "all_of", phase: "core", courseCodes: groupCourseCodes("EB-100", "EB-131", "EB-202", "EB-222", "EB-236", "EB-351", "ESS-230", "CS-110", "CS-370", "DS-110", "IM-242") },
			{ id: "business-analytics-statistics", label: "Introductory statistics", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("EB-211", "MA-205", "MA-220") },
			{ id: "business-analytics-electives", label: "Business Analytics electives", type: "choose_n", phase: "elective", count: 4, courseCodes: groupCourseCodes("CM-200", "MA-116", "MA-321", "MA-325", "DS-210", "DS-352", "DS-375") },
			{ id: "business-analytics-upper-level-eb", label: "Additional 300/400-level EB course", type: "choose_n_from_prefixes", phase: "elective", count: 1, prefixes: ["EB"], minLevel: 300, excludeCourseCodes: groupCourseCodes("EB-351", "EB-480") },
			{ id: "business-analytics-capstone", label: "Business Analytics capstone", type: "all_of", phase: "capstone", fulfillsCapstone: true, courseCodes: groupCourseCodes("EB-480") },
		),
	},
	{
		name: "Computer Science",
		preferredPrefixes: ["CS", "IT", "DS", "MA"],
		catalogSource: "Juniata College Catalog 2025-2026, pp. 55-56",
		poeCreditTotal: "62-63 credits",
		minimumUpperLevelCredits: 18,
		groups: categories(
			{ id: "computer-science-core", label: "Computer Science core courses", type: "all_of", phase: "core", courseCodes: groupCourseCodes("CS-105", "CS-110", "CS-220", "CS-240", "CS-255C", "CS-255U", "CS-300", "CS-315", "CS-305", "CS-320", "CS-360", "CS-370", "CS-480", "IT-210", "MA-116", "MA-130") },
			{ id: "computer-science-statistics", label: "Computer Science statistics requirement", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("MA-205", "MA-220", "BI-305", "EB-211", "ESS-230", "ESS-309", "PY-366", "SW-215") },
			{ id: "computer-science-electives", label: "Computer Science elective credits", type: "credits_from_courses", phase: "elective", minCredits: 6, courseCodes: groupCourseCodes("CS-199", "CS-299", "CS-330", "CS-341", "CS-390", "CS-391", "CS-399", "CS-485", "CS-499", "DS-110", "DS-210", "DS-352", "DS-375", "IT-110", "IT-260", "IT-325", "IT-340", "IT-350", "IT-351", "IT-380", "IT-480", "IM-242", "MA-160", "MA-210", "MA-230", "MA-233", "MA-235", "MA-341", "PC-209") },
			{ id: "computer-science-capstone", label: "Computer Science capstone", type: "all_of", phase: "capstone", fulfillsCapstone: true, courseCodes: groupCourseCodes("IT-307") },
		),
	},
	{
		name: "Data Science",
		preferredPrefixes: ["DS", "CS", "MA", "IM", "ESS", "BI", "EB", "IT"],
		catalogSource: "Juniata College Catalog 2025-2026, pp. 56-57",
		poeCreditTotal: "56-60 credits",
		minimumUpperLevelCredits: 18,
		notes: ["The catalog also requires a 12-credit cognate area outside Data Science, Mathematics, and Computer Science."],
		groups: categories(
			{ id: "data-science-core", label: "Data Science core", type: "all_of", phase: "core", courseCodes: groupCourseCodes("CS-110", "MA-116", "DS-110", "MA-130", "MA-160", "CS-370", "DS-210", "IM-242", "MA-321", "MA-325") },
			{ id: "data-science-statistics", label: "Statistics core", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("MA-220", "MA-205", "EB-211", "BI-305", "ESS-230", "ESS-309", "PY-366", "SW-215") },
			{ id: "data-science-electives", label: "Data Science elective credits", type: "credits_from_courses", phase: "elective", minCredits: 8, courseCodes: groupCourseCodes("BI-314", "BI-405", "CS-315", "CS-341", "DS-352", "DS-375", "DS-485", "ESS-330", "ESS-335", "IT-307", "IT-308", "MA-341") },
			{ id: "data-science-capstone", label: "Data Science capstone", type: "all_of", phase: "capstone", fulfillsCapstone: true, courseCodes: groupCourseCodes("DS-420") },
		),
	},
	{
		name: "Mathematics",
		preferredPrefixes: ["MA", "CS", "DS", "PC", "EB"],
		catalogSource: "Juniata College Catalog 2025-2026, pp. 82-83",
		poeCreditTotal: "48 credits",
		minimumUpperLevelCredits: 18,
		notes: ["The catalog specifies at least 12 upper-level MA-prefix credits, excluding MA-480 Mathematics Seminar."],
		groups: categories(
			{ id: "mathematics-discrete", label: "Discrete structures requirement", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("MA-116", "CS-116") },
			{ id: "mathematics-core", label: "Mathematics core", type: "all_of", phase: "core", courseCodes: groupCourseCodes("MA-130", "MA-160", "MA-210", "MA-230", "MA-235", "CS-110", "MA-480") },
			{ id: "mathematics-statistics", label: "Statistics requirement", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("MA-205", "MA-220") },
			{ id: "mathematics-proof", label: "Proof-based mathematics", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("MA-350", "MA-360", "MA-370") },
			{ id: "mathematics-applied", label: "Applied mathematics", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("MA-303", "MA-321", "MA-322", "MA-325", "MA-335", "MA-341", "CS-341") },
			{ id: "mathematics-upper-level", label: "Upper-level Mathematics credits", type: "credits_from_courses", phase: "elective", minCredits: 6, courseCodes: groupCourseCodes("MA-303", "MA-321", "MA-322", "MA-325", "MA-335", "MA-341", "MA-350", "MA-355", "MA-360", "MA-370", "MA-399", "MA-485") },
			{ id: "mathematics-related", label: "Math/CS/DS/ABE/Physics related credits", type: "credits_from_courses", phase: "elective", minCredits: 6, courseCodes: groupCourseCodes("MA-303", "MA-321", "MA-322", "MA-325", "MA-335", "MA-341", "MA-350", "MA-355", "MA-360", "MA-370", "MA-399", "MA-485", "CS-300", "CS-315", "CS-330", "CS-362", "CS-370", "CS-399", "DS-352", "EB-320", "EB-321", "EB-341", "EB-463", "EB-465", "PC-301", "PC-320", "PC-321", "PC-340", "PC-350", "PC-402", "PC-410", "PC-430", "PC-491") },
			{ id: "mathematics-capstone", label: "Mathematics capstone", type: "choose_one", phase: "capstone", fulfillsCapstone: true, courseCodes: groupCourseCodes("MA-480", "MA-485") },
		),
	},
	{
		name: "Psychology",
		preferredPrefixes: ["PY", "MA", "BI", "ESK"],
		catalogSource: "Juniata College Catalog 2025-2026, p. 92",
		poeCreditTotal: "36-38 credits",
		minimumUpperLevelCredits: 18,
		groups: categories(
			{ id: "psychology-core", label: "Psychology core", type: "all_of", phase: "core", courseCodes: groupCourseCodes("PY-101", "PY-366") },
			{ id: "psychology-statistics", label: "Psychology statistics option", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("MA-205", "MA-220", "BI-305") },
			{ id: "psychology-applied", label: "Applied and professional breadth", type: "choose_n", phase: "core", count: 2, courseCodes: groupCourseCodes("PY-203", "PY-210", "PY-321", "PY-322", "PY-370", "PY-404") },
			{ id: "psychology-brain", label: "Brain and behavior breadth", type: "choose_n", phase: "core", count: 2, courseCodes: groupCourseCodes("PY-238", "PY-270", "PY-303", "PY-375", "PY-401", "PY-402", "PY-412", "ESK-303") },
			{ id: "psychology-social", label: "Social, developmental, and cultural breadth", type: "choose_n", phase: "core", count: 2, courseCodes: groupCourseCodes("PY-202", "PY-205", "PY-211", "PY-302", "PY-350", "PY-312") },
			{ id: "psychology-electives", label: "Psychology electives", type: "choose_n", phase: "elective", count: 2, courseCodes: groupCourseCodes("PY-190", "PY-199", "PY-202", "PY-203", "PY-205", "PY-210", "PY-211", "PY-216", "PY-238", "PY-270", "PY-299", "PY-302", "PY-303", "PY-304", "PY-312", "PY-321", "PY-322", "PY-340", "PY-341", "PY-350", "PY-370", "PY-375", "PY-399", "PY-401", "PY-402", "PY-404", "PY-412", "PY-495") },
			{ id: "psychology-capstone", label: "Psychology capstone", type: "all_of", phase: "capstone", fulfillsCapstone: true, courseCodes: groupCourseCodes("PY-415") },
		),
	},
	{
		name: "Biology",
		aliases: ["Biological Sciences", "Zoology"],
		preferredPrefixes: ["BI", "CH", "PC", "ESS", "MA", "ND"],
		catalogSource: "Juniata College Catalog 2025-2026, pp. 47-48",
		poeCreditTotal: "52-58 credits",
		minimumUpperLevelCredits: 18,
		notes: ["The catalog notes that POEs using Biology, Biological Science(s), or Zoology must meet the Biology designated POE requirements."],
		groups: categories(
			{ id: "biology-core", label: "Biology core", type: "all_of", phase: "core", courseCodes: groupCourseCodes("BI-101", "BI-102", "BI-209", "BI-289") },
			{ id: "biology-chemistry", label: "Chemistry core", type: "all_of", phase: "core", courseCodes: groupCourseCodes("CH-142", "CH-143", "CH-144", "CH-145", "CH-232", "CH-233") },
			{
				id: "biology-physics",
				label: "Physics core sequence",
				type: "one_bundle",
				phase: "core",
				bundles: [
					{ id: "physics-general", label: "General Physics sequence", courseCodes: groupCourseCodes("PC-200", "PC-200L", "PC-201", "PC-201L") },
					{ id: "physics-intro", label: "Intro Physics sequence", courseCodes: groupCourseCodes("PC-202", "PC-202L", "PC-203", "PC-203L") },
				],
			},
			{ id: "biology-quantitative", label: "Quantitative core", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("MA-100", "MA-130", "BI-305") },
			{ id: "biology-writing", label: "Writing in Biology", type: "choose_one", phase: "core", courseCodes: groupCourseCodes("BI-314", "BI-315") },
			{ id: "biology-mentored", label: "Mentored experience", type: "credits_from_courses", phase: "elective", minCredits: 3, courseCodes: groupCourseCodes("BI-380", "BI-384", "BI-489", "BI-490", "BI-495", "BI-TUT", "ED-450", "ED-451", "HP-300", "HP-490", "HP-495") },
			{ id: "biology-molecular", label: "Molecular and cellular biology", type: "credits_from_courses", phase: "core", minCredits: 3, courseCodes: groupCourseCodes("BI-316", "BI-317", "BI-318", "BI-331", "BI-332", "BI-340", "BI-405", "BI-437", "BI-444", "BI-450", "BI-470", "BI-471", "BI-472", "BI-481", "CH-312", "CH-418") },
			{ id: "biology-organismal", label: "Organismal biology", type: "credits_from_courses", phase: "core", minCredits: 3, courseCodes: groupCourseCodes("BI-310", "BI-317", "BI-318", "BI-323", "BI-324", "BI-327", "BI-333", "BI-340", "BI-350", "BI-351", "BI-360", "BI-361", "BI-362", "BI-367", "BI-368", "BI-370", "BI-417", "PC-317") },
			{ id: "biology-ecology", label: "Ecology and evolution", type: "credits_from_courses", phase: "core", minCredits: 3, courseCodes: groupCourseCodes("BI-300", "BI-301", "BI-312", "BI-325", "BI-326", "BI-339", "BI-344", "BI-362", "BI-384", "BI-432", "BI-437", "BI-471", "ESS-325", "ESS-328") },
			{ id: "biology-capstone", label: "Biology capstone", type: "all_of", phase: "capstone", fulfillsCapstone: true, courseCodes: groupCourseCodes("ND-498") },
		),
	},
];

const profileMap = new Map<string, PoeRequirementProfile>();

for (const profile of profiles) {
	profileMap.set(normalizeKey(profile.name), profile);
	for (const alias of profile.aliases || []) {
		profileMap.set(normalizeKey(alias), profile);
	}
}

export function getPoeRequirementProfile(poe: string): PoeRequirementProfile | null {
	const normalized = normalizeKey(poe);
	if (!normalized) {
		return null;
	}

	const exact = profileMap.get(normalized);
	if (exact) {
		return exact;
	}

	for (const [key, profile] of profileMap.entries()) {
		if (normalized.includes(key) || key.includes(normalized)) {
			return profile;
		}
	}

	return null;
}

export function getPoeCapstoneCourseCodes(profile: PoeRequirementProfile): Set<string> {
	const codes = new Set<string>();

	for (const group of profile.groups) {
		if (!group.fulfillsCapstone && group.phase !== "capstone") {
			continue;
		}

		switch (group.type) {
			case "all_of":
			case "choose_one":
			case "choose_n":
			case "credits_from_courses":
				for (const code of group.courseCodes) {
					codes.add(normalizeCourseCode(code));
				}
				break;
			case "choose_n_from_prefixes":
			case "credits_from_prefixes":
				break;
			case "one_bundle":
				for (const bundle of group.bundles) {
					for (const code of bundle.courseCodes) {
						codes.add(normalizeCourseCode(code));
					}
				}
				break;
		}
	}

	return codes;
}

export function evaluatePoeRequirements(
	profile: PoeRequirementProfile,
	completedCourses: PoeCourseLike[],
	plannedCourses: PoeCourseLike[] = []
): PoeEvaluation {
	const completedMap = buildCourseMap(completedCourses);
	const plannedMap = buildCourseMap(plannedCourses);
	const items = profile.groups.map((group) => evaluateGroup(group, completedMap, plannedMap));
	const coreItems = items.filter((item) => item.phase === "core");
	const capstoneItems = items.filter((item) => item.phase === "capstone");
	const coreCompletionRatio = coreItems.length === 0
		? 0
		: coreItems.reduce((sum, item) => sum + item.progressRatio, 0) / coreItems.length;
	const capstoneReadiness = capstoneItems.length === 0
		? coreCompletionRatio
		: Math.min(1, (coreCompletionRatio * 0.85) + (capstoneItems.reduce((sum, item) => sum + item.progressRatio, 0) / capstoneItems.length * 0.15));

	return {
		profile,
		items,
		coreCompletionRatio,
		capstoneReadiness,
	};
}

export function scoreCourseForPoe(
	course: PoeCourseLike,
	evaluation: PoeEvaluation
): {
	score: number;
	reasons: string[];
} {
	let score = 0;
	const reasons: string[] = [];

	for (const [index, group] of evaluation.profile.groups.entries()) {
		const item = evaluation.items[index];
		if (!item || !courseMatchesGroup(group, course)) {
			continue;
		}

		if (item.status === "complete") {
			if (group.type === "choose_one" || group.type === "one_bundle" || group.phase === "capstone" || group.fulfillsCapstone) {
				score -= 140;
			}
			continue;
		}

		if ((group.phase === "capstone" || group.fulfillsCapstone) && evaluation.capstoneReadiness < 0.55) {
			score -= 60;
			continue;
		}

		score += getMatchBonus(group);
		reasons.push(getMatchReason(group));
	}

	return {
		score,
		reasons: [...new Set(reasons)],
	};
}
