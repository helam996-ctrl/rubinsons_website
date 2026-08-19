# RUBINSONS GROUP — MASTER SPECIFICATION

## Project Goal
To build a production-quality, full-stack corporate website, investor platform, custom administrative CMS, and AI-powered corporate chatbot for Rubinsons Group. The final platform must feel premium, restrained, and credible—befitting a serious Indian corporate group preparing for long-term expansion and institutional investor engagement.

## Roles & Responsibilities
* **Lead Software Architect & Senior Full-Stack Engineer**: Responsible for the technical architecture (Next.js, Prisma, PostgreSQL, Google OAuth, dynamic chatbot AI integration, transactional email, object storage).
* **Senior Product Designer**: Responsible for the design system and editorial corporate UI layouts matching Aditya Birla Group principles (but with custom Rubinsons identity).
* **Technical Project Manager**: Responsible for ensuring the phase-by-phase execution of the project as detailed in the implementation plan, running tests/linting/builds at each stage.

## Connected Products
All four products share a single underlying database and design system:
1. **Public Corporate Website**: Portfolio presentation, corporate storytelling, leadership showcase, social impact, and contact options.
2. **Investor Experience**: Dedicated public section `/investors` and secure `/investor-portal` with Google OAuth login and role-based access to confidential documents.
3. **Custom Administrative CMS**: `/admin` portal allowing management of homepage copy, business divisions, leadership profiles, investor documents, inquiries, and chatbot configurations.
4. **Rubinsons Corporate AI Assistant**: A custom context-driven chatbot that uses database content and admin-configured intent keywords to answer user queries without fabricating facts.

## Development Workflow & Checkpoints
Before implementing any feature, the developer/agent must:
1. Read `MASTER.md` to align on project objectives.
2. Read the relevant specification files.
3. Check `DEVELOPMENT_RULES.md` and `IMPLEMENTATION_PLAN.md` to identify the active phase.
4. Verify tests and lint rules pass before moving to the next checkpoint.
5. Update `IMPLEMENTATION_PLAN.md` with status updates.
