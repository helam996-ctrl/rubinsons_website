import { prisma } from "@/lib/db/client";
import Link from "next/link";
import type { Metadata } from "next";
import TrackCtaLink from "@/components/analytics/TrackCtaLink";
import ScrollReveal from "@/components/ui/ScrollReveal";
import DynamicHero from "@/components/hero/DynamicHero";

export const metadata: Metadata = {
  title: "Rubinsons Group | Diversified Corporate Group India",
  description: "Rubinsons Group is a diversified family-backed Indian corporate enterprise operating across builders, contracting, education, healthcare, and digital media.",
};

export default async function Homepage() {
  let businesses = [];
  let leaders = [];

  try {
    const [dbBusinesses, dbLeaders] = await Promise.all([
      prisma.business.findMany({
        orderBy: { order: "asc" },
        where: { status: "ACTIVE" }
      }),
      prisma.leadership.findMany({
        orderBy: { order: "asc" }
      }),
    ]);
    businesses = dbBusinesses;
    leaders = dbLeaders;
  } catch {
    // Static fallbacks
    businesses = [
      { slug: "builders-infrastructure", title: "Rubinsons Builders & Infrastructure", shortDescription: "Civil construction, engineering, and residential infrastructure." },
      { slug: "contracting", title: "Rubinsons Contracting", shortDescription: "Private and public sector contracting services." },
      { slug: "ich-dien-academia", title: "ICH Dien Academia", shortDescription: "Education, skill development, and events." },
      { slug: "healthcare", title: "Healthcare / Shanti Medical Hall", shortDescription: "Distribution of medical supplies and retail pharma." },
      { slug: "digital-media-marketing", title: "Rubinsons Digital Media & Marketing", shortDescription: "Digital advertising, strategy, and media creation." },
    ];
    leaders = [
      { name: "Dr. Rudra Bhanu", role: "Managing Director" },
      { name: "Bindu Sharma", role: "Director" },
      { name: "Shreyashi Sharma", role: "Director" },
    ];
  }

  const values = [
    { number: "01", title: "Trusteeship", desc: "We manage resources as trustees of the community, prioritizing long-term stewardship over short-term returns." },
    { number: "02", title: "Absolute Integrity", desc: "Compliance, ethical clarity, and honesty govern every contract, partnership, and communication." },
    { number: "03", title: "Architectural Excellence", desc: "We build infrastructure and services designed to endure, scaling standard practices with high precision." },
  ];

  const getBusinessImage = (slug: string) => {
    switch (slug) {
      case "builders-infrastructure":
        return "/images/builders_infrastructure.jpg";
      case "contracting":
        return "/images/contracting_services.jpg";
      case "ich-dien-academia":
        return "/images/ich_dien_academia.jpg";
      case "healthcare":
        return "/images/healthcare_division.jpg";
      case "digital-media-marketing":
        return "/images/digital_media.jpg";
      default:
        return "/images/builders_infrastructure.jpg";
    }
  };

  const sustainabilityCards = [
    {
      title: "Ecological Engineering",
      tag: "Green Contracting",
      desc: "Implementing resource-efficient structures, carbon monitoring in civil contracting, and green procurement methodologies.",
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 10H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
        </svg>
      ),
      borderClass: "hover:border-emerald-500/40 hover:shadow-emerald-500/2",
    },
    {
      title: "Rural Education Drives",
      tag: "Community Care",
      desc: "Creating access to elementary education and scholarship funds for rural youths in regional development zones.",
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      borderClass: "hover:border-amber-500/40 hover:shadow-amber-500/2",
    },
    {
      title: "Mobile Clinics & Care",
      tag: "Social Welfare",
      desc: "Under the Rudra Vahini Foundation, coordinating essential medical supplies and consulting programs for rural areas.",
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
      ),
      borderClass: "hover:border-blue-500/40 hover:shadow-blue-500/2",
    },
    {
      title: "Kaarigari Artisans",
      tag: "Vocational Support",
      desc: "Empowering regional craftspeople through structured design training, resource access, and fair-trade market linking.",
      icon: (
        <svg className="w-5 h-5 text-brand-bronze" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 21l8.913-5.096c.266-.152.484-.384.624-.657l.006-.012c.28-.548.163-1.228-.28-1.644l-4.437-4.16a1.272 1.272 0 00-1.722-.02l-4.29 4.18c-.43.42-.524 1.083-.23 1.62l.006.012c.14.275.361.508.63.66z" />
        </svg>
      ),
      borderClass: "hover:border-brand-bronze/40 hover:shadow-brand-bronze/2",
    },
  ];

  const mediaHighlights = [
    { date: "Aug 15, 2026", cat: "Announcements", title: "Rubinsons Builders Completes Landmark Regional Road Construction Project ahead of Schedule.", link: "/stories" },
    { date: "Jul 28, 2026", cat: "CSR Initiatives", title: "Rudra Vahini Foundation launches fresh rural literacy cohort across 12 sectors.", link: "/stories" },
    { date: "Jun 19, 2026", cat: "Governance", title: "Annual compliance audit completed by Board of Directors with absolute transparency.", link: "/stories" },
  ];

  return (
    <main className="space-y-24 pb-20 overflow-hidden">
      {/* Schema.org Structured Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
                "name": "ICH Dien Academia"
              },
              {
                "@type": "Organization",
                "name": "Rudra Vahini Foundation"
              }
            ]
          })
        }}
      />

      {/* 1. Dynamic Hero Section */}
      <DynamicHero initialBusinesses={businesses} />

      {/* 2. Corporate Introduction */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start font-sans">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-bold">
              Corporate Introduction
            </span>
            <h2 className="text-3xl font-serif font-medium text-brand-slate-900 leading-tight">
              Diversification coordinated with multi-generational values.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Rubinsons Private Limited serves as the central administrative parent organization.
              By combining long-term capital preservation with disciplined execution, the group manages a
              coordinated sector portfolio designed to deliver societal value and prepare for national scaling.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* 3. Legacy, Purpose & Values Editorial */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-6 sm:px-8 py-4 font-sans">
          <div className="border-t border-brand-border/80 pt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((val) => (
              <div key={val.number} className="space-y-4 relative group">
                <span className="text-[10px] font-mono text-brand-bronze font-bold block">
                  {val.number}
                </span>
                <h3 className="text-lg font-serif font-medium text-brand-slate-900 group-hover:text-brand-bronze transition-colors duration-300">
                  {val.title}
                </h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 4. Business Portfolio */}
      <ScrollReveal>
        <section className="bg-white py-24 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-sans font-bold">
                Our Sectors
              </span>
              <h2 className="text-3xl font-serif font-medium text-brand-slate-900">
                Coordinated Business Divisions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businesses.map((b, idx) => (
                <div
                  key={b.slug}
                  className="border border-slate-200/80 rounded p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-350 bg-slate-50/20 hover:bg-white space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Stock Image Thumbnail inside Sector Card */}
                    <div className="aspect-[16/10] w-full overflow-hidden rounded bg-slate-100 border border-slate-200/40 relative">
                      <img
                        src={getBusinessImage(b.slug)}
                        alt={b.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-brand-bronze-dark font-bold bg-brand-bronze/10 px-2 py-0.5 rounded">
                        0{idx + 1}
                      </span>
                      <h3 className="text-lg font-serif font-medium text-brand-slate-900 group-hover:text-brand-bronze transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                        {b.shortDescription}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/businesses/${b.slug}`}
                    className="text-xs font-sans font-semibold text-brand-bronze-dark hover:text-brand-slate-900 flex items-center gap-1.5"
                  >
                    Read Sector Details 
                    <span className="inline-block transform group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 5. Sustainability & Community Impact */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left side: Overview & Landscape Image (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-bold">
                  Sustainability & Outreach
                </span>
                <h2 className="text-3xl font-serif font-medium text-brand-slate-900">
                  Commitment to Sustainability & Community Care
                </h2>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  We prioritize responsible stewardship across green infrastructure procurement, educational development, local healthcare clinics, and artisanal empowerment.
                </p>
              </div>
              <div className="aspect-[16/10] w-full overflow-hidden rounded-lg shadow-md border border-slate-200/80 relative group">
                <img
                  src="/images/sustainability.jpg"
                  alt="Wind turbines and solar panels representing sustainability"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-white text-[9px] uppercase tracking-widest px-3 py-1.5 rounded font-semibold">
                  Environment & Carbon Action
                </div>
              </div>
            </div>

            {/* Right side: 2x2 Grid of cards (lg:col-span-7) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sustainabilityCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`border border-slate-200 rounded p-6 bg-slate-50/30 transition-all duration-300 hover:bg-white flex flex-col justify-between hover:shadow-md ${card.borderClass}`}
                >
                  <div className="space-y-4">
                    <div className="p-2 bg-white rounded border border-slate-100 shadow-sm w-fit">
                      {card.icon}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-brand-bronze font-bold block">
                        {card.tag}
                      </span>
                      <h4 className="text-sm font-semibold text-brand-slate-900">
                        {card.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </ScrollReveal>

      {/* 6. Leadership Highlight */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12 font-sans">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-bold">
              Corporate Governance
            </span>
            <h2 className="text-3xl font-serif font-medium text-brand-slate-900">
              Governed by the Board of Directors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {leaders.map((l) => (
              <div key={l.name} className="border border-slate-200/80 rounded p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                <h4 className="text-base font-semibold text-brand-slate-900">{l.name}</h4>
                <p className="text-xs text-brand-bronze-dark font-semibold uppercase tracking-wider mt-1">
                  {l.role}
                </p>
                <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                  Biography and governance statements registered under CMS.
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 7. Rudra Vahini Foundation CSR Block */}
      <ScrollReveal>
        <section className="bg-slate-50 border-y border-slate-200 py-24 relative overflow-hidden animate-in fade-in duration-500">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-bronze/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left side text column (col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-sans font-bold">
                Social Impact
              </span>
              <h2 className="text-3xl font-serif font-medium text-brand-slate-900 leading-tight">
                Rudra Vahini Foundation
              </h2>
              <p className="text-sm text-brand-text-muted leading-relaxed font-sans">
                We believe corporate scaling is incomplete without community empowerment.
                As a fully independent social welfare NGO, the Rudra Vahini Foundation runs rural educational drives,
                healthcare dispensaries, and skill training programs across regional sectors.
              </p>
            </div>
            
            {/* Right side Image & Info column (col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg border border-slate-200/60 relative group">
                <img
                  src="/images/csr_community.jpg"
                  alt="Children smiling in a classroom supported by Rudra Vahini Foundation"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute top-3 left-3 bg-brand-bronze text-brand-slate-900 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-md select-none">
                  NGO Partner
                </div>
              </div>
              <div className="border border-slate-200/80 bg-white p-6 rounded shadow-sm space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-brand-bronze-dark font-sans font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full animate-ping" />
                  NGO Status
                </h4>
                <p className="text-xs text-brand-slate-900 font-sans font-semibold">
                  Independent Social Action Organization
                </p>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  *The Foundation operates as an independent social welfare body and is not a commercial division of the parent company.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 8. Recent Media Highlights Section */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8 font-sans">
          <div className="flex justify-between items-end border-b border-slate-200 pb-4">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-bold">
                News & Media
              </span>
              <h2 className="text-2xl font-serif font-medium text-brand-slate-900">
                Media & Announcements
              </h2>
            </div>
            <Link
              href="/stories"
              className="text-xs font-semibold text-brand-bronze hover:text-brand-bronze-dark tracking-wider uppercase"
            >
              All Stories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mediaHighlights.map((news, idx) => (
              <div key={idx} className="space-y-3 group border border-slate-100 hover:border-slate-200 p-5 rounded hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-3 text-[10px] font-semibold tracking-wider text-brand-bronze uppercase">
                  <span>{news.date}</span>
                  <span>•</span>
                  <span>{news.cat}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 leading-relaxed group-hover:text-brand-bronze transition-colors">
                  <Link href={news.link}>{news.title}</Link>
                </h4>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 9. Investor Call to Action */}
      <ScrollReveal>
        <section className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-6 font-sans">
          <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-bold">
            Stakeholder Engagement
          </span>
          <h2 className="text-3xl font-serif font-medium text-brand-slate-900">
            Interested in Rubinsons Expansion?
          </h2>
          <p className="text-sm text-brand-text-muted max-w-xl mx-auto leading-relaxed">
            Request official prospectus, corporate profiles, and governance charts from our investor relations board.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <TrackCtaLink
              href="/investors"
              location="CTA_Section"
              className="px-6 py-3.5 bg-brand-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-brand-slate-800 transition-colors duration-300"
            >
              Request Investor Package
            </TrackCtaLink>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
