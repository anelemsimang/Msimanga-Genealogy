import type { Metadata } from "next";
import Link from "next/link";
import { GitBranch, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { familyTreeSource, type FamilyMember } from "@/lib/family-tree";
import {
  getTree,
  getFamilyChart,
  countPeople,
  type TreeNode,
} from "@/lib/people/service";
import { clanName } from "@/lib/clan";
import { TreeExplorer } from "./tree-explorer";

export const metadata: Metadata = {
  title: "Family tree — Usapho lakwaMsimanga",
  description:
    "A reading-friendly family chart of the Msimanga clan, with an interactive map of the whole tree.",
};

function toFamilyMember(node: TreeNode): FamilyMember {
  return {
    id: node.id,
    name: node.name,
    gender: node.gender,
    spouse: node.spouse,
    order: node.order,
    note: node.note,
    house: node.house,
    children: node.children?.map(toFamilyMember),
  };
}

export default async function TreePage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string; view?: string }>;
}) {
  const { person, view } = await searchParams;
  const mode = view === "map" ? "map" : "chart";

  const [chart, tree, total] = await Promise.all([
    getFamilyChart(person),
    getTree(),
    countPeople(),
  ]);

  return (
    <div className="flex flex-col">
      <section className="border-b bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <Badge variant="secondary" className="gap-1.5 py-1.5 pl-1.5 pr-3">
            <BrandMark className="size-4" />
            {total} people recorded
          </Badge>
          <h1 className="mt-4 flex flex-wrap items-start gap-2.5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            <GitBranch className="mt-1 size-7 shrink-0 text-primary" />
            <span className="min-w-0">
              The{" "}
              <span translate="no" className="notranslate text-primary">
                {clanName}
              </span>{" "}
              family tree
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Use the <span className="font-medium">Family chart</span> to read
            one household at a time, or switch to{" "}
            <span className="font-medium">Whole tree</span> to pan, zoom, and
            explore the entire clan on one canvas.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[110rem] px-3 py-4 sm:px-4">
        {chart ? (
          <>
            <TreeExplorer
              chart={chart}
              tree={tree ? toFamilyMember(tree) : null}
              total={total}
              mode={mode}
              focusSlug={chart.focus.slug}
            />
            <p className="mt-4 px-1 text-xs leading-relaxed text-muted-foreground">
              {familyTreeSource.note} Source: <em>{familyTreeSource.title}</em>,
              compiled and circulated by {familyTreeSource.compiler} (
              {familyTreeSource.place}).
            </p>
          </>
        ) : (
          <EmptyTree />
        )}
      </section>
    </div>
  );
}

function EmptyTree() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Database className="size-7" />
      </div>
      <h2 className="font-heading text-xl font-semibold">
        The archive is empty
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        No people are in the database yet. Run{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">npm run seed</code> to
        load the family record, or sign in and add the first person.
      </p>
      <Button render={<Link href="/admin" />} nativeButton={false}>
        Go to the dashboard
      </Button>
    </div>
  );
}
