import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] || "/Users/rmsmith/Downloads/Faculty Directory | Juniata College.html";
const outputPath = process.argv[3] || path.join(process.cwd(), "data", "professors.json");

function decodeHtml(value) {
	return String(value || "")
		.replace(/&amp;/g, "&")
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&nbsp;/g, " ")
		.replace(/&ndash;/g, "-")
		.replace(/&mdash;/g, "-")
		.replace(/&rsquo;/g, "'")
		.replace(/&lsquo;/g, "'")
		.replace(/&ldquo;/g, '"')
		.replace(/&rdquo;/g, '"')
		.replace(/&eacute;/g, "e")
		.replace(/&auml;/g, "a")
		.replace(/&uuml;/g, "u")
		.replace(/&ouml;/g, "o")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function normalizeName(value) {
	return decodeHtml(value)
		.replace(/\b(Dr\.?|Professor|Prof\.?)\s+/gi, "")
		.replace(/\s+\([^)]*\)$/, "")
		.replace(/\s+/g, " ")
		.trim();
}

function inferDepartmentFromTitles(titles) {
	for (const raw of titles) {
		const title = decodeHtml(raw);
		let match = title.match(/\b(?:Assistant|Associate|Adjunct|Visiting)?\s*Professor\s+of\s+(.+)$/i);
		if (match) return match[1].trim();

		match = title.match(/\b(?:Instructor|Lecturer|Scholar|Chair|Director|Coordinator|Dean|Provost)\s+(?:of|in)\s+(.+)$/i);
		if (match) return match[1].trim();
	}

	return "Unknown";
}

const html = fs.readFileSync(inputPath, "utf8");

// Ignore emeriti section; this keeps only active faculty from this page.
const emeritiStart = html.search(/<h4[^>]*>\s*Emeriti Faculty\s*<\/h4>/i);
const activeHtml = emeritiStart > 0 ? html.slice(0, emeritiStart) : html;

const rows = [...activeHtml.matchAll(/<div class="row" style="margin-bottom: 3em;">([\s\S]*?)<\/div>\s*<\/div>/g)];
const professorsByName = new Map();

for (const row of rows) {
	const chunk = row[1];

	const nameMatch = chunk.match(/<h4 class="name">([\s\S]*?)<\/h4>/i);
	if (!nameMatch) {
		continue;
	}

	const cleanName = normalizeName(nameMatch[1].replace(/<a[\s\S]*?<\/a>/gi, " "));
	const nameParts = cleanName.split(/\s+/).filter(Boolean);
	if (nameParts.length < 2) {
		continue;
	}

	const firstName = nameParts.slice(0, -1).join(" ");
	const lastName = nameParts[nameParts.length - 1];

	const bioMatch = chunk.match(/<a class="biography[^>]*href="([^"]+)"/i);
	const biographyUrl = bioMatch ? bioMatch[1].trim() : "";
	const headshotMatch = chunk.match(/<img class="circular_image"[^>]*src="([^"]+)"/i);
	const rawHeadshotUrl = headshotMatch ? headshotMatch[1].trim() : "";
	const headshotUrl = rawHeadshotUrl.startsWith("http")
		? rawHeadshotUrl
		: rawHeadshotUrl
			? `https://www.juniata.edu${rawHeadshotUrl.startsWith("/") ? "" : "/"}${rawHeadshotUrl}`
			: "";

	const titleListMatch = chunk.match(/<ul class="intro title">([\s\S]*?)<\/ul>/i);
	const titles = titleListMatch
		? [...titleListMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((match) => decodeHtml(match[1])).filter(Boolean)
		: [];

	const phoneMatch = chunk.match(/href="tel:([^"]+)"/i);
	const emailMatch = chunk.match(/href="mailto:([^"]+)"/i);
	const phone = phoneMatch ? decodeHtml(phoneMatch[1]) : "";
	const email = emailMatch ? decodeHtml(emailMatch[1]).toLowerCase() : "";

	const department = inferDepartmentFromTitles(titles);
	const key = `${firstName} ${lastName}`.toLowerCase();

	if (!professorsByName.has(key)) {
		professorsByName.set(key, {
			firstName,
			lastName,
			department,
			primaryTitle: titles[0] || "",
			titles,
			email,
			phone,
			biographyUrl,
			headshotUrl,
			source: "https://www.juniata.edu/academics/provost/faculty-directory.php",
		});
	}
}

const professors = [...professorsByName.values()].sort((a, b) => {
	const lastCmp = a.lastName.localeCompare(b.lastName);
	if (lastCmp !== 0) return lastCmp;
	return a.firstName.localeCompare(b.firstName);
});

fs.writeFileSync(outputPath, JSON.stringify(professors, null, 2) + "\n");

console.log(`Wrote ${professors.length} active faculty records to ${outputPath}`);
