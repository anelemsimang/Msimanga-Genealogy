import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthNav } from "@/components/auth-nav";
import { BrandLoader } from "@/components/brand-loader";

function AuthNavFallback() {
  return (
    <div
      className="hidden h-8 w-20 animate-pulse rounded-md bg-muted sm:block"
      aria-hidden="true"
    />
  );
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader
        authSlot={
          <Suspense fallback={<AuthNavFallback />}>
            <AuthNav />
          </Suspense>
        }
      />
      <main className="flex-1">
        <Suspense fallback={<BrandLoader fullPage label="Opening the archive…" />}>
          {children}
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
