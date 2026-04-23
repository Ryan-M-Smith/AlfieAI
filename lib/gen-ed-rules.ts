export type RequirementCategoryId =
	| "creative_expression"
	| "formal_reasoning"
	| "humanistic_thought"
	| "scientific_process"
	| "social_inquiry"
	| "ethical_responsibility"
	| "global_engagement"
	| "local_engagement"
	| "us_experience"
	| "connections"
	| "fyc"
	| "fyf"
	| "fys"
	| "capstone";

export type EntryType = "continuing" | "first-year" | "transfer";
export type StudyAbroadStatus = "none" | "semester" | "year";
export type DualDegreeStatus = "none" | "domestic" | "abroad";

export type RequirementCounts = Record<RequirementCategoryId, number>;

export const WK_CATEGORIES: RequirementCategoryId[] = [
	"creative_expression",
	"formal_reasoning",
	"humanistic_thought",
	"scientific_process",
	"social_inquiry",
];

export const SW_CATEGORIES: RequirementCategoryId[] = [
	"ethical_responsibility",
	"global_engagement",
	"local_engagement",
	"us_experience",
];

export const FIXED_REQUIREMENT_ORDER: RequirementCategoryId[] = [
	"fyc",
	"fyf",
	"fys",
	"connections",
	"capstone",
];

export const CATEGORY_LABELS: Record<RequirementCategoryId, string> = {
	creative_expression: "Creative Expression",
	formal_reasoning: "Formal Reasoning",
	humanistic_thought: "Humanistic Thought",
	scientific_process: "Scientific Process",
	social_inquiry: "Social Inquiry",
	ethical_responsibility: "Ethical Responsibility",
	global_engagement: "Global Engagement",
	local_engagement: "Local Engagement",
	us_experience: "U.S. Experience",
	connections: "Connections",
	fyc: "First-Year Composition",
	fyf: "First-Year Foundations",
	fys: "First-Year Seminar",
	capstone: "Capstone",
};

export function createRequirementCounts(): RequirementCounts {
	return {
		creative_expression: 0,
		formal_reasoning: 0,
		humanistic_thought: 0,
		scientific_process: 0,
		social_inquiry: 0,
		ethical_responsibility: 0,
		global_engagement: 0,
		local_engagement: 0,
		us_experience: 0,
		connections: 0,
		fyc: 0,
		fyf: 0,
		fys: 0,
		capstone: 0,
	};
}

export function getBaseRequirementCounts(): RequirementCounts {
	return {
		creative_expression: 1,
		formal_reasoning: 1,
		humanistic_thought: 1,
		scientific_process: 1,
		social_inquiry: 1,
		ethical_responsibility: 1,
		global_engagement: 2,
		local_engagement: 1,
		us_experience: 1,
		connections: 1,
		fyc: 1,
		fyf: 1,
		fys: 1,
		capstone: 1,
	};
}

export function isWkCategory(category: RequirementCategoryId): boolean {
	return WK_CATEGORIES.includes(category);
}

