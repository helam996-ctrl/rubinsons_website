# TECHNICAL ARCHITECTURE

## System Stack & Technologies
* **Framework**: Next.js 14+ (using App Router for optimized server-side rendering, routing, and layout nesting).
* **Language**: TypeScript (strict mode enabled).
* **Styling**: Tailwind CSS with custom design system variables mapped in `tailwind.config.js`.
* **Database**: PostgreSQL (relational database for storing structured content, inquiries, authentication, chatbot intents, and conversation history).
* **ORM**: Prisma (type-safe database queries and migrations).
* **Authentication**: Google OAuth 2.0 (integrated using NextAuth.js or direct Route Handlers) paired with server-side Role-Based Access Control (RBAC).
* **AI Chatbot Layer**: Dynamic RAG (Retrieval-Augmented Generation) engine utilizing custom intent detection, keyword lists from the DB, and an LLM provider (e.g. Gemini API or OpenAI API).
* **Transactional Email**: Resend API for instant administrative notifications.
* **Storage**: Cloudflare R2 or Supabase Storage for dynamic media assets and PDFs.
* **Analytics**: Google Analytics 4 (client-side script injection) + custom server-side dashboard metrics.

---

## Directory Structure
The repository is structured to separate layout, logic, database schema, and configuration:
```text
rubinsons/
├── app/                      # Next.js App Router root
│   ├── (website)/            # Public website pages (Homepage, /businesses, /investors)
│   ├── admin/                # Custom CMS dashboard pages (Protected)
│   ├── investor-portal/      # Secure investor document portal (Protected)
│   ├── api/                  # API endpoints (Auth, Chatbot, Inquiries, Media)
│   └── layout.tsx            # Global layout wrapper
│
├── components/               # Reusable UI React Components
│   ├── ui/                   # Primitive design system components (buttons, inputs)
│   ├── navigation/           # Main and admin navbars/sidebars
│   ├── business/             # Business portfolio components
│   ├── chatbot/              # Floating widget and chat interface
│   └── admin/                # CMS-specific charts, tables, and forms
│
├── lib/                      # Service layers and integrations
│   ├── auth/                 # Google OAuth options and RBAC helpers
│   ├── db/                   # PrismaClient instance
│   ├── chatbot/              # Intent matching and LLM generation logic
│   ├── email/                # Resend integrations
│   ├── storage/              # Object storage upload & delete client
│   └── utils/                # General helpers
│
├── prisma/                   # Prisma database configuration
│   ├── schema.prisma         # Database schema models
│   └── seed.ts               # Local verification seed script
│
├── public/                   # Static public assets (logos, static graphics)
└── docs/                     # Specifications & Instructions (This system)
```

---

## Data & Request Flow
The visual hierarchy of requests:

```text
       Browser (Client Component)
                 │
                 ├── (Submit Inquiry / Chat Message) ──> Next.js API Routes (Server Actions / Route Handlers)
                 │                                                   │
                 └── (View Pages / SSR Data)                         ├──> Security Check (Token & Role Verification)
                          ▲                                          ├──> DB Queries (Prisma client) ──> PostgreSQL
                          │                                          └──> External APIs (Resend, LLM, R2)
                          │
             Next.js Server Component
                          │
                 (Static & Dynamic HTML)
```

## Service Layer Pattern
All dynamic logic (e.g., sending emails, uploading files, running LLM inference, updating DB) must reside in separate files inside `/lib` (e.g., `/lib/chatbot/`, `/lib/email/`). Next.js pages or API routes must call these services rather than writing raw database queries or fetch operations inside the UI layer. This ensures code reusability, modular testing, and clear separation of concerns.
