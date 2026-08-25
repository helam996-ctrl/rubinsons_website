import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import LeadershipListClient from "@/components/admin/LeadershipListClient";

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
  } catch (err) {
    console.error("[AdminLeadershipPage] Failed to fetch leaders from DB:", err);
    isDbOffline = true;

    leaders = [
      { id: "mock-l1", name: "Dr. Rudra Bhanu", role: "Managing Director", biography: "", imageUrl: null, order: 1 },
      { id: "mock-l2", name: "Bindu Sharma", role: "Director", biography: "", imageUrl: null, order: 2 },
      { id: "mock-l3", name: "Shreyashi Sharma", role: "Director", biography: "", imageUrl: null, order: 3 },
      { id: "mock-l4", name: "Nipun Sharma", role: "Director", biography: "", imageUrl: null, order: 4 },
      { id: "mock-l5", name: "Stuti Sharma", role: "Director", biography: "", imageUrl: null, order: 5 },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      <LeadershipListClient
        initialLeaders={leaders}
        isDbOffline={isDbOffline}
      />
    </main>
  );
}
