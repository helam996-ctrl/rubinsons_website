import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import StoryListClient from "@/components/admin/StoryListClient";

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
  } catch (err) {
    console.error("[AdminStoriesPage] Failed to fetch stories from DB:", err);
    isDbOffline = true;

    stories = [
      {
        id: "mock-s1",
        title: "Inauguration of ICH Dien Culinary Training Wing",
        slug: "inauguration-ich-dien",
        content: "Inauguration details.",
        category: "Corporate",
        imageUrl: null,
        status: "PUBLISHED",
        seoTitle: null,
        seoDescription: null,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "mock-s2",
        title: "Rudra Vahini Foundation launches educational drive",
        slug: "foundation-educational-drive",
        content: "CSR details.",
        category: "CSR",
        imageUrl: null,
        status: "DRAFT",
        seoTitle: null,
        seoDescription: null,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      <StoryListClient
        initialStories={stories}
        isDbOffline={isDbOffline}
      />
    </main>
  );
}
