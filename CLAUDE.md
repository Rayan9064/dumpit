# CLAUDE.md — DumpIt

This file is the single source of truth for AI-assisted development on DumpIt.
Read this before writing any code, suggesting any feature, or making any architectural decision.

---

## What DumpIt Is

DumpIt is a personal knowledge vault with AI-powered retrieval, built toward a larger vision: **a portable layer of personal context that makes every AI interaction actually personal.**

The core loop today:
1. User saves something (a link, a note, a PDF)
2. User asks a question in natural language
3. DumpIt returns a cited answer grounded in what the user actually saved — not hallucinated from general knowledge

The vision it's building toward: over time, what a user saves, reads, and asks about builds a real, living picture of them — their interests, work, how they think and talk, what they care about now versus before. Answers get sharper and more personal because the system actually knows the person asking, not because it's a smarter generic model.

It is **not** a general-purpose chatbot. It is **not** a task manager. It is **not** an autonomous agent. It does **not** act on the user's behalf or impersonate them to others — it makes the user sharper, it does not replace them. This is a deliberate, permanent boundary, not a v1 limitation to relax later.

**One-line positioning (product):** "Save anything. Ask anything. Get answers from your own knowledge — not a stranger's AI."

**One-line positioning (vision):** "The layer of context that makes AI actually know you — once, portably, everywhere you use it."

---

## Who It's For

Primary persona: knowledge workers, developers, indie hackers, researchers, students — anyone who saves things online and later can't find, remember, or get real value back from them.

The Canva/Claude parallel is intentional: **simple enough for a non-technical user to start in 60 seconds, deep enough for a developer to plug into their own stack via MCP or API.**

Two user modes exist:
- **Consumer mode** — one-click save via browser extension, ask in plain English, get cited answers. No setup.
- **Power-user mode** — MCP server, API access, export, query from Claude Desktop or Cursor. Full control.

---

## Tech Stack

| Layer | What |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS — **Zinc palette** (bg-zinc-50 / dark:bg-zinc-950). Do not switch to Slate or Gray. |
| Typography | `Space Grotesk` (headings, badges, UI labels) + `Inter` (body, inputs) via `next/font/google` |
| Components | shadcn/ui |
| Auth | Google Auth only — email/password was deliberately removed. Do not re-add it. |
| Database | Firebase (Firestore) + Firebase Admin SDK for server-side ops |
| AI/Embeddings | Gemini (embeddings + generation). Model: `gemini-2.5-pro` via env var `GEMINI_MODEL` |
| Rate limiting | Upstash Redis |
| Error tracking | Sentry (client + edge middleware + server handlers) |
| Email | Resend + React Email |
| Pagination | Cursor-based. Do not revert to offset-based. |
| Payments | Dodo Payments (Merchant of Record — handles VAT/GST/global tax automatically) |
| Deployment | Vercel (frontend), Firebase (backend/db) |

---

## Environment Variables

```
# Firebase client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase admin (server only — never expose to browser)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-pro

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry
SENTRY_DSN=

# Resend (email — inbound save-by-email)
RESEND_API_KEY=
RESEND_INBOUND_WEBHOOK_SECRET=

# Dodo Payments
DODO_PAYMENTS_API_KEY=
DODO_WEBHOOK_SECRET=
```

---

## Repository Structure

```
app/                        Next.js App Router pages and API routes
  (auth)/                   Auth-gated routes
  api/                      API route handlers (server-side only)
    resources/              CRUD for saved items
    ai/                     Search + RAG "ask" endpoints
    webhooks/                Dodo Payments + Resend inbound-email webhooks
    settings/api-keys/      API key generate/list/revoke
  share/                    Mobile share-sheet capture page
  u/[username]/             Public user profile pages
dumpit-extension/           Chrome extension (separate package)
dumpit-mcp/                 MCP server for Claude/Cursor (separate package)
docs/                       Internal documentation
public/                     Static assets
types/                      Shared TypeScript types
```

---

## Core Features — Current State

