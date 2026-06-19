# APRI — Arewa Plant Research Intelligence
## Enterprise Architecture & Implementation Blueprint (v2.0)

> AI-powered, **Hausa-first** ethnobotanical, medicinal-plant, herbal-research, disease-knowledge, pharmacopoeia, market-intelligence, and digital-preservation platform. Initial focus: Northern Nigeria (Arewa). Designed to scale globally.

This document is the single source of truth for building APRI from scratch. It is implementation-grade: every section is meant to be directly actionable by engineers. It is intentionally exhaustive and covers all 22 functional modules and all 18 deliverables requested.

---

## 0. Table of Contents

1. Enterprise Architecture Diagram
2. System Design
3. Firestore Database Schema
4. API Architecture
5. Next.js Folder Structure
6. Firebase Configuration
7. Authentication System
8. RBAC System
9. AI Architecture (RAG)
10. UI/UX Wireframes
11. Component Library
12. Full Implementation Roadmap
13. Production Deployment Plan
14. Testing Strategy
15. Security Audit Plan
16. MVP Plan
17. Scaling Strategy
18. Complete Source Code Structure
- Appendix A: 22 Module Specifications
- Appendix B: Environment Variables
- Appendix C: Glossary

---

## 1. Enterprise Architecture Diagram

```
                                   ┌──────────────────────────────────────────┐
                                   │                 CLIENTS                    │
                                   │  Web (PWA)  •  Mobile PWA  •  Offline mode │
                                   │  Next.js 14 App Router / React 19 / TS     │
                                   └───────────────┬────────────────────────────┘
                                                   │  HTTPS / TLS 1.3
                                                   │
                        ┌──────────────────────────▼───────────────────────────┐
                        │                   EDGE / CDN (Vercel)                   │
                        │  SSR/ISR • Edge Middleware (authz, rate-limit, i18n)    │
                        │  Route Handlers (BFF API) • Image Optimization          │
                        └───────┬───────────────────────────────────┬────────────┘
                                │                                     │
            ┌───────────────────▼─────────────┐      ┌────────────────▼──────────────────┐
            │       FIREBASE (Google Cloud)     │      │           AI / ML LAYER            │
            │                                   │      │                                    │
            │  • Authentication (Identity Plat) │      │  • Gemini 2.5 (text reasoning)     │
            │  • Firestore (primary datastore)  │      │  • Gemini Vision (plant ID)        │
            │  • Cloud Storage (media)          │◄────►│  • Vertex AI Embeddings            │
            │  • Cloud Functions (2nd gen)      │      │  • Vector Search (Firestore KNN /  │
            │  • Remote Config / Messaging      │      │    Vertex Vector Search)           │
            │  • Analytics / App Check          │      │  • Speech-to-Text / Text-to-Speech │
            └───────┬───────────────────────────┘      └────────────────┬──────────────────┘
                    │                                                    │
        ┌───────────▼───────────┐                          ┌────────────▼─────────────┐
        │   ASYNC / PIPELINES    │                          │     EXTERNAL SOURCES       │
        │  • Pub/Sub topics      │                          │  • PubMed / journals       │
        │  • Cloud Scheduler     │                          │  • GBIF (biodiversity)     │
        │  • Embedding indexer    │                          │  • Market price feeds      │
        │  • ETL / ingest workers│                          │  • Maps / GIS tiles        │
        └────────────────────────┘                          └────────────────────────────┘

   Cross-cutting: Audit Logging • Cloud KMS encryption • IAM • Monitoring (Cloud Logging/Trace) •
                  Error Reporting (Sentry) • CI/CD (GitHub Actions) • Secret Manager
```

**Key architectural principles**
- **BFF (Backend-for-Frontend)**: Next.js Route Handlers act as the API gateway; clients never talk to Firestore directly for write-heavy or AI operations. Read-only public data may use Firestore client SDK with strict security rules.
- **Modular monorepo**: each of the 22 modules is an independent feature package with its own domain types, services, and UI, sharing a common core.
- **AI is a service boundary**: all model calls funnel through a single `ai-gateway` service for cost control, caching, auditing, and prompt governance.
- **Hausa-first i18n**: locale `ha` is the default; `en` is secondary. All content models store both languages.

