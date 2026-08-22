import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";

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
        status: "ACTIVE",
        order: 1,
      },
      {
        id: "mock-2",
        slug: "contracting",
        title: "Rubinsons Contracting",
        shortDescription: "Private and public sector contracting services.",
        status: "ACTIVE",
        order: 2,
      },
      {
        id: "mock-3",
        slug: "ich-dien-academia",
        title: "ICH Dien Academia",
        shortDescription: "Education, skill development, and events.",
        status: "ACTIVE",
        order: 3,
      },
      {
        id: "mock-4",
        slug: "healthcare",
        title: "Healthcare / Shanti Medical Hall",
        shortDescription: "Distribution of medical supplies and retail pharma.",
        status: "ACTIVE",
        order: 4,
      },
      {
        id: "mock-5",
        slug: "digital-media-marketing",
        title: "Rubinsons Digital Media & Marketing",
        shortDescription: "Digital advertising, strategy, and media creation.",
        status: "ACTIVE",
        order: 5,
      },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
            Sectors
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
            Business Divisions
          </h1>
        </div>
        <button
          disabled={isDbOffline}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          + Add New Sector
        </button>
      </div>

      {/* Warning banner */}
      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified company sectors from specifications. Creation and deletions are locked until database connection is established.
          </p>
        </div>
      )}

      {/* Grid List */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Sector Title</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{b.order}</td>
                <td className="px-6 py-4 font-semibold">{b.title}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{b.slug}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    disabled={isDbOffline}
                    className="text-xs text-brand-bronze-dark hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    disabled={isDbOffline}
                    className="text-xs text-red-600 hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
