import { prisma } from "@/lib/db/client";

export default async function StoriesPage() {
  let stories = [];
  let isDbOffline = false;

  try {
    stories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    isDbOffline = true;

    stories = [
      {
        id: "s1",
        title: "Inauguration of ICH Dine Culinary Training Wing",
        category: "Corporate",
        content: "We are pleased to announce the inauguration of the new culinary training and skill development facilities at ICH Dine Academia. This reinforces our dedication to vocational training.",
        createdAt: new Date("2026-08-19T10:00:00Z"),
      },
      {
        id: "s2",
        title: "Rudra Vahini Foundation launches educational drive",
        category: "CSR",
        content: "The Rudra Vahini Foundation has launched its 2026 school development campaign, providing educational resources and kits to children across regional sectors.",
        createdAt: new Date("2026-08-18T10:00:00Z"),
      },
    ];
  }

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 py-16 space-y-12 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8 space-y-2">
        <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
          Newsroom
        </span>
        <h1 className="text-4xl font-serif font-medium text-brand-slate-900">
          Stories & Press Releases
        </h1>
        <p className="text-sm text-brand-text-muted">
          Read announcements, CSR progress reports, and corporate updates from the Rubinsons Group.
        </p>
      </div>

      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r text-xs text-amber-800">
          *Database offline: Displaying offline placeholders.
        </div>
      )}

      {/* Stories Listing */}
      <div className="space-y-10">
        {stories.map((s) => (
          <div key={s.id} className="border-b border-slate-100 pb-10 space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-brand-bronze-dark uppercase tracking-wider">
                {s.category}
              </span>
              <span>&bull;</span>
              <span>{s.createdAt.toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl font-serif font-medium text-brand-slate-900 leading-tight">
              {s.title}
            </h2>
            <p className="text-sm text-brand-text-muted leading-relaxed max-w-2xl">
              {s.content}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
