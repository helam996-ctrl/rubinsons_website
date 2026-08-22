import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";

export default async function AdminLeadershipPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let leaders = [];
  let isDbOffline = false;

  try {
    leaders = await prisma.leadership.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
    isDbOffline = true;

    leaders = [
      { id: "mock-l1", name: "Dr. Rudra Bhanu", role: "Managing Director", order: 1 },
      { id: "mock-l2", name: "Bindu Sharma", role: "Director", order: 2 },
      { id: "mock-l3", name: "Shreyashi Sharma", role: "Director", order: 3 },
      { id: "mock-l4", name: "Nipun Sharma", role: "Director", order: 4 },
      { id: "mock-l5", name: "Stuti Sharma", role: "Director", order: 5 },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
            Governance
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
            Board of Directors
          </h1>
        </div>
        <button
          disabled={isDbOffline}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          + Add Board Profile
        </button>
      </div>

      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified leadership registry. Reordering weights and edits are disabled.
          </p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Leader Name</th>
              <th className="px-6 py-3">Designation</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {leaders.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{l.order}</td>
                <td className="px-6 py-4 font-semibold">{l.name}</td>
                <td className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  {l.role}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    disabled={isDbOffline}
                    className="text-xs text-brand-bronze-dark hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Edit Biography
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
