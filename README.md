# AlfieAI

## The AI expert on Juniata College

AlfieAI is a Next.js application that provides AI-assisted tools for Juniata College students, including:

- Chat assistance for general Juniata questions
- Course catalog exploration
- Schedule generation with degree-progress context
- Professor discovery and summaries
- People and events assistants

The project currently runs on Gemini-backed models and MongoDB data sources.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- MongoDB
- HeroUI + Tailwind CSS
- ESLint 9 (flat config)

## Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Start development server:

```bash
pnpm dev
```

3. Build and run production mode locally:

```bash
pnpm build
pnpm start
```

## Quality Verification

Run lint checks:

```bash
pnpm lint
```

Run a production build:

```bash
pnpm build
```

## API Smoke Test Examples

Planner options:

```bash
curl -sS http://localhost:3000/api/courses/planner-options
```

Catalog search:

```bash
curl -sS -X POST http://localhost:3000/api/courses/catalog \
	-H "Content-Type: application/json" \
	-d '{"query":"","page":1,"pageSize":5,"filters":{}}'
```

Professors search:

```bash
curl -sS -X POST http://localhost:3000/api/courses/professors \
	-H "Content-Type: application/json" \
	-d '{"query":"","page":1,"pageSize":6}'
```

## Release Checklist

- `pnpm install` on a clean checkout
- `pnpm lint` completes without errors
- `pnpm build` succeeds
- Key API routes return expected status codes and valid JSON/text payloads
- AI-backed endpoints respond successfully with configured runtime credentials
- `CHANGELOG.md` updated for release version
