import { prisma } from "@/lib/db/client";
import Link from "next/link";

export default async function BusinessesPage() {
  let businesses = [];
  let isDbOffline = false;

  try {
    businesses = await prisma.business.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
    isDbOffline = true;

    businesses = [
      {
        slug: "builders-infrastructure",
        title: "Rubinsons Builders & Infrastructure",
        shortDescription: "Civil construction, engineering, land development, residential and commercial infrastructure.",
      },
      {
        slug: "contracting",
        title: "Rubinsons Contracting",
        shortDescription: "Private and public sector contracting services, procurement management, and project execution.",
      },
      {
        slug: "ich-dien-academia",
        title: "ICH Dien Academia",
        shortDescription: "Education, skill development, hospitality training, vocational programs, and professional events.",
      },
      {
        slug: "healthcare",
        title: "Healthcare / Shanti Medical Hall",
        shortDescription: "Distribution of medical supplies, retail pharmaceuticals, and healthcare consultancy.",
      },
      {
        slug: "digital-media-marketing",
        title: "Rubinsons Digital Media & Marketing",
        shortDescription: "Digital advertising, consulting, brand strategy, e-commerce support, and media creation.",
      },
    ];
  }

  return (
    <main className="max-w-7xl mx-auto px-6 sm:px-8 py-16 space-y-12 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8 space-y-2">
        <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
          Sectors
        </span>
        <h1 className="text-4xl font-serif font-medium text-brand-slate-900">
          Our Business Divisions
        </h1>
        <p className="text-sm text-brand-text-muted max-w-2xl">
          Rubinsons operates across key commercial fields, managing dedicated operations focused on
          safety, quality, and long-term multi-generational governance.
        </p>
      </div>

      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            *Database offline: Displaying verified company sectors from local specification registry.
          </p>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {businesses.map((b) => (
          <div key={b.slug} className="border border-slate-200 rounded p-8 bg-white hover:shadow-md transition-shadow flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-medium text-brand-slate-900">
                {b.title}
              </h2>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                {b.shortDescription}
              </p>
            </div>
            <div>
              <Link
                href={`/businesses/${b.slug}`}
                className="text-xs font-semibold text-brand-bronze-dark hover:underline"
              >
                Explore Sector Details &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
