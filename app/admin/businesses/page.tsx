import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import BusinessListClient from "@/components/admin/BusinessListClient";

export default async function AdminBusinessesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let businesses = [];
  let isDbOffline = false;

  try {
    businesses = await prisma.business.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
    isDbOffline = true;

    // Load verified sectors from CONTENT.md as visual mock placeholders
    businesses = [
      {
        id: "mock-1",
        slug: "builders-infrastructure",
        title: "Rubinsons Builders & Infrastructure",
        shortDescription: "Civil construction, engineering, and residential infrastructure.",
        detailedDescription: "Rubinsons Builders & Infrastructure focuses on executing major civil construction works, infrastructure development, real estate ventures, and land engineering projects with a dedication to safety and quality across India.",
        imageUrl: "/images/builders_infrastructure.jpg",
        status: "ACTIVE",
        order: 1,
      },
      {
        id: "mock-2",
        slug: "contracting",
        title: "Rubinsons Contracting",
        shortDescription: "Private and public sector contracting services.",
        detailedDescription: "Rubinsons Contracting delivers specialized contracting services for commercial developments, municipal infrastructure projects, procurement workflows, and technical construction execution.",
        imageUrl: "/images/contracting_services.jpg",
        status: "ACTIVE",
        order: 2,
      },
      {
        id: "mock-3",
        slug: "ich-dien-academia",
        title: "ICH Dien Academia",
        shortDescription: "Education, skill development, and events.",
        detailedDescription: "ICH Dien Academia is an education and events venture dedicated to professional skill development, culinary training, hospitality vocational tracks, and corporate event management.",
        imageUrl: "/images/ich_dien_academia.jpg",
        status: "ACTIVE",
        order: 3,
      },
      {
        id: "mock-4",
        slug: "healthcare",
        title: "Healthcare / Shanti Medical Hall",
        shortDescription: "Distribution of medical supplies and retail pharma.",
        detailedDescription: "Operating under the Shanti Medical Hall lineage, this division delivers pharmaceutical supplies, healthcare logistics, and retail dispensing, with plans for expanded diagnostic clinics and wellness centers.",
        imageUrl: "/images/healthcare_division.jpg",
        status: "ACTIVE",
        order: 4,
      },
      {
        id: "mock-5",
        slug: "digital-media-marketing",
        title: "Rubinsons Digital Media & Marketing",
        shortDescription: "Digital advertising, strategy, and media creation.",
        detailedDescription: "Rubinsons Digital Media & Marketing provides digital consulting, creative campaigns, e-commerce optimization, video/text asset creation, and brand strategy positioning for corporate growth.",
        imageUrl: "/images/digital_media.jpg",
        status: "ACTIVE",
        order: 5,
      },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      <BusinessListClient initialBusinesses={businesses} isDbOffline={isDbOffline} />
    </main>
  );
}
