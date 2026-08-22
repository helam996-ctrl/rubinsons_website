import { prisma } from "@/lib/db/client";

export default async function LeadershipPage() {
  let leaders = [];
  let isDbOffline = false;

  try {
    leaders = await prisma.leadership.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
    isDbOffline = true;

    leaders = [
      { name: "Dr. Rudra Bhanu", role: "Managing Director" },
      { name: "Bindu Sharma", role: "Director" },
      { name: "Shreyashi Sharma", role: "Director" },
      { name: "Nipun Sharma", role: "Director" },
      { name: "Stuti Sharma", role: "Director" },
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
          <div key={l.name} className="border border-slate-200 rounded p-8 bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-medium text-brand-slate-900">{l.name}</h2>
              <p className="text-xs uppercase tracking-wider text-brand-bronze-dark font-semibold">
                {l.role}
              </p>
              <p className="text-xs text-brand-text-muted leading-relaxed pt-2">
                Biography and corporate governance statement credentials managed and loaded dynamically via the CMS.
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
