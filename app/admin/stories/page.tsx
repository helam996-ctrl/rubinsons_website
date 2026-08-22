import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";

export default async function AdminStoriesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

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
        id: "mock-s1",
        title: "Inauguration of ICH Dine Culinary Training Wing",
        category: "Corporate",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        id: "mock-s2",
        title: "Rudra Vahini Foundation launches educational drive",
        category: "CSR",
        status: "DRAFT",
        publishedAt: null,
      },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
            Press & Media
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
            Stories & Press Releases
          </h1>
        </div>
        <button
          disabled={isDbOffline}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          + Write New Story
        </button>
      </div>

      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying offline placeholders. Creation and publish actions are locked.
          </p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3">Published Date</th>
              <th className="px-6 py-3">Story Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {stories.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">
                  {s.publishedAt ? s.publishedAt.toLocaleDateString() : "Not Published"}
                </td>
                <td className="px-6 py-4 font-semibold">{s.title}</td>
                <td className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  {s.category}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      s.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    disabled={isDbOffline}
                    className="text-xs text-brand-bronze-dark hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Edit Content
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