---

## 2. System Design

### 2.1 Logical layers

| Layer | Responsibility | Tech |
|---|---|---|
| Presentation | Pages, components, PWA shell, offline cache | Next.js App Router, React 19, Tailwind, Shadcn, Framer Motion |
| Application (BFF) | Route handlers, validation, orchestration, authz | Next.js Route Handlers, Zod, Firebase Admin SDK |
| Domain | Business logic per module | TypeScript service classes, pure functions |
| AI Gateway | Prompt templates, RAG, embeddings, vision, voice | Vertex AI SDK, Gemini API |
| Data | Persistence, indexes, transactions | Firestore, Cloud Storage |
| Async | Ingestion, embedding, notifications | Cloud Functions, Pub/Sub, Scheduler |
| Platform | Auth, secrets, observability, deploy | Firebase Auth, Secret Manager, GitHub Actions, Vercel |

### 2.2 Request lifecycle (write path example: "create plant")

```
Client form (Zod-validated)
  → POST /api/plants  (Edge middleware: authn + rate-limit)
    → Route handler: re-validate w/ Zod, check RBAC (canCreate('plants'))
      → PlantService.create()  → Firestore transaction (plants + audit_logs)
        → Pub/Sub "plant.created"  → embedding worker → vector index upsert
      → Return 201 {id}
```

### 2.3 Offline / PWA strategy
- Service worker (Workbox via `next-pwa` or custom) caches app shell + last-viewed plant/disease docs.
- IndexedDB mirror (via `idb`) for read-only atlas data; queued writes replay when online.
- Firestore offline persistence enabled for authenticated reads.
- Background sync for contributor submissions made offline.

### 2.4 Non-functional targets
- P95 page TTFB < 400ms (ISR cached), AI response < 6s (streamed).
- 99.9% availability; RPO 24h (Firestore PITR), RTO < 1h.
- WCAG 2.1 AA accessibility; full Hausa localization.

---

## 3. Firestore Database Schema

Firestore is document-oriented; we model for **read efficiency** and **bounded documents**. Large/unbounded sub-data uses subcollections. Every document carries audit metadata.

### 3.1 Conventions
- All docs include: `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `version`, `status` (`draft|review|published|archived`).
- Bilingual fields use an object: `name: { ha: string, en: string }`.
- Denormalize display fields (e.g., `plantName`) onto related docs to avoid N+1 reads; keep canonical refs (`plantId`).

### 3.2 Collections

```
users/{userId}
  email, displayName, photoURL, role, locale, organization,
  reputation, isVerified, disabled, createdAt, lastLoginAt
  // role ∈ super_admin | researcher | practitioner | contributor | public

plants/{plantId}
  name: {ha, en}, scientificName, family, genus, synonyms[],
  habitat: {ha, en}, distribution: [{region, lat, lng, source}],
  description: {ha, en}, localUses: [{use, prep, partUsed, source}],
  preparationMethods: [{method:{ha,en}, steps:[...]}],
  conservationStatus,        // IUCN-like enum
  compoundIds[], diseaseIds[], imageIds[],
  searchKeywords[],          // lowercased tokens (ha+en+sci) for prefix search
  embeddingId,               // ref to embeddings/{id}
  status, audit...
  // subcollections:
  plants/{plantId}/observations/{obsId}   // GIS sightings
  plants/{plantId}/revisions/{revId}      // edit history snapshots

compounds/{compoundId}
  name:{ha,en}, class,       // alkaloid|flavonoid|tannin|saponin|glycoside|terpenoid
  formula, molecularWeight, smiles, casNumber,
  bioactivity:[{effect, evidenceLevel, refIds[]}],
  plantIds[], diseaseIds[], audit...

diseases/{diseaseId}
  name:{ha,en}, category, icd11Code,
  symptoms:[{ha,en}], riskFactors:[{ha,en}], prevention:[{ha,en}],
  description:{ha,en}, relatedPlantIds[], relatedCompoundIds[],
  disclaimerRequired:true, audit...

