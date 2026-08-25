import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import ProjectListClient from "@/components/admin/ProjectListClient";

export default async function AdminProjectsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let projects = [];
  let businesses = [];
  let isDbOffline = false;

  try {
    const [dbProjects, dbBusinesses] = await Promise.all([
      prisma.project.findMany({
        include: { business: true },
        orderBy: { order: "asc" },
      }),
      prisma.business.findMany({
        where: { status: "ACTIVE" },
        orderBy: { order: "asc" },
      }),
    ]);
    projects = dbProjects;
    businesses = dbBusinesses;
  } catch (err) {
    console.error("[AdminProjectsPage] Failed to fetch projects or businesses from DB:", err);
    isDbOffline = true;

    projects = [
      {
        id: "mock-p1",
        title: "Commercial Complex Alpha",
        slug: "commercial-complex-alpha",
        description: "Representative project execution.",
        imageUrl: "/images/builders_infrastructure.jpg",
        status: "COMPLETED",
        order: 1,
        businessId: "mock-b1",
        business: { title: "Rubinsons Builders & Infrastructure" },
      },
      {
        id: "mock-p2",
        title: "Highway Bypass Execution",
        slug: "highway-bypass-execution",
        description: "Infrastructure project execution.",
        imageUrl: "/images/contracting_services.jpg",
        status: "ACTIVE",
        order: 2,
        businessId: "mock-b2",
        business: { title: "Rubinsons Contracting" },
      },
    ];

    businesses = [
      { id: "mock-b1", title: "Rubinsons Builders & Infrastructure" },
      { id: "mock-b2", title: "Rubinsons Contracting" },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      <ProjectListClient
        initialProjects={projects}
        businesses={businesses}
        isDbOffline={isDbOffline}
      />
    </main>
  );
}
