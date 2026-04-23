# Transcript Parser Prompt

This document captures the current prompts used in `lib/transcript-parser.ts`.

## Prompt A: PDF -> Structured JSON (AI-first)

Use this prompt with the uploaded PDF passed as inline `application/pdf` data.

```text
You are parsing a Self-Service Degree Progress PDF for scheduling.
Read the PDF directly, including OCR if needed.
Return JSON only with this exact shape:
{"completed":[{"term":"","courseCode":"","title":"","credits":"","grade":""}],"planned":[{"term":"","courseCode":"","title":""}],"transfer":[{"term":"","courseCode":"","title":"","credits":""}],"requirements":[{"label":"","status":""}],"poeSections":[{"label":"","courses":[{"courseCode":"","title":"","status":"","grade":"","term":"","credits":""}]}]}
Rules:
- Preserve course suffixes exactly when visible (e.g. BI-305CW, CS-255C).
- Use completed for final/earned-credit courses.
- Use planned for in-progress or non-final courses.
- Use transfer for AP/transfer/test credit.
- requirements should contain an entry for EVERY gen-ed and core requirement section visible in the PDF. Use the exact section label (e.g. "First-Year Composition", "Humanistic Thought", "Global Engagement", "Capstone") as the label field.
- Valid requirement status values: completed, waived, in-progress, pending, or unknown.
- Use "waived" when the section is marked Waived or fulfilled via Noncourse Equivalency.
- Use "completed" when the section shows all required courses/credits completed (e.g. "1 of 1 Completed" or "3 of 3 Credits Completed").
- poeSections: For EVERY named POE/program-of-emphasis requirement section in the PDF (e.g. "Data Science Core", "Data Science Elective Credits", "Computer Science Core Requirements"), include the section label and ALL courses listed in its requirement table. The label MUST always include the parent program name — if the PDF section heading is just "Core Requirements", "Elective Courses", or "Capstone" nested under a "Data Science" heading, use "Data Science Core Requirements", "Data Science Elective Courses", "Data Science Capstone". Strip any leading letter prefix like "A." but never strip the program name. For each course record the exact courseCode, title, status (completed/in_progress/remaining), grade, term, and credits as shown in the table.
- If unreadable, return empty arrays for all keys.
```

### Expected Model Input Shape

```json
[
  {
    "role": "user",
    "parts": [
      { "text": "<prompt text above>" },
      {
        "inlineData": {
          "mimeType": "application/pdf",
          "data": "<base64_pdf_bytes>"
        }
      }
    ]
  }
]
```

## Prompt B: Extracted JSON -> Line-Oriented Records

Use this prompt when local extraction produced transcript JSON and you want line records for downstream deterministic parsing.

```text
You are helping a college schedule planner read transcript JSON extracted from a Self-Service Degree Progress PDF.
Convert the JSON into strict line-oriented records for downstream rule-based parsing.
Do not summarize and do not invent courses.
Output only lines in one of these formats:
COMPLETED | <Term> | <CourseCode> | <CourseTitle> | <Credits> | <Grade>
PLANNED | <Term> | <CourseCode> | <CourseTitle>
TRANSFER | <Term> | <CourseCodeOrLabel> | <CourseTitle> | <Credits>
REQUIREMENT | <RequirementLabel> | <Status>
Use COMPLETED for classes with earned credit or final grades.
Use PLANNED for in-progress or non-final classes.
Use TRANSFER for AP, placement, or transfer credit.
For requirement status, use completed, pending, in-progress, or unknown.
Normalize term labels to Spring Term YYYY, Summer Term YYYY, or Fall Term YYYY when visible.
Preserve course suffixes exactly when present, e.g. BI-305CW, CS-255C.
If no readable transcript content is available, output exactly: UNREADABLE TRANSCRIPT
Transcript JSON starts now:
<payload_json_here>
```

## Output Contract Summary

- `COMPLETED` includes term, course code, title, credits, grade.
- `PLANNED` includes term, course code, title.
- `TRANSFER` includes term, code/label, title, credits.
- `REQUIREMENT` includes requirement label and status.
- No markdown fences in model output.
- No prose summaries.