formulations/{formulationId}
  name:{ha,en}, authorId, ingredients:[{plantId, partUsed, quantity, unit}],
  preparation:{ha,en}, targetConditions[], analysis:{...}, visibility, audit...

monographs/{monographId}     // Hausa Pharmacopoeia
  plantId, title:{ha,en}, dosage:{ha,en}, safety:{ha,en},
  contraindications:[{ha,en}], interactions[], references[], approvedBy, audit...

references/{referenceId}     // literature
  type: journal|study|trial|book, title, authors[], year, doi, url,
  abstract, citationCount, plantIds[], compoundIds[], diseaseIds[], audit...

clinical_evidence/{evidenceId}
  referenceId, studyType: clinical_trial|experimental,
  population, intervention, outcome, evidenceLevel, plantIds[], audit...

market_data/{recordId}
  herbName:{ha,en}, plantId, region, market, price, currency, unit,
  date, source, trend, audit...

journals/{entryId}           // researcher journal/notes
  authorId, title, body, tags[], visibility, attachments[], audit...

museum/{itemId}              // digital museum
  title:{ha,en}, era, category, narrative:{ha,en}, mediaIds[], source, audit...

voice_sessions/{sessionId}
  userId, transcript, language, audioUrl, intent, responseText, durationMs, audit...

media/{mediaId}
  type: image|audio|video, storagePath, thumbnailPath, width, height,
  caption:{ha,en}, license, attribution, ownerId, plantId?, audit...

embeddings/{embeddingId}
  sourceType: plant|disease|compound|monograph|reference,
  sourceId, model, vector: <number[768]>, text, lang, updatedAt
  // If using Firestore Vector Search (KNN), vector is a Vector field.

audit_logs/{logId}
  actorId, action, resourceType, resourceId, before, after, ip, ua, at

analytics_events/{eventId}   // optional mirror of GA for in-app dashboards
  name, userId, props, at