export function isSwCategory(category: RequirementCategoryId): boolean {
	return SW_CATEGORIES.includes(category);
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

const requirementAliases: Record<string, RequirementCategoryId> = {
	"creative expression": "creative_expression",
	"formal reasoning": "formal_reasoning",
	"humanistic thought": "humanistic_thought",
	"scientific process": "scientific_process",
	"social inquiry": "social_inquiry",
	"ethical responsibility": "ethical_responsibility",
	"global engagement": "global_engagement",
	"local engagement": "local_engagement",
	"u s experience": "us_experience",
	"us experience": "us_experience",
	"u.s. experience": "us_experience",
	"connections": "connections",
	"first year composition": "fyc",
	"first year foundations": "fyf",
	"first year seminar": "fys",
	"capstone": "capstone",
};

export function normalizeRequirementLabel(value: string): RequirementCategoryId | null {
	const normalized = normalizeKey(value);
	if (requirementAliases[normalized]) {
		return requirementAliases[normalized];
	}

	for (const [alias, category] of Object.entries(requirementAliases)) {
		if (normalized.includes(alias)) {
			return category;
		}
	}

	return null;
}

export function getStepDownWaivers(incomingCredits: number): {
	wkWaivers: number;
	swWaivers: number;
} {
	if (incomingCredits >= 60) {
		return { wkWaivers: 3, swWaivers: 3 };
	}

	if (incomingCredits >= 48) {
		return { wkWaivers: 3, swWaivers: 2 };
	}

	if (incomingCredits >= 36) {
		return { wkWaivers: 2, swWaivers: 1 };
	}

	if (incomingCredits >= 24) {
		return { wkWaivers: 1, swWaivers: 1 };
	}

	if (incomingCredits >= 12) {
		return { wkWaivers: 0, swWaivers: 1 };
	}

	return { wkWaivers: 0, swWaivers: 0 };
}

export function getFirstYearExperienceWaivers(options: {
	entryType: EntryType;
	incomingCredits: number;
	incomingCompositionCredits: number;
}): RequirementCategoryId[] {
	const waivers: RequirementCategoryId[] = [];
	const compositionCredits = Math.max(0, options.incomingCompositionCredits);

	if (options.entryType === "first-year") {
		if (compositionCredits >= 6) {
			waivers.push("fyc");
		}

		return waivers;
	}

	if (options.entryType !== "transfer") {
		return waivers;
	}

	if (options.incomingCredits >= 24) {
		return ["fyc", "fys"];
	}

	if (compositionCredits >= 6) {
		return ["fyc", "fys"];
	}

	if (compositionCredits >= 3) {
		return ["fyc"];
	}

	return waivers;
}

function categories(...values: RequirementCategoryId[]): RequirementCategoryId[] {
	return values;
}

const poeWaiverEntries: Array<[string, RequirementCategoryId[]]> = [
	["Accounting", categories("social_inquiry")],
	["Art History and Museum Studies", categories("humanistic_thought")],
	["Biochemistry", categories("scientific_process", "formal_reasoning")],
	["Biology", categories("scientific_process", "formal_reasoning")],
	["Biology and Secondary Education", categories("scientific_process", "formal_reasoning")],
	["Business Analytics", categories("social_inquiry")],
	["Business Information Technology", categories("social_inquiry", "formal_reasoning")],
	["Chemistry", categories("scientific_process", "formal_reasoning")],
	["Chemistry and Secondary Education", categories("scientific_process", "formal_reasoning")],
	["Civil Engineering", categories("scientific_process", "formal_reasoning")],
	["Communication", categories("humanistic_thought", "social_inquiry")],
	["Communication Advocacy", categories("creative_expression", "humanistic_thought", "social_inquiry")],
	["Communication and Conflict Resolution", categories("social_inquiry")],
	["Computational Physics", categories("scientific_process", "formal_reasoning")],
	["Computer Science", categories("formal_reasoning")],
	["Criminal Justice", categories("scientific_process")],
	["Data Science", categories("formal_reasoning")],
	["Early Childhood Education", categories("social_inquiry")],
	["Early Childhood Education and Special Education", categories("social_inquiry")],
	["Earth and Space Science Secondary Education", categories("scientific_process")],
	["Economics", categories("social_inquiry")],
	["Ecology and Evolutionary Biology", categories("scientific_process", "formal_reasoning")],
	["Engineering Physics", categories("scientific_process", "formal_reasoning")],
	["English", categories("humanistic_thought")],
	["English Secondary Education", categories("humanistic_thought", "social_inquiry")],
	["Entrepreneurship", categories("social_inquiry")],
	["Environmental Chemistry", categories("scientific_process", "formal_reasoning")],
	["Environmental Economics", categories("scientific_process", "social_inquiry")],
	["Environmental Engineering", categories("scientific_process", "formal_reasoning")],
	["Environmental Geology", categories("scientific_process")],
	["Environmental Science", categories("scientific_process", "formal_reasoning")],
	["Environmental Studies", categories("scientific_process", "formal_reasoning")],
	["Exercise Science and Kinesiology", categories("scientific_process")],
	["Finance", categories("social_inquiry")],
	["Fisheries and Aquatic Sciences", categories("scientific_process", "formal_reasoning")],
	["General Science", categories("scientific_process")],
	["General Science and Secondary Education", categories("scientific_process", "formal_reasoning")],
	["Geology", categories("scientific_process")],
	["Genomics and Bioinformatics", categories("scientific_process", "formal_reasoning")],
	["Health Communication", categories("creative_expression", "humanistic_thought", "social_inquiry")],
	["Healthcare Administration", categories("social_inquiry")],
	["History", categories("humanistic_thought")],
	["History and Museum Studies", categories("humanistic_thought")],
	["Human Resource Management", categories("social_inquiry")],
	["Information Technology", categories("formal_reasoning")],
	["Integrated Media Arts", categories("creative_expression")],
	["International Business", categories("social_inquiry")],
	["International Politics", categories("humanistic_thought", "social_inquiry")],
	["International Studies", categories("social_inquiry")],
	["Legal Studies", categories("social_inquiry")],
	["Management", categories("social_inquiry")],
	["Marine Science Global", categories("scientific_process", "formal_reasoning")],
	["Marketing", categories("social_inquiry")],
	["Mathematics", categories("formal_reasoning")],
	["Mathematics and Secondary Education", categories("formal_reasoning")],
	["Media Studies and Production", categories("creative_expression", "humanistic_thought", "social_inquiry")],
	["Molecular Biology", categories("scientific_process", "formal_reasoning")],
	["Neuroscience", categories("scientific_process", "formal_reasoning")],
	["Nursing", categories("scientific_process", "formal_reasoning")],
	["Peace and Conflict Studies", categories("social_inquiry")],
	["Peace and Criminal Justice Studies", categories("social_inquiry")],
	["Philosophy", categories("humanistic_thought")],
	["Physics", categories("scientific_process", "formal_reasoning")],
	["Physics and Secondary Education", categories("scientific_process", "formal_reasoning")],
	["Politics", categories("humanistic_thought", "social_inquiry")],
	["Professional Writing", categories("humanistic_thought")],
	["Psychology", categories("scientific_process", "social_inquiry")],
	["Public Health", categories("scientific_process", "social_inquiry")],
	["Social Studies Secondary Education", categories("humanistic_thought", "social_inquiry")],
	["Social Work", categories("scientific_process")],
	["Spanish Education", categories("humanistic_thought")],
	["Spanish Hispanic Cultures", categories("humanistic_thought")],
	["Sport Management", categories("social_inquiry")],
	["Strategic Communication", categories("creative_expression", "humanistic_thought", "social_inquiry")],
	["Studio Arts", categories("creative_expression")],
	["Wildlife Conservation", categories("scientific_process", "formal_reasoning")],
];

const poeWaiverMap = new Map<string, RequirementCategoryId[]>(
	poeWaiverEntries.map(([poe, options]) => [normalizeKey(poe), options])
);

export const AVAILABLE_POES = [...new Set(poeWaiverEntries.map(([poe]) => poe))].sort((left, right) =>
	left.localeCompare(right)
);

export function getPoeWaiverOptions(poe: string): RequirementCategoryId[] {
	const normalized = normalizeKey(poe);
	if (!normalized) {
		return [];
	}

	const exact = poeWaiverMap.get(normalized);
	if (exact) {
		return exact;
	}

	for (const [key, options] of poeWaiverMap.entries()) {
		if (normalized.includes(key) || key.includes(normalized)) {
			return options;
		}
	}

	return [];
}

export function inferRequirementCategories(courseTypes: string[]): RequirementCategoryId[] {
	const normalized = new Set<RequirementCategoryId>();

	for (const courseType of courseTypes) {
		const category = normalizeRequirementLabel(courseType);
		if (category) {
			normalized.add(category);
		}
	}

	return [...normalized];
}
