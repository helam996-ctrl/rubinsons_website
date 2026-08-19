# DEVELOPMENT RULES & CODING STANDARDS

## Strict Guidelines for Developers & AI Agents
These rules are non-negotiable. Any pull requests or code edits that violate these specifications will be rejected immediately during code reviews.

---

## 1. Code Quality & Typescript
* **Strict TypeScript**: Never use `any`. Define interfaces and types for all component props, api requests, database records, and function outputs.
* **ESLint & Prettier**: Run checks before every commit. Do not ignore lint warnings. Use standard spacing, quotes, and imports sorting.
* **Imports**: Use relative aliases `@/*` mapping back to `/app`, `/components`, `/lib` directories.

---

## 2. Next.js Server & Client Components Separation
* **Default to Server Components**: All layout and page wrappers must remain Server Components to minimize bundle size, load data fast, and secure API lookups.
* **Leaf-Level Client Components**: Only add the `'use client'` directive to components that require browser events (e.g. click hooks, state management, chatbots, forms, inputs).
* Keep client-side state minimal. Prefer URL parameters (`searchParams`) for pagination, filters, and modals.

---

## 3. Database & Business Logic Separation
* Never query databases directly within UI component layout code.
* Wrap all data interactions in Prisma transaction blocks inside `/lib/db/` or specialized services inside `/lib/`.
* Server Actions must call service functions and return plain serialized JSON objects. Catch all Prisma exceptions and map them to human-readable error messages before returning them to client inputs.

---

## 4. Strict Content Fabrication Ban
* **The No-Hallucination Rule**: Under no circumstances should copy contain fabricated metrics (e.g., "$100M revenue", "50+ active infrastructure projects", "won the 2026 corporate award") or invented partnerships.
* If specific text or figures are needed in visual blocks, use CMS mock variables or neutral labels (e.g., "Active locations managed via CMS").

---

## 5. Error Handling & Logging
* **API Endpoints**: Wrap router handlers in try/catch structures. Always return standard JSON envelopes on errors:
  ```json
  { "error": { "message": "Short description", "code": "ERR_CODE" } }
  ```
* **Page-Level Boundaries**: Place an `error.tsx` file inside every folder route to prevent single-component exceptions from crashing the entire app layout.
* **Logger**: Use a unified logging utility to capture server exception details (including stack traces) while presenting sanitized, user-friendly messages to the frontend.
