# SEARCH ENGINE OPTIMIZATION (SEO)

## SEO Standard Requirements
All public-facing routes must follow strict structural rules to maximize indexing quality, load speeds, and search console ranks.

---

## 1. Page Title & Meta Rules
* **Title Length**: Keep page titles between 50-60 characters.
* **Meta Description Length**: Keep descriptions between 120-150 characters.
* **Hierarchy Example**:
  ```text
  [Page Subject] | Rubinsons Group
  ```

### Static Page Metadata Defaults
* **Homepage**:
  * *Title*: Rubinsons Group | Diversified Corporate Group India
  * *Meta*: Rubinsons Group is a diversified family-backed Indian corporate enterprise operating across builders, contracting, education, healthcare, and digital media.
* **Investors Overview**:
  * *Title*: Investor Relations | Rubinsons Group
  * *Meta*: Explore the investment framework, corporate structure, and growth roadmap of Rubinsons Private Limited.

---

## 2. Structured Metadata (Schema.org JSON-LD)
A JSON-LD snippet must be injected into the homepage head to establish corporate relationships:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Rubinsons Group",
  "legalName": "Rubinsons Private Limited",
  "url": "https://rubinsons.com",
  "logo": "https://rubinsons.com/logos/rubinsons-logo-dark.png",
  "foundingDate": "2026",
  "knowsAbout": ["Builders & Infrastructure", "Contracting", "Hospitality Education", "Healthcare Services", "Digital Media"],
  "subOrganization": [
    {
      "@type": "Organization",
      "name": "ICH Dine Academia"
    },
    {
      "@type": "Organization",
      "name": "Rudra Vahini Foundation"
    }
  ]
}
```

---

## 3. Robots & Sitemap Configuration
Next.js dynamic routes automatically generate `sitemap.xml` and `robots.txt`.

### Robots.txt Configuration
```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /investor-portal/
Disallow: /api/

Sitemap: https://rubinsons.com/sitemap.xml
```

---

## 4. Dynamic Content SEO Fields
The database schema includes `seoTitle` and `seoDescription` fields for `Business` and `Story` models.
* When editing a Business Division or Story in the CMS, the fields must be exposed in the editor.
* In the frontend Next.js App Router dynamic page (e.g., `app/(website)/businesses/[slug]/page.tsx`), use the `generateMetadata` lifecycle function to fetch these database fields and apply them.
* Fallback: If `seoTitle` is null, default to `${business.title} | Rubinsons Group`.
