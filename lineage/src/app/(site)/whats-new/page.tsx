import type { Metadata } from "next";
import Link from "next/link";
import { History, GitBranch, Users, ScrollText, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countPeople } from "@/lib/people/service";

export const metadata: Metadata = {
  title: "What's new",
  description: "Recent milestones and changes in the Msimanga family archive.",
};

export default async function WhatsNewPage() {
  const total = await countPeople();

  const milestones = [
    {
      icon: GitBranch,
      title: "The family tree is published",
      detail:
        "An interactive tree of the whole clan, from Hlomza down through the founding houses, is now live.",
      tag: "Tree",
      href: "/tree",
    },
    {
      icon: Users,
      title: `${total} people in the archive`,
      detail:
        "Every person now has a profile with their life events, marriage, parents, siblings, and children linked together.",
      tag: "People",
      href: "/search",
    },
    {
      icon: ScrollText,
      title: "The primary record is documented",
      detail:
        "The isiXhosa source, its translation, and the kinship terms it uses are all set out on the Sources page.",
      tag: "Sources",
      href: "/sources",
    },
    {
      icon: Sparkles,
      title: "Izithakazelo zakwaMsimanga recorded",
      detail:
        "The clan praises are preserved in their original form and shown on the home page.",
      tag: "Heritage",
      href: "/",
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={History}
        eyebrow="Recent changes"
        title="What's new"
        description="Milestones as the archive grows. Once family members can sign in, every contribution and edit will show up here as it happens."
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <ol className="flex flex-col gap-4">
          {milestones.map((m) => (
            <li key={m.title}>
              <Link
                href={m.href}
                className="group flex items-start gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <m.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading font-semibold group-hover:text-primary">
                      {m.title}
                    </h2>
                    <Badge variant="secondary">{m.tag}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {m.detail}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-xl border border-dashed p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Live change tracking — who added what, and when — arrives with
            family member accounts.
          </p>
          <Button
            render={<Link href="/auth/sign-in" />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Family member sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
