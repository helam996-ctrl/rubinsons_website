import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAuthorized =
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "EDITOR" ||
    role === "INVESTOR_RELATIONS";

  if (!isAuthorized) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
