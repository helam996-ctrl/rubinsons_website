# COMPONENT SPECIFICATIONS

## Component Directory Structure
All components live in the `/components` folder and must be split by functional category to prevent file clutter:
```text
components/
├── ui/                   # Leaf-level primitives (Buttons, Inputs, Badges)
├── navigation/           # SiteHeader, MobileNavigation, Footer, AdminSidebar
├── business/             # BusinessCard, BusinessStory, ProjectCard
├── leadership/           # LeadershipCard, BioModal
├── investors/            # DocumentCard, DocumentFilter
├── chatbot/              # ChatbotWidget, ChatMessage, QuickActionButton
└── admin/                # StatsCard, InquiryRow, MediaGrid
```

---

## 1. Global Navigation Components
* **SiteHeader**: Fixed-position navbar. Transparent on landing hero; turns to solid Slate-900 background with slim borders on scroll. Font size is small, letter-spacing wide.
* **MobileNavigation**: Slide-out menu panel. Triggered by a Hamburger icon. Fully keyboard accessible (traps focus when active, closes on Esc key).
* **Footer**: Multi-column list containing Group entities, links to all 5 Business Divisions, Contact CTA, legal disclaimers, and a link to the secure `/investor-portal`.

---

## 2. Core UI Primitives
* **Button**: Next.js-wrapped element.
  * Primary: Solid `#0F172A`, text color White, hover background transitions to `#1E293B` or slides under-border.
  * Secondary: Border `#C5A880` (Bronze), text Slate-900, transparent background.
* **StatusBadge**: Displays inquiry resolution status:
  * `NEW`: Gold background (`#FEF3C7`), text Gold-800 (`#92400E`).
  * `CONTACTED`: Blue background (`#DBEAFE`), text Blue-800 (`#1E40AF`).
  * `CLOSED`: Green background (`#D1FAE5`), text Green-800 (`#065F46`).
  * `SPAM`: Gray background (`#F1F5F9`), text Gray-800 (`#334155`).

---

## 3. Business & Portfolio Layouts
* **BusinessCard**: Displayed on homepage/portfolio. Contains business title, numbered indicator (e.g. `01`, `02`), short description, and "Read Details" arrow. On hover, the image inside scale-transforms by `2%`.
* **BusinessStory**: Detailed layout for `/businesses/[slug]`. Renders full h1, dynamic detailed description block (supporting CMS rich text), business head quote card, and image gallery.

---

## 4. Chatbot Widget Interface
* **ChatbotWidget**: Floating widget in the bottom-right viewport corner.
  * Closed state: Circular button containing custom Assistant icon.
  * Open state: Height-capped box (`500px`), header bar (title, close button), scrollable messages container, suggestions row, input text bar.
* **ChatMessage**: Alternating bubble styles:
  * Bot messages: Deep slate/grey background, aligned left.
  * User messages: White background, border Slate-200, aligned right.
* **ChatbotQuickAction**: Small pill buttons displaying intent shortcuts (e.g. "Learn about Builders", "Request Investor Package"). Clicking submits prefilled text instantly.
