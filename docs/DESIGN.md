# DESIGN SYSTEM & VISUAL GUIDELINES

## Core Design Philosophy
The design must look intentionally art-directed, resembling high-end corporate groups like Aditya Birla Group. The layout should feel architectural, editorial, and sophisticated, relying on clean typography, structured whitespace, and high-quality photography instead of decorative shapes, blobs, or heavy gradients.

## Color Palette
* **Primary (Deep Slate / Corporate Navy)**: `#0F172A` (Tailwind `slate-900`) & `#1E293B` (Tailwind `slate-800`).
* **Secondary / Accent (Warm Bronze / Editorial Gold)**: `#C5A880` (Muted gold/bronze) & `#9A7E56`.
* **Neutrals (Off-White / Alabaster)**: `#F8FAFC` (Tailwind `slate-50`) & `#FFFFFF`.
* **Text**: `#0F172A` (Slate-900 for high-contrast headings), `#475569` (Slate-600 for clean body readability).
* **Muted Accents**: `#E2E8F0` (Slate-200 for borders and dividers).

## Typography
* **Headings**: Editorial Serif (e.g., `Playfair Display` or `Cormorant Garamond`). Set `font-weight: 500` or `600`, with tight letter-spacing.
* **Body & UI**: Clean Geometric Sans-Serif (e.g., `Inter` or `Plus Jakarta Sans`).
* **Sizing Scale**:
  * Display: 3.5rem (56px) / 4.5rem (72px)
  * Heading 1 (h1): 2.5rem (40px)
  * Heading 2 (h2): 2rem (32px)
  * Heading 3 (h3): 1.5rem (24px)
  * Body: 1rem (16px), Line-height: 1.6
  * Small Text / Metadata: 0.875rem (14px)

## Spacing & Grid System
* **Grid**: 12-column grid system for large screens, 4-column for tablet, 1-column for mobile.
* **Containers**: Maximum width of `1280px` (`max-w-7xl`) centered, with `px-6` on mobile and `px-8` on desktop.
* **Vertical Spacing**: Generous section padding (`py-24` or `py-32` on large screens, `py-16` on mobile) to give the layout room to breathe.

## UI Primitives
* **Borders & Radius**: Architectural and sharp. Max border-radius: `4px` or `6px`. Borders should be `1px solid #E2E8F0`.
* **Shadows**: Restrained. Use elevation-1 (`box-shadow: 0 1px 3px rgba(0,0,0,0.05)`) or none (flat borders).
* **Buttons**:
  * *Primary*: Solid Slate-900, white text, bronze hover underline or transition.
  * *Secondary*: Border slate-900 or bronze, transparent background, smooth color transition.
  * *Disabled*: Slate-100 background, Slate-400 text, no pointer events.
* **Form Inputs**: Flat fields with thin borders, light gray background on focus, clear focus outlines.

## Animations & Motion
* **Transition**: Use `cubic-bezier(0.16, 1, 0.3, 1)` for high-end feel.
* **Duration**: 250ms–400ms.
* **Micro-motions**: Subtle text slide-up, card opacity fade-in, and hover-triggered image scaling (e.g., `scale-102`).
* Avoid: Bouncing elements, rotating icons, or floating particles.

## Accessibility
* **Contrast**: Ensure WCAG AA level contrast for all text (at least 4.5:1).
* **Focus Rings**: Custom focus outlines in bronze or slate.
* **HTML semantics**: Interactive widgets must have visible focus indicators and supports keyboard tab order.
