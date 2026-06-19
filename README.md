# APRI — Arewa Plant Research Intelligence

Hausa-first, AI-powered platform for ethnobotany, medicinal plants, disease knowledge,
pharmacopoeia, and digital preservation — focused on Northern Nigeria and built to scale globally.

> Full architecture & design: see [`APRI_ENTERPRISE_BLUEPRINT.md`](./APRI_ENTERPRISE_BLUEPRINT.md).

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind, Shadcn-style UI, PWA
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)
- **AI**: Gemini (text + vision) and Vertex AI embeddings, with a RAG pipeline
- **Tooling**: pnpm workspaces + Turborepo, Vitest, ESLint, Prettier, GitHub Actions

## Monorepo layout

```
apps/web         Next.js application (UI + BFF API routes)
packages/schemas Zod schemas + shared TypeScript types
packages/core    Firebase (client/admin), AI gateway (RAG, embeddings, vision), domain services
packages/ui      Shared component library
packages/config  Shared ESLint / Tailwind presets
functions        Cloud Functions (triggers, scheduled jobs)
infra            Firestore rules + indexes, Storage rules
```

## Getting started

```bash
pnpm install
cp .env.example .env        # optional: app runs with seed data if unset
pnpm dev                    # http://localhost:3000  (redirects to /dashboard)
```

The app is **runnable without any credentials**: `@apri/core` falls back to a curated
seed dataset and deterministic offline embeddings so you can explore the UI and AI flows
before Firebase/Gemini are configured. Provide real config in `.env` to enable persistence
and live Gemini/Vertex AI.

## Scripts

```bash
pnpm lint        # ESLint across all packages
pnpm typecheck   # tsc across all packages
pnpm test        # Vitest unit tests
pnpm build       # Build all packages + the Next.js app
```

## Firebase / Vertex AI setup

See the "Production Deployment Plan" and Appendix B in the blueprint. In short:
create a GCP project, enable Firestore/Auth/Storage + the Vertex AI / Generative Language
API, drop the values into `.env`, then `firebase deploy --only firestore:rules,firestore:indexes,storage,functions`.

## Status

MVP foundation (Phase 0–2): Atlas, Explorer, Plant detail, Disease Engine, Plant ID (Vision),
RAG Q&A, auth/session + RBAC scaffolding. Remaining modules are tracked in the blueprint roadmap.
