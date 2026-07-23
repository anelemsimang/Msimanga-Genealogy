import { redirect } from "next/navigation";
import { getCurrentRole, getCurrentUser } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, role] = await Promise.all([getCurrentUser(), getCurrentRole()]);
  if (!user) redirect("/auth/sign-in?next=/admin");
  if (role !== "editor" && role !== "admin") {
    redirect("/?error=forbidden");
  }

  return (
    <div className="flex min-h-full flex-col bg-muted/20">
      <AdminHeader email={user.email ?? ""} role={role} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
