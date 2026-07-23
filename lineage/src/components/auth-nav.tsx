import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentRole, getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionaries";

/** Sign-in button, or a Dashboard link when the user can edit. */
export async function AuthNav({ className }: { className?: string }) {
  const [user, role] = await Promise.all([getCurrentUser(), getCurrentRole()]);
  const canEdit = role === "editor" || role === "admin";

  if (user && canEdit) {
    return (
      <Button
        render={<Link href="/admin" />}
        nativeButton={false}
        size="sm"
        className={className}
      >
        <LayoutDashboard className="size-4" />
        Dashboard
      </Button>
    );
  }

  if (user) {
    return (
      <Button
        render={<Link href="/admin" />}
        nativeButton={false}
        size="sm"
        variant="outline"
        className={className}
      >
        {user.email?.split("@")[0]}
      </Button>
    );
  }

  return (
    <Button
      render={<Link href="/auth/sign-in" />}
      nativeButton={false}
      size="sm"
      className={className}
    >
      {t("header.signIn")}
    </Button>
  );
}
