import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";

export default async function AdminProjectsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let projects = [];
  let isDbOffline = false;

  try {
    projects = await prisma.project.findMany({
      include: { business: true },
      orderBy: { order: "asc" },
    });
  } catch {
    isDbOffline = true;

    projects = [
      {
        id: "mock-p1",
        title: "Commercial Complex Alpha",
        slug: "commercial-complex-alpha",
        status: "COMPLETED",
        order: 1,
        business: { title: "Rubinsons Builders & Infrastructure" },
      },
      {
        id: "mock-p2",
        title: "Highway Bypass Execution",
        slug: "highway-bypass-execution",
        status: "ACTIVE",
        order: 2,
        business: { title: "Rubinsons Contracting" },
      },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
            Portfolios
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
            Sectors Projects
          </h1>
        </div>
        <button
          disabled={isDbOffline}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          + Add New Project
        </button>
      </div>

      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying offline placeholders. CRUD actions are disabled.
          </p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Project Title</th>
              <th className="px-6 py-3">Sector Link</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{p.order}</td>
                <td className="px-6 py-4 font-semibold">{p.title}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                  {p.business?.title || "Unassigned"}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/20">
                    {p.status}
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
