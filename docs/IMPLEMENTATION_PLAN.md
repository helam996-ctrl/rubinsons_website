# IMPLEMENTATION PLAN

## Overview
This document details the step-by-step roadmap for building the Rubinsons Group digital platform. The development must progress sequentially. Checkpoints require running linting, typechecking, and builds, and updating this file with completion logs.

---

## Roadmap Index

### PHASE 01 — Project Foundation
* **Status**: PENDING
* **Tasks**:
  * [ ] Initialize Next.js app with App Router and TypeScript.
  * [ ] Set up Tailwind CSS with styling variables mapped to `DESIGN.md` tokens.
  * [ ] Configure ESLint, Prettier, and path aliases.
  * [ ] Draft environment variable template (`.env.example`).
  * [ ] Scaffold main directory structure (`/app`, `/components`, `/lib`, `/prisma`, `/public`).
* **Verification**:
  * Run `npm run lint` (Pass)
  * Run `npx tsc --noEmit` (Pass)
  * Run `npm run build` (Pass)

---

### PHASE 02 — Database Architecture
* **Status**: PENDING
* **Tasks**:
  * [ ] Write `prisma/schema.prisma` with models mapped in `DATABASE.md`.
  * [ ] Configure local PostgreSQL connector.
  * [ ] Write `prisma/seed.ts` containing ONLY verified Rubinsons details.
  * [ ] Initialize Prisma Client helper inside `/lib/db/client.ts`.
  * [ ] Perform database migration.
* **Verification**:
  * Run `npx prisma validate`
  * Run migrations and seed DB
  * Verify tables exist in local database

---

### PHASE 03 — Authentication
* **Status**: PENDING
* **Tasks**:
  * [ ] Set up Google OAuth credentials and JWT secret.
  * [ ] Install NextAuth.js or custom OAuth middleware.
  * [ ] Connect onboarding flows (check if email exists in DB; default role assignment).
  * [ ] Secure routes under `/admin` and `/investor-portal` with role-based checks.
  * [ ] Implement login, logout, and unauthorized error fallback pages.
* **Verification**:
  * Test sign-in redirects for new users.
  * Verify role restrictions block invalid accounts from CMS routes.

---

### PHASE 04 — CMS Foundation
* **Status**: PENDING
* **Tasks**:
  * [ ] Build `/admin` dashboard panel structure.
  * [ ] Connect DB metrics (total inquiries, active sessions) to dashboard stats.
  * [ ] Implement CRUD layouts for Businesses, Projects, Leadership, and Stories.
  * [ ] Build sorting components to drag/reorder database priorities.
* **Verification**:
  * Test creating, editing, and deleting records inside admin views.
  * Verify changes persist accurately in database tables.

---

### PHASE 05 — Public Design System
* **Status**: PENDING
* **Tasks**:
  * [ ] Code global stylesheets and fonts configuration.
  * [ ] Build primitive components (`Button`, `Input`, `Select`, `StatusBadge`).
  * [ ] Create visual component showcase test route (internal display page).
* **Verification**:
  * Test components render identically across Safari, Chrome, and Firefox.
  * Check accessibility contrasts and focus outline tab indices.

---

### PHASE 06 — Public Corporate Website
* **Status**: PENDING
* **Tasks**:
  * [ ] Code Homepage layout structure (Hero, business overview, metrics).
  * [ ] Code Dynamic Business Detail pages (`/businesses/[slug]`).
  * [ ] Code Leadership and Stories index/article routes.
  * [ ] Embed public inquiries forms.
* **Verification**:
  * Ensure layout adjusts cleanly on mobile viewports.
  * Validate no dynamic pages crash on missing data (graceful loaders).

---

### PHASE 07 — Investor Experience
* **Status**: PENDING
* **Tasks**:
  * [ ] Create public `/investors` landing overview page.
  * [ ] Create secure `/investor-portal` file viewer.
  * [ ] Connect role verification checking for restricted document folders.
* **Verification**:
  * Anonymous users cannot access private files via URL parameters.
  * Authenticated investor accounts can browse and download documents.

---

### PHASE 08 — Media & Documents
* **Status**: PENDING
* **Tasks**:
  * [ ] Integrate AWS S3 Sdk/Cloudflare client inside `/lib/storage`.
  * [ ] Code upload size & MIME type validator checks.
  * [ ] Implement private file download proxies `/api/documents/[id]/download`.
* **Verification**:
  * Test block uploads exceeding size constraints.
  * Test deleting entries cleans up matching storage keys.

---

### PHASE 09 — Chatbot
* **Status**: PENDING
* **Tasks**:
  * [ ] Build floating chat panel widget UI.
  * [ ] Integrate LLM API route using retrieval RAG context.
  * [ ] Connect intent matching parser & keyword overrides from DB.
  * [ ] Implement database logs for user conversations and message histories.
* **Verification**:
  * Verify the bot doesn't make up facts when questions are outside CMS range.
  * Test chat inputs trigger appropriate keyword intent redirects.

---

### PHASE 10 — Inquiry Pipeline
* **Status**: PENDING
* **Tasks**:
  * [ ] Connect Resend API client to `/lib/email`.
  * [ ] Code email notification templates.
  * [ ] Build click-to-WhatsApp link generator in inquiry panel.
* **Verification**:
  * Verify form submit creates DB entry and sends alerts.
  * WhatsApp clicks load prefilled encoded text layout.

---

### PHASE 11 — Analytics, SEO, Security
* **Status**: PENDING
* **Tasks**:
  * [ ] Inject GA4 script tag and hook triggers on user conversions.
  * [ ] Add JSON-LD schema payload on Homepage.
  * [ ] Set API middleware limit constraints on chat queries and forms.
  * [ ] Implement Honeypot inputs on public forms.
* **Verification**:
  * Test Honeypot inputs reject bots silently.
  * Verify security headers are present.

---

### PHASE 12 — Testing, Deployment, Polish
* **Status**: PENDING
* **Tasks**:
  * [ ] Perform cross-browser UI visual consistency review.
  * [ ] Verify bundle sizes and lazy-load optimizations.
  * [ ] Conduct overall system audit, catalog issues, and run fixes.
  * [ ] Production compilation & deployment.
* **Verification**:
  * Final lint, TypeScript check, and Next.js compile pass with zero errors.
