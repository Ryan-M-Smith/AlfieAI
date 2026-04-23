# AlfieAI Development Guide

This guide covers local development, verification steps, and release-readiness checks.

## Prerequisites

- Node.js 24+
- pnpm 10+
- Access to required runtime credentials

## Install

```bash
pnpm install
```

## Run Locally

Start development mode:

```bash
pnpm dev
```

Build and run production mode locally:

```bash
pnpm build
pnpm start
```

## Environment Variables

Required for production-like runtime behavior:

- GEMINI_API_KEY
- MONGODB_CONNECTION_STRING
- EMBEDDING_MODEL_URL
- RESEND_API_KEY

Optional live voice override:

- GEMINI_LIVE_MODEL (default: gemini-live-2.5-flash-preview)

Reference template:

- .env.example

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

- pnpm install on a clean checkout
- pnpm lint completes without errors
- pnpm build succeeds
- Key API routes return expected status codes and valid JSON/text payloads
- AI-backed endpoints respond successfully with configured runtime credentials
- CHANGELOG.md updated for release version