| Feature | Status |
|---|---|
| Google Auth (sign in/out) | ✅ Live |
| Save links (URL fetch + metadata extraction) | ✅ Live |
| Save notes | ✅ Live |
| Tag organization | ✅ Live |
| Search & filter | ✅ Live |
| Public/private toggle per resource | ✅ Live |
| Public user profiles (`/u/[username]`) | ✅ Live |
| Social sharing (LinkedIn, Facebook) | ✅ Live |
| Edit resources | ✅ Live |
| AI-powered cited Q&A (RAG) | ✅ Live |
| Upstash rate limiting on AI routes | ✅ Live |
| Cursor-based pagination | ✅ Live |
| Sentry error monitoring | ✅ Live |
| Browser extension (one-click save) | ✅ Live |
| PDF upload + text extraction | ✅ Live |
| API keys + REST API access | ✅ Live |
| MCP server (query vault from Claude/Cursor) | ✅ Live — `dumpit-mcp/` |
| Dodo Payments integration | ✅ Live |
| Mobile share sheet (Android/PWA only — no iOS Web Share Target support) | 🔨 Built, needs manual PWA icon polish |
| Email-to-save (`save@dumpit.page`) | 🔨 Built — pending DNS + Resend dashboard setup (not yet reachable) |
| Weekly email digest (Resend) | 📋 Planned — not built despite earlier doc claim |
| Personal context / tone profile (shapes how answers are given) | 📋 Planned — v2, core to the vision |
| Portable context export (take your profile to other tools) | 📋 Planned — v3, long-term vision |

---

## V1 Scope — Do Not Expand Beyond This

V1 is complete when:
1. Browser extension ships (one-click save from any tab)
2. PDF upload and text extraction works
3. Dodo Payments is live (founding member plan: $9/mo, 50% off)
4. RAG-cited Q&A is sharp and reliable on real saved content
5. Real users (not fake numbers) are using and paying

**Do not add to v1 scope.** Every feature that isn't on this list is v2 or later.

---

## The Vision, Staged

- **v1 (now):** Capture + cited Q&A. Prove the core loop works and retains real users.
- **v2 (next):** Personal context/tone profile — DumpIt learns how the user writes, what they care about, and shapes *how it answers them* accordingly. This is the first real step toward "AI that knows you," and the layer that differentiates DumpIt from bare RAG tools.
- **v3 (later, only after v1/v2 prove retention):** Portability — the user's context isn't locked into DumpIt's own chat UI. It can be queried from Claude, Cursor, or other tools the user already uses (via MCP/API), so the value compounds wherever they work rather than requiring them to live inside DumpIt.
- **Never on the roadmap as currently scoped:** autonomous action on the user's behalf, or any feature that impersonates the user to other people. If this is ever revisited, it must be a deliberate, separate decision — not an incremental feature add.

---

## What Has Been Explicitly Ruled Out

These decisions were made deliberately. Do not reopen them without a strong reason.

### Authentication
- Email/password auth was removed. Google Auth only. Rationale: simpler onboarding, zero password-reset overhead.

### Autonomous agents / "act on my behalf"
- DumpIt answers questions and shapes answers around who the user is. It does not send emails, book things, or take irreversible actions on behalf of the user.
- This applies at every stage of the roadmap, not just v1. Reversibility is the line: answering, even personalized answering, is low-risk if imperfect; acting is not.

### Digital clone / impersonation
- DumpIt does not generate content that impersonates the user to other people, and never will under the current vision.
- The personal context/tone profile (v2) shapes *how DumpIt answers the user*, not how it represents the user externally. This is the core trust boundary of the whole product — do not blur it, even in service of a "wow" feature.

### OS-level integration
- Not a v1 or v2 item. The browser extension covers the majority of the capture use case with a fraction of the complexity.

### Fake social proof
- The landing page must not show fabricated user counts, fake testimonial avatars, or invented counters.
- Only show real numbers. If a number is zero, either omit it or show zero honestly.

