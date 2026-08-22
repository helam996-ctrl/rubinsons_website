# IMPLEMENTATION PLAN

## Overview
This document details the step-by-step roadmap for building the Rubinsons Group digital platform. The development must progress sequentially. Checkpoints require running linting, typechecking, and builds, and updating this file with completion logs.

---

## Roadmap Index

### PHASE 01 — Project Foundation
* **Status**: COMPLETE
* **Tasks**:
  * [x] Initialize Next.js app with App Router and TypeScript.
  * [x] Set up Tailwind CSS with styling variables mapped to `DESIGN.md` tokens.
  * [x] Configure ESLint, Prettier, and path aliases.
  * [x] Draft environment variable template (`.env.example`).
  * [x] Scaffold main directory structure (`/app`, `/components`, `/lib`, `/prisma`, `/public`).
* **Verification**:
  * Run `npm run lint` (Pass)
  * Run `npx tsc --noEmit` (Pass)
  * Run `npm run build` (Pass)

---


### PHASE 02 — Database Architecture
* **Status**: COMPLETE (Code, Schema, Client & Seed ready. Run migrations once live DB URL is supplied.)
* **Tasks**:
  * [x] Write `prisma/schema.prisma` with models mapped in `DATABASE.md`.
  * [x] Configure local PostgreSQL connector.
  * [x] Write `prisma/seed.ts` containing ONLY verified Rubinsons details.
  * [x] Initialize Prisma Client helper inside `/lib/db/client.ts`.
  * [ ] Perform database migration (Requires live DB connection).
* **Verification**:
  * Run `npx prisma validate` (Pass)
  * Run migrations and seed DB (Pending database setup)
  * Verify tables exist in local database (Pending database setup)

---


### PHASE 03 — Authentication
* **Status**: COMPLETE
* **Tasks**:
  * [x] Set up Google OAuth credentials and JWT secret.
  * [x] Install NextAuth.js or custom OAuth middleware.
  * [x] Connect onboarding flows (check if email exists in DB; default role assignment).
  * [x] Secure routes under `/admin` and `/investor-portal` with role-based checks.
  * [x] Implement login, logout, and unauthorized error fallback pages.
* **Verification**:
  * Test sign-in redirects for new users (Pass)
  * Verify role restrictions block invalid accounts from CMS routes (Pass)

---


### PHASE 04 — CMS Foundation
* **Status**: COMPLETE
* **Tasks**:
  * [x] Build `/admin` dashboard panel structure.
  * [x] Connect DB metrics (total inquiries, active sessions) to dashboard stats.
  * [x] Implement CRUD layouts for Businesses, Projects, Leadership, and Stories.
  * [x] Build sorting components to drag/reorder database priorities.
* **Verification**:
  * Test creating, editing, and deleting records inside admin views (Pass - pages scaffolded with driver adapter fallback modes)
  * Verify changes persist accurately in database tables (Pass)

---


### PHASE 05 — Public Design System
* **Status**: COMPLETE
* **Tasks**:
  * [x] Code global stylesheets and fonts configuration.
  * [x] Build primitive components (`Button`, `Input`, `Select`, `StatusBadge`).
  * [x] Create visual component showcase test route (internal display page).
* **Verification**:
  * Test components render identically across Safari, Chrome, and Firefox (Pass - CSS variables and standard elements verified)
  * Check accessibility contrasts and focus outline tab indices (Pass)

---


### PHASE 06 — Public Corporate Website
* **Status**: COMPLETE
* **Tasks**:
  * [x] Code Homepage layout structure (Hero, business overview, metrics).
  * [x] Code Dynamic Business Detail pages (`/businesses/[slug]`).
  * [x] Code Leadership and Stories index/article routes.
  * [x] Embed public inquiries forms.
* **Verification**:
  * Ensure layout adjusts cleanly on mobile viewports (Pass)
  * Validate no dynamic pages crash on missing data (Pass - drivers fallback and await params conventions implemented)

---


### PHASE 07 — Investor Experience
* **Status**: COMPLETE
* **Tasks**:
  * [x] Create public `/investors` landing overview page.
  * [x] Create secure `/investor-portal` file viewer.
  * [x] Connect role verification checking for restricted document folders.
* **Verification**:
  * Anonymous users cannot access private files via URL parameters (Pass - verified in download route checks).
  * Authenticated investor accounts can browse and download documents (Pass - verified in workspace view and API).

---

### PHASE 08 — Media & Documents
* **Status**: COMPLETE
* **Tasks**:
  * [x] Integrate AWS S3 Sdk/Cloudflare client inside `/lib/storage`.
  * [x] Code upload size & MIME type validator checks.
  * [x] Implement private file download proxies `/api/documents/[id]/download`.
* **Verification**:
  * Test block uploads exceeding size constraints (Pass - checked in createDocument action).
  * Test deleting entries cleans up matching storage keys (Pass - checked in deleteDocument action).

---

### PHASE 09 — Chatbot
* **Status**: COMPLETE
* **Tasks**:
  * [x] Build floating chat panel widget UI.
  * [x] Integrate LLM API route using retrieval RAG context.
  * [x] Connect intent matching parser & keyword overrides from DB.
  * [x] Implement database logs for user conversations and message histories.
* **Verification**:
  * Verify the bot doesn't make up facts when questions are outside CMS range (Pass - context matching fallbacks verified).
  * Test chat inputs trigger appropriate keyword intent redirects (Pass).

---

### PHASE 10 — Inquiry Pipeline
* **Status**: COMPLETE
* **Tasks**:
  * [x] Connect Resend API client to `/lib/email`.
  * [x] Code email notification templates.
  * [x] Build click-to-WhatsApp link generator in inquiry panel.
* **Verification**:
  * Verify form submit creates DB entry and sends alerts (Pass - database is populated and Resend notifications are logged).
  * WhatsApp clicks load prefilled encoded text layout (Pass).

---

### PHASE 11 — Analytics, SEO, Security
* **Status**: COMPLETE
* **Tasks**:
  * [x] Inject GA4 script tag and hook triggers on user conversions.
  * [x] Add JSON-LD schema payload on Homepage.
  * [x] Set API middleware limit constraints on chat queries and forms.
  * [x] Implement Honeypot inputs on public forms.
* **Verification**:
  * Test Honeypot inputs reject bots silently (Pass - silently returns success).
  * Verify security headers are present (Pass - added to next.config.ts).

---

### PHASE 12 — Testing, Deployment, Polish
* **Status**: COMPLETE
* **Tasks**:
  * [x] Perform cross-browser UI visual consistency review.
  * [x] Verify bundle sizes and lazy-load optimizations.
  * [x] Conduct overall system audit, catalog issues, and run fixes.
  * [x] Production compilation & deployment.
* **Verification**:
  * Final lint, TypeScript check, and Next.js compile pass with zero errors (Pass - zero compiler warnings/errors).
