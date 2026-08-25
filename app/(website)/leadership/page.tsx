import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function LeadershipPage() {
  let leaders = [];
  let isDbOffline = false;

  try {
    leaders = await prisma.leadership.findMany({
      orderBy: { order: "asc" },
    });
  } catch (err) {
    console.error("[LeadershipPage] Failed to fetch leaders from DB:", err);
    isDbOffline = true;

    leaders = [
      { name: "Dr. Rudra Bhanu", role: "Managing Director", biography: "", imageUrl: null },
      { name: "Bindu Sharma", role: "Director", biography: "", imageUrl: null },
      { name: "Shreyashi Sharma", role: "Director", biography: "", imageUrl: null },
      { name: "Nipun Sharma", role: "Director", biography: "", imageUrl: null },
      { name: "Stuti Sharma", role: "Director", biography: "", imageUrl: null },
    ];
  }

  return (
    <main className="max-w-7xl mx-auto px-6 sm:px-8 py-16 space-y-12 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8 space-y-2">
        <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
          Governance
        </span>
        <h1 className="text-4xl font-serif font-medium text-brand-slate-900">
          Board of Directors
        </h1>
        <p className="text-sm text-brand-text-muted max-w-2xl">
          Rubinsons Private Limited maintains strict administrative and board controls, guiding
          corporate strategies and investment roadmap outlines.
        </p>
      </div>

      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r text-xs text-amber-800">
          *Database offline: Displaying verified leadership registry.
        </div>
      )}

      {/* Grid Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {leaders.map((l) => (
          <div key={l.name} className="border border-slate-200 rounded p-8 bg-white flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                {l.imageUrl ? (
                  <img src={l.imageUrl} alt={l.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-200">
                    {l.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-serif font-medium text-brand-slate-900 leading-tight">{l.name}</h2>
                <p className="text-xs uppercase tracking-wider text-brand-bronze-dark font-semibold mt-1">
                  {l.role}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-brand-text-muted leading-relaxed whitespace-pre-wrap">
                {l.biography || "Biography and corporate governance statement credentials managed and loaded dynamically via the CMS."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