### Offset-based pagination
- Already migrated to cursor-based. Do not revert.

---

## Competitive Context

| Competitor | What they are | Why DumpIt is different |
|---|---|---|
| Supermemory | Developer memory API/infrastructure | Dev-only, no consumer UX, requires engineering setup |
| Mem0 | Open-source memory layer for AI agents | Same — infrastructure, not a product |
| Hermes + OMI + Obsidian | Power-user second brain stack | 30-45 min technical setup, not consumer-friendly |
| Notion AI / Obsidian | Note-taking + AI | Organization-first, not retrieval-first; no capture layer |
| Orchid | Consumer AI assistant via text | Acting-on-your-behalf positioning, not knowledge retrieval; receiving backlash |
| Claude / ChatGPT memory | Native AI memory | Locked to one app, requires manual context-feeding, no capture layer; DumpIt's vision is to be the portable layer underneath all of these, not a competitor to any one of them |

**The gap DumpIt fills today:** retrieval-first, consumer-simple, with a developer escape hatch (MCP/API).

**The gap DumpIt is building toward:** a personal context layer that isn't locked into one AI app — portable, user-owned, and useful wherever the user chooses to work.

**The risk:** platform memory features (Claude Projects, ChatGPT Memory) are improving fast, and every major AI is racing toward "remembers you natively." The out-of-the-box simplicity moat is real but not permanent. Ship v1 fast, get real retention data, and let that data determine whether to push hard into the v2/v3 personalization-and-portability vision or treat this as a smaller, time-boxed product.

---

## Design System Rules

- **Color:** Zinc palette only. `bg-zinc-50` light, `bg-zinc-950` dark. High-contrast borders: `zinc-200` / `zinc-800`.
- **Typography:** `Space Grotesk` for headings, badges, UI labels. `Inter` for body copy, inputs, descriptions.
- **Theme toggle:** MagicUI-style animated circle reveal transition. Already implemented — don't replace it.
- **Components:** shadcn/ui primitives. Don't introduce a second component library.
- **Motion:** Subtle. This is a productivity tool, not a marketing site. Animations should feel fast, not showy.

---

## API Conventions

All list responses follow this shape:
```typescript
{
  data: T[],
  total: number,
  nextCursor: string | null,  // cursor-based pagination
  hasMore: boolean
}
```

Server-side API routes use Firebase Admin SDK. Client-side code uses the Firebase client SDK for auth only — all database operations go through API routes, never direct client Firestore access.

Rate-limited routes (anything calling Gemini) must check Upstash Redis before making the AI call. Pattern is in the existing `/api/search` route — follow it.

---

## Pricing

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | Limited saves, limited queries/month |
| Founding Member | $9/mo | 50% off forever, first 1000 members only |
| Regular | $18/mo | After founding member slots fill |

Payment processor: Dodo Payments (MoR — handles all global tax compliance automatically).

---

## Founder Context (for tone and decision-making)

- Solo founder: Rayan, Full Stack + UI/UX + blockchain developer, Forward Deployed Engineer at build.ai, Bangalore.
- Goal: ship something real, get paying users, build a credible product story (for YC application pipeline and potential acquisition).
- North star for this product: **real users, real retention, real revenue** — not metrics theater.
- Open source: the codebase is MIT licensed and public. This is intentional.
- Target market: US-facing, global reach.

---

## Git Workflow

- Claude may push directly to feature branches without asking each time.
- `main` always goes through a PR — never push directly to `main`.

---

## What Good Looks Like

A session is successful if:
- The core save→ask→cited-answer loop works reliably on real saved content
- A new user can be saving and querying within 3 minutes of signing up
- No feature outside v1 scope was added
- No fake numbers appear anywhere in the product or on the landing page
- Any personalization work strictly shapes *answers to the user*, never generates content *as* the user to others
- Code follows the existing zinc/Space Grotesk design system
- All Gemini calls go through rate-limited API routes, never client-side

---

*Last updated from claude.ai conversation context — August 2026.*
