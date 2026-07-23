import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Eye, PencilLine, CheckCircle2, Crown } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Separator } from "@/components/ui/separator";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Family member sign in for the Msimanga family archive. Access is invite-only.",
};

const roles = [
  { icon: Eye, name: "Viewer", desc: "Read everything not marked private." },
  {
    icon: PencilLine,
    name: "Contributor",
    desc: "Propose edits that enter a moderation queue.",
  },
  {
    icon: CheckCircle2,
    name: "Editor",
    desc: "Edit live and review contributions.",
  },
  {
    icon: Crown,
    name: "Admin",
    desc: "Manage roles, invites, and the audit log.",
  },
];

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/admin";

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
      {/* Sign-in card */}
      <div className="mx-auto w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <BrandMark className="size-9" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Family member sign in
          </h1>
          <p className="text-sm text-muted-foreground">
            The archive is invite-only, to protect living relatives&rsquo;
            details. Sign in with your email and password.
          </p>
        </div>

        <div className="mt-8">
          <SignInForm next={safeNext} />
        </div>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          Anonymous visitors can freely read public, non-living-person data.
          Need an invite?{" "}
          <Link href="/sources" className="text-primary hover:underline">
            Learn more about the archive
          </Link>
          .
        </p>
      </div>

      {/* Roles explainer */}
      <div className="rounded-2xl border bg-muted/20 p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold">
            How access works
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Every family member gets a role that decides what they can do. The
          family stays in control of who sees and edits what.
        </p>
        <ul className="mt-6 flex flex-col gap-4">
          {roles.map((role) => (
            <li key={role.name} className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <role.icon className="size-4.5" />
              </div>
              <div>
                <p className="font-heading font-medium">{role.name}</p>
                <p className="text-sm text-muted-foreground">{role.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
