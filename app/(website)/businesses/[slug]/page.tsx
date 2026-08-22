import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import TrackBusinessView from "@/components/analytics/TrackBusinessView";

interface Project {
  id: string;
  title: string;
  description: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const business = await prisma.business.findUnique({
      where: { slug },
      select: { title: true, seoTitle: true, seoDescription: true }
    });
    if (business) {
      return {
        title: business.seoTitle || `${business.title} | Rubinsons Group`,
        description: business.seoDescription || `Learn about the ${business.title} division of Rubinsons Group.`,
      };
    }
  } catch {}

  // Fallback structures if database offline
  const fallbacks: Record<string, { title: string; description: string }> = {
    "builders-infrastructure": {
      title: "Rubinsons Builders & Infrastructure | Sectors Showcase",
      description: "Civil construction, engineering, land development, residential and commercial infrastructure.",
    },
    "contracting": {
      title: "Rubinsons Contracting | Sectors Showcase",
      description: "Private and public sector contracting services, procurement management, and project execution.",
    },
    "ich-dien-academia": {
      title: "ICH Dien Academia | Sectors Showcase",
      description: "Education, skill development, hospitality training, vocational programs, and professional events.",
    },
    "healthcare": {
      title: "Healthcare / Shanti Medical Hall | Sectors Showcase",
      description: "Distribution of medical supplies, retail pharmaceuticals, and healthcare consultancy.",
    },
    "digital-media-marketing": {
      title: "Rubinsons Digital Media & Marketing | Sectors Showcase",
      description: "Digital advertising, consulting, brand strategy, e-commerce support, and media creation.",
    },
  };

  const fb = fallbacks[slug];
  if (fb) {
    return { title: fb.title, description: fb.description };
  }

  return {
    title: "Sector Showcase | Rubinsons Group",
    description: "Explore the business divisions and operational infrastructure of Rubinsons Group.",
  };
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let business = null;
  let projects: Project[] = [];
  let isDbOffline = false;

  try {
    business = await prisma.business.findUnique({
      where: { slug },
      include: { projects: { orderBy: { order: "asc" } } },
    });
    if (business) {
      projects = business.projects as Project[];
    }
  } catch {

    isDbOffline = true;
    // Database offline: load mock structure matching the verified CONTENT.md entries
    const mockSectors = [
      {
        slug: "builders-infrastructure",
        title: "Rubinsons Builders & Infrastructure",
        shortDescription: "Civil construction, engineering, land development, residential and commercial infrastructure.",
        detailedDescription: "Rubinsons Builders & Infrastructure focuses on executing major civil construction works, infrastructure development, real estate ventures, and land engineering projects with a dedication to safety and quality across India.",
        businessHead: "Information to be updated via CMS",
      },
      {
        slug: "contracting",
        title: "Rubinsons Contracting",
        shortDescription: "Private and public sector contracting services, procurement management, and project execution.",
        detailedDescription: "Rubinsons Contracting delivers specialized contracting services for commercial developments, municipal infrastructure projects, procurement workflows, and technical construction execution.",
        businessHead: "Information to be updated via CMS",
      },
      {
        slug: "ich-dien-academia",
        title: "ICH Dien Academia",
        shortDescription: "Education, skill development, hospitality training, vocational programs, and professional events.",
        detailedDescription: "ICH Dien Academia is an education and events venture dedicated to professional skill development, culinary training, hospitality vocational tracks, and corporate event management.",
        businessHead: "Information to be updated via CMS",
      },
      {
        slug: "healthcare",
        title: "Healthcare / Shanti Medical Hall",
        shortDescription: "Distribution of medical supplies, retail pharmaceuticals, and healthcare consultancy.",
        detailedDescription: "Operating under the Shanti Medical Hall lineage, this division delivers pharmaceutical supplies, healthcare logistics, and retail dispensing, with plans for expanded diagnostic clinics and wellness centers.",
        businessHead: "Information to be updated via CMS",
      },
      {
        slug: "digital-media-marketing",
        title: "Rubinsons Digital Media & Marketing",
        shortDescription: "Digital advertising, consulting, brand strategy, e-commerce support, and media creation.",
        detailedDescription: "Rubinsons Digital Media & Marketing provides digital consulting, creative campaigns, e-commerce optimization, video/text asset creation, and brand strategy positioning for corporate growth.",
        businessHead: "Information to be updated via CMS",
      },
    ];

    const matched = mockSectors.find((s) => s.slug === slug);
    if (matched) {
      business = {
        ...matched,
        id: `mock-${slug}`,
        status: "ACTIVE",
        imageUrl: null,
        galleryUrls: [],
      };
      projects = [
        { id: "mock-proj-1", title: `${matched.title} Project Alpha`, description: "Representative operational sector project execution detailed via CMS." },
      ];
    }
  }

  if (!business) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 py-16 space-y-12 font-sans">
      <TrackBusinessView slug={slug} title={business.title} />
      {/* Back button */}
      <div>
        <Link
          href="/businesses"
          className="text-xs font-semibold text-brand-bronze-dark hover:underline"
        >
          &larr; Return to Sectors Directory
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-brand-bronze font-semibold">
          Sector Showcase
        </span>
        <h1 className="text-4xl font-serif font-medium text-brand-slate-900 tracking-tight">
          {business.title}
        </h1>
        <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs text-brand-text-muted">
          <p>
            <strong>Division Head:</strong> {business.businessHead || "TBA"}
          </p>
          <p>
            <strong>Status:</strong> ACTIVE
          </p>
        </div>
      </div>

      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r text-xs text-amber-800">
          *Database offline: Displaying static template configurations.
        </div>
      )}

      {/* Detailed Description */}
      <section className="space-y-4">
        <h2 className="text-lg font-serif font-semibold text-brand-slate-900">
          Sector Operations Overview
        </h2>
        <p className="text-sm text-brand-text-muted leading-relaxed whitespace-pre-wrap">
          {business.detailedDescription}
        </p>
      </section>

      {/* Projects list */}
      <section className="space-y-6 pt-6 border-t border-slate-200">
        <h2 className="text-lg font-serif font-semibold text-brand-slate-900">
          Sectors & Dynamic Project Portfolios
        </h2>
        {projects.length === 0 ? (
          <p className="text-xs text-brand-text-muted">No projects logged under this division.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="border border-slate-200 rounded p-6 bg-slate-50 space-y-2">
                <h4 className="text-sm font-semibold text-brand-slate-900">{p.title}</h4>
                <p className="text-xs text-brand-text-muted leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
