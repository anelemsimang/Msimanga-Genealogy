import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthNav } from "@/components/auth-nav";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader authSlot={<AuthNav />} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