```

### 3.3 Indexes (`firestore.indexes.json` highlights)
- `plants`: composite `(status ASC, family ASC, updatedAt DESC)`; `(status, searchKeywords array-contains, name.en ASC)`.
- `market_data`: `(plantId ASC, date DESC)`, `(region ASC, date DESC)`.
- `references`: `(plantIds array-contains, year DESC)`.
- `embeddings`: Vector index (KNN) on `vector`, `COSINE`, dimension 768, filter on `sourceType`.
- `audit_logs`: `(resourceType, resourceId, at DESC)`.

### 3.4 Validation
- **Client + BFF**: Zod schemas (single source, shared `packages/schemas`).
- **Server-of-record**: Firestore Security Rules enforce shape + RBAC (see §7/§8). Cloud Functions run deep validation (e.g., scientific name format, image MIME) on write triggers.

---

## 4. API Architecture

REST-ish Route Handlers under `app/api/**`, versioned via header `x-api-version`. All responses: `{ data?, error?, meta? }`. All inputs Zod-validated. AuthZ via middleware + per-route guard.

### 4.1 Endpoint catalogue (representative)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/plants` | public | list/search (query, family, region, pagination cursor) |
| GET | `/api/plants/:id` | public | plant detail |
| POST | `/api/plants` | contributor+ | create (→ review queue) |
| PATCH | `/api/plants/:id` | researcher+ | update |
| POST | `/api/plants/:id/publish` | researcher+ | publish |
| POST | `/api/identify` | auth | image → Gemini Vision plant ID |
| GET | `/api/compounds` / `:id` | public | phytochemicals |
| GET | `/api/diseases` / `:id` | public | disease profiles (+disclaimer) |
| POST | `/api/formulations` | practitioner+ | formulation builder |
| POST | `/api/formulations/analyze` | practitioner+ | formula analysis |
| GET | `/api/monographs/:id` | public | pharmacopoeia monograph |
| POST | `/api/ai/ask` | auth | RAG Q&A (streamed, Hausa) |
| POST | `/api/ai/summarize` | researcher+ | literature summarization |
| POST | `/api/voice/stt` | auth | speech→text (Hausa/En) |
| POST | `/api/voice/tts` | auth | text→speech |
| GET | `/api/market` | public | market prices/trends |
| GET | `/api/datasets/export` | researcher+ | CSV/XLSX/JSON/PDF export |
| GET | `/api/search` | public | unified semantic search |
| POST | `/api/admin/users/:id/role` | super_admin | role management |

### 4.2 Cross-cutting concerns
- **Rate limiting**: Edge middleware + Upstash Redis (or Firestore counter) — tiered by role.
- **Idempotency**: `Idempotency-Key` header on POST.
- **Pagination**: cursor-based (`startAfter` doc snapshot token).
- **Errors**: typed error codes (`APRI-XXXX`), never leak stack traces.
- **App Check**: enforce on all callable/AI endpoints to prevent abuse.

---

## 5. Next.js Folder Structure

```
apps/web/
  app/
    (marketing)/page.tsx
    (app)/
      layout.tsx                 # authed shell, sidebar, i18n provider
      dashboard/page.tsx
      atlas/[plantId]/page.tsx
      explorer/page.tsx
      identify/page.tsx
      pharmacopoeia/[id]/page.tsx
      diseases/[id]/page.tsx
      formulations/page.tsx
      research/page.tsx
      market/page.tsx
      museum/page.tsx
      map/page.tsx
      settings/page.tsx
    api/
      plants/route.ts
      plants/[id]/route.ts
      identify/route.ts
      ai/ask/route.ts
      ai/summarize/route.ts
      voice/stt/route.ts
      voice/tts/route.ts
      market/route.ts
      datasets/export/route.ts
      search/route.ts
      admin/users/[id]/role/route.ts
    layout.tsx                   # root, fonts, theme
    globals.css
  middleware.ts                  # authn, rate-limit, i18n, App Check
  next.config.mjs
  components.json                # shadcn
packages/
  ui/                            # shared component library (shadcn-based)
  schemas/                       # Zod schemas + TS types (shared client/server)
  core/                          # domain services, firebase admin, ai-gateway
    firebase/admin.ts
    firebase/client.ts
    ai/gemini.ts
    ai/embeddings.ts
    ai/rag.ts
    services/plant.service.ts
    services/disease.service.ts
    ... (one per module)
  config/                        # eslint, tsconfig, tailwind presets
functions/                       # Cloud Functions (2nd gen)
  src/index.ts
  src/triggers/onPlantWrite.ts
  src/pipelines/embeddingIndexer.ts
  src/scheduled/marketIngest.ts
infra/
  firestore.rules
  firestore.indexes.json
  storage.rules
  remoteconfig.template.json
.github/workflows/
  ci.yml
  deploy-web.yml
  deploy-firebase.yml
```

(Monorepo via pnpm workspaces + Turborepo.)

---

## 6. Firebase Configuration

`firebase.json`
```json
{
  "firestore": { "rules": "infra/firestore.rules", "indexes": "infra/firestore.indexes.json" },
  "storage":   { "rules": "infra/storage.rules" },
  "functions": [{ "source": "functions", "codebase": "default", "runtime": "nodejs20" }],
  "emulators": {
    "auth": {"port": 9099}, "firestore": {"port": 8080},
    "storage": {"port": 9199}, "functions": {"port": 5001}, "ui": {"enabled": true}
  }
}
```

Client init (`packages/core/firebase/client.ts`) reads `NEXT_PUBLIC_FIREBASE_*`. Admin init (`admin.ts`) uses a service account from Secret Manager (never committed). App Check with reCAPTCHA Enterprise on web.

---

## 7. Authentication System

- **Provider**: Firebase Authentication (Identity Platform). Methods: Email/Password, Google, Phone (OTP — important for low-email-penetration rural users).
- **Sessions**: Firebase ID token → exchanged for a secure, httpOnly **session cookie** (via `/api/auth/session`) so SSR/Route Handlers can authorize. Verified server-side with Admin SDK.
- **Custom claims**: `role`, `orgId`, `isVerified` set via Admin SDK on role change; drives both Security Rules and BFF guards.
- **Account lifecycle**: email verification, password reset, soft-disable, GDPR-style export/delete.
- **MFA**: optional TOTP/SMS for admins/researchers.

Middleware sketch:
```ts
// middleware.ts
const session = req.cookies.get('__session')?.value;
const decoded = session ? await verifySessionCookie(session) : null;
if (isProtected(path) && !decoded) return redirect('/login');
req.headers.set('x-user-role', decoded?.role ?? 'public');
```

---

## 8. RBAC System

### 8.1 Roles & capabilities

| Capability | super_admin | researcher | practitioner | contributor | public |
|---|---|---|---|---|---|
| Read published content | ✓ | ✓ | ✓ | ✓ | ✓ |
| Submit content (→review) | ✓ | ✓ | ✓ | ✓ | – |
| Edit/publish content | ✓ | ✓ | – | – | – |
| Clinical/monograph access | ✓ | ✓ | ✓ | – | – |
| Formulation builder | ✓ | ✓ | ✓ | – | – |
| Dataset export | ✓ | ✓ | – | – | – |
| AI research assistant | ✓ | ✓ | limited | limited | – |
| User & role management | ✓ | – | – | – | – |
| View audit logs | ✓ | – | – | – | – |

### 8.2 Enforcement (defense in depth)
1. **UI**: hide/disable controls by capability (`<Can do="plants:create">`).
2. **BFF guard**: `requireCapability(req, 'plants:publish')` per route.
3. **Security Rules**: source of truth for direct client reads/writes.

Security Rules excerpt:
```
function role() { return request.auth.token.role; }
function isStaff() { return role() in ['super_admin','researcher']; }
match /plants/{id} {
  allow read: if resource.data.status == 'published' || isStaff();
  allow create: if request.auth != null && incomingValid();
  allow update, delete: if isStaff();
}
match /audit_logs/{id} { allow read: if role()=='super_admin'; allow write: if false; }
```

---

## 9. AI Architecture (RAG)

### 9.1 Components
1. **Firestore** — canonical knowledge (plants, diseases, compounds, monographs, references).
2. **Embeddings** — Vertex AI `text-embedding-004` (768-dim) generated on write via Cloud Function; stored in `embeddings` with a Vector field.
3. **Vector Search** — Firestore KNN (`findNearest`, COSINE) for MVP; migrate to Vertex AI Vector Search at scale.
4. **Gemini 2.5** — reasoning/generation; **Gemini Vision** — plant identification; **Speech APIs** — Hausa voice.

### 9.2 RAG workflow
```
User question (Hausa or English)
  → detect language + normalize
  → embed query (Vertex embeddings)
  → semantic search (findNearest, top-k=8, filter by sourceType/region)
  → assemble grounded context (with citations)
  → Gemini 2.5 prompt: system(Hausa-first, cite sources, medical disclaimer)
  → stream answer in Hausa (or user locale) + source chips
  → log to voice_sessions/ai_logs for audit + analytics
```

### 9.3 Guardrails
- **Grounding only**: answers must cite retrieved docs; refuse/redirect when context is insufficient.
- **Medical safety**: Disease/clinical answers always prepend a non-diagnosis disclaimer; never give individualized dosing as medical advice.
- **Prompt governance**: versioned prompt templates in `packages/core/ai/prompts`; evaluated against a test set.
- **Cost/abuse**: caching of embeddings + frequent queries; App Check; per-role rate limits.

### 9.4 Plant identification (Vision)
```
Image upload → Storage (App Check) → /api/identify
  → Gemini Vision (structured output: name, scientificName, confidence, similar[])
  → cross-link to plants by scientificName → return medicinal uses + disclaimer
```

---

## 10. UI/UX Wireframes (textual)

**Theme**: Modern scientific, African-inspired. Palette: Green `#1B5E20`/`#2E7D32`, Gold `#C9A227`, White `#FFFFFF`, ink `#0F172A`. Typography: Inter + a display face; full RTL-safe, Hausa-aware.

- **Dashboard**: greeting (Hausa), quick search, "Identify a plant" CTA, recent plants, AI-usage + trending plants widgets, map preview.
- **Plant Explorer**: left filters (family, region, disease, compound, conservation), results grid w/ images, semantic search bar, save/compare.
- **Plant detail (Atlas)**: hero image gallery, bilingual names, taxonomy, uses, preparation, distribution map, related compounds/diseases, references, "Ask AI about this plant".
- **Identify**: camera/upload, live preview, result card (confidence meter, similar plants), uses + disclaimer.
- **Pharmacopoeia**: monograph reader (dosage, safety, contraindications), print/PDF.
- **Disease Engine**: profile (symptoms, risk, prevention), related herbs, persistent disclaimer banner.
- **Research Center**: AI assistant, literature explorer, dataset export, journal.
- **Market Intelligence**: price charts, region filters, trend indicators.
- **Museum**: timeline + media-rich cultural archive.
- **Settings**: language (Hausa default), theme, offline cache controls, account/MFA.

Wireframe references (low-fi) to be produced in Figma; component states (loading/empty/error) specified for each.

---

## 11. Component Library

Built on **Shadcn UI** primitives + Tailwind, packaged in `packages/ui`. Includes:
- Primitives: Button, Input, Select, Dialog, Sheet, Tabs, Card, Badge, Toast, Tooltip, DropdownMenu, Table, Pagination, Skeleton.
- Composites: `PlantCard`, `ConfidenceMeter`, `DistributionMap`, `BilingualField`, `CitationChip`, `DisclaimerBanner`, `AIChat`, `VoiceButton`, `RoleGate/<Can>`, `DataExportMenu`, `PriceTrendChart`, `ImageGallery`, `MonographReader`.
- Motion: Framer Motion presets (`fadeIn`, `slideUp`, page transitions), reduced-motion aware.
- a11y: focus management, ARIA, keyboard nav, color-contrast AA.

---

## 12. Full Implementation Roadmap

| Phase | Weeks | Scope |
|---|---|---|
| **0 Foundation** | 1–2 | Monorepo, CI, Firebase project, auth, RBAC, design system, i18n, emulators |
| **1 MVP Core** | 3–6 | Atlas (M1), Explorer (M2), Plant detail, Media library (M9), basic search, Disease Engine (M14, read) |
| **2 AI** | 7–9 | Embedding pipeline, RAG Q&A (M17/M22), Plant ID Vision (M3), Hausa voice (M21) |
| **3 Knowledge depth** | 10–12 | Phytochemical DB (M4/M16), Monographs/Pharmacopoeia (M13), Herb–Disease engine (M15), References + Clinical (M11/M12) |
| **4 Collaboration** | 13–15 | Formulation builder (M5), Traditional knowledge repo (M6), Research journal (M18), Dataset hub (M10) |
| **5 Intelligence & heritage** | 16–18 | GIS map (M7), Conservation (M8), Market intelligence (M20), Digital museum (M19), Knowledge graph (M22) |
| **6 Hardening** | 19–20 | Security audit, perf, accessibility, offline/PWA, load testing, launch |

---

## 13. Production Deployment Plan

- **Frontend**: Vercel (Production + Preview per PR). Edge middleware. ISR for content pages.
- **Backend**: Firebase (Firestore, Functions 2nd gen, Storage, Auth) via `firebase deploy`. Multi-region or `nam5`/`eur3` per audience.
- **CI/CD**: GitHub Actions — lint+typecheck+test on PR; deploy web to Vercel and rules/functions to Firebase on merge to `main` (with manual approval gate for prod).
- **Environments**: `dev`, `staging`, `prod` Firebase projects; Vercel env scoping. Secrets in GitHub Encrypted Secrets + Google Secret Manager.
- **Observability**: Cloud Logging/Trace, Sentry, uptime checks, budget alerts.
- **Rollback**: Vercel instant rollback; Firebase rules/functions versioned; Firestore PITR.

`deploy-firebase.yml` (sketch): checkout → auth via Workload Identity Federation → `firebase deploy --only firestore:rules,firestore:indexes,storage,functions`.

---

## 14. Testing Strategy

| Level | Tooling | Targets |
|---|---|---|
| Unit | Vitest | services, schemas, utils, prompt formatters |
| Component | React Testing Library | UI components, states |
| Integration | Firebase Emulator Suite | rules, functions, BFF routes |
| E2E | Playwright | golden paths: login, search, identify, ask-AI, export |
| Security rules | `@firebase/rules-unit-testing` | per-collection allow/deny matrix |
| AI eval | custom harness | RAG groundedness, Hausa quality, refusal/disclaimer checks |
| Accessibility | axe-core / Lighthouse | WCAG AA |
| Load | k6 | search + AI endpoints |

Coverage gate ≥ 80% on `core`/`schemas`. CI runs unit+component+rules on every PR; E2E on preview deploy.

---

## 15. Security Audit Plan

- **AuthZ**: verify defense-in-depth (UI/BFF/rules) for every collection; automated rules test matrix.
- **Data**: encryption at rest (Google-managed + CMEK via Cloud KMS for sensitive collections), TLS in transit, PII minimization, signed URLs for media.
- **API**: App Check enforcement, rate limiting, input validation (Zod), output encoding, idempotency, CORS allowlist.
- **Abuse prevention**: bot protection (reCAPTCHA Enterprise), per-role quotas, anomaly alerts on AI spend.
- **Secrets**: Secret Manager + GitHub OIDC (no long-lived keys); secret scanning in CI.
- **Audit**: immutable `audit_logs` (write-only via Functions), access reviews.
- **Compliance posture**: data residency choices, consent for contributed knowledge, attribution/licensing for indigenous knowledge (ethical data governance).
- **Pentest**: pre-launch external pentest + dependency/SCA scanning (Dependabot, `npm audit`), CodeQL.

---

## 16. MVP Plan

**Goal**: a usable Hausa-first plant knowledge app proving the core loop (discover → learn → ask AI).

**In scope**
- Auth (email/Google/phone) + roles (public, contributor, researcher, super_admin).
- Module 1 Atlas + Module 2 Explorer + Module 9 Image library.
- Module 14 Disease Engine (read-only, with disclaimer).
- Module 3 Plant ID (Gemini Vision) — basic.
- Module 17/22 AI RAG Q&A in Hausa over the seeded dataset.
- Seed dataset: ~100 Northern-Nigeria medicinal plants (curated).
- PWA install + offline read for atlas.

**Out of scope (post-MVP)**: market intelligence, museum, full pharmacopoeia, formulation analysis depth, knowledge graph UI, voice.

**Success metrics**: ≥100 plants live, AI groundedness ≥85% on eval set, P95 search < 800ms, 0 critical security findings.

---

## 17. Scaling Strategy

- **Data**: Firestore scales horizontally; design for sharded counters, avoid hot docs, use collection-group queries; archive cold data to BigQuery for analytics.
- **Vector search**: start Firestore KNN → migrate to **Vertex AI Vector Search** (ANN) when >1M vectors or latency-sensitive.
- **AI cost**: response + embedding caching, smaller models for routing, batch embedding, context trimming, regional endpoints.
- **Traffic**: Vercel edge + ISR; CDN for media; image optimization; HTTP caching headers.
- **Globalization**: add locales beyond `ha/en`; multi-region Firestore; per-region market/GIS data partitioning.
- **Org/multi-tenant**: `orgId` partitioning for universities/NGOs; usage quotas per tenant.
- **Analytics at scale**: stream events → BigQuery → Looker dashboards.

---

## 18. Complete Source Code Structure

See §5 for the tree. Build order of packages:
1. `packages/config` (tsconfig/eslint/tailwind presets)
2. `packages/schemas` (Zod + types) — shared contract
3. `packages/core` (firebase admin/client, ai-gateway, services)
4. `packages/ui` (component library)
5. `apps/web` (Next.js app consuming the above)
6. `functions` (triggers, pipelines, scheduled jobs)
7. `infra` (rules, indexes, remote config)

Conventions: pnpm workspaces + Turborepo, ESLint + Prettier, conventional commits, path aliases `@apri/*`.

---

## Appendix A — 22 Module Specifications

> Each module is an independent feature package: `data model (Firestore) · API · UI · AI hooks · RBAC`.

1. **Hausa Ethnobotanical Atlas** — `plants` collection; bilingual names, family, habitat, distribution, images, local uses, preparation. UI: browse + detail. RBAC: public read, contributor submit.
2. **Medicinal Plant Explorer** — advanced/semantic search by Hausa/scientific name, disease, compound; filters + facets; cursor pagination.
3. **Plant Identification AI** — Gemini Vision; input camera/upload; output name, scientific name, confidence, similar plants, uses; links to Atlas.
4. **Phytochemical Database** — `compounds` (alkaloids, flavonoids, tannins, saponins, glycosides, terpenoids); structure, bioactivity, plant/disease links.
5. **Herbal Formulation Builder** — recipe builder, ingredient matching against `plants`, formula analysis (compound overlap, safety flags). Practitioner+.
6. **Traditional Knowledge Repository** — oral knowledge, local practices, historical uses; contributor submissions with provenance/consent + attribution.
7. **Medicinal Plant Map** — GIS map (MapLibre/Mapbox) of plant locations & regional availability from `observations`/`distribution`.
8. **Conservation Intelligence** — threat status, rare species, sustainability metrics; dashboards + alerts; integrates IUCN/GBIF.
9. **Plant Image Library** — high-res archive in Cloud Storage (`media`); licensing/attribution; CDN delivery + responsive images.
10. **Research Dataset Hub** — export CSV/Excel/JSON/PDF with field selection + filters; researcher+; audited.
11. **Scientific Literature Explorer** — `references`; journals, studies, citations; PubMed/DOI ingest; link to plants/compounds/diseases.
12. **Clinical Evidence Repository** — `clinical_evidence`; trials/experimental studies with evidence levels.
13. **Hausa Pharmacopoeia** — `monographs`; auto-draft via AI from grounded sources, expert-approved; dosage, safety, contraindications, interactions.
14. **Disease Knowledge Engine** — `diseases`; symptoms, risk factors, prevention; **never diagnosis**; persistent disclaimer; related herbs.
15. **Herb–Disease Relationship Engine** — relationship graph among plants/compounds/conditions; powers recommendations + knowledge graph.
16. **Phytochemical Intelligence Engine** — advanced compound analysis (class distribution, bioactivity, co-occurrence), AI-assisted insights.
17. **AI Research Assistant** — summarization, citation generation, literature review over `references` via RAG; researcher+.
18. **Research Journal** — `journals`; publish notes, share findings, reports; visibility controls.
19. **Digital Museum** — `museum`; historical knowledge, heritage, cultural archives; media-rich, narrative timelines.
20. **Market Intelligence** — `market_data`; herb prices, trends, supply chains; scheduled ingestion; charts.
21. **Hausa Voice AI** — STT/TTS, voice search; Hausa + English; `voice_sessions`; accessibility for low-literacy users.
22. **APRI Knowledge Graph** — connect plants, diseases, compounds, regions, research; graph view + as RAG retrieval backbone.

Each module includes: Firestore shape, Zod schema, service methods, API routes, UI pages/components, AI hooks (if any), RBAC matrix entry, tests.

---

## Appendix B — Environment Variables

```
# Web (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
NEXT_PUBLIC_DEFAULT_LOCALE=ha

# Server (secret)
FIREBASE_SERVICE_ACCOUNT_JSON=     # or Workload Identity Federation
GOOGLE_CLOUD_PROJECT=
VERTEX_LOCATION=us-central1
GEMINI_API_KEY=                    # if using AI Studio key path
APP_CHECK_DEBUG_TOKEN=             # dev only
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
```

---

## Appendix C — Glossary

- **Arewa**: Hausa term for "the North" (Northern Nigeria).
- **Ethnobotany**: study of relationships between people and plants.
- **Monograph**: authoritative document on a single plant/drug (uses, dosage, safety).
- **RAG**: Retrieval-Augmented Generation.
- **BFF**: Backend-for-Frontend.
- **PITR**: Point-in-time recovery.

---

*End of blueprint. Implementation proceeds per the roadmap (§12), starting with Phase 0 foundation and the MVP scope (§16).*
