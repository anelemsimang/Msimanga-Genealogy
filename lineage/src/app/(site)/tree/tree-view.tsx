"use client";

import * as React from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import {
  X,
  Crown,
  BookText,
  Maximize2,
  Minimize2,
  Users2,
  BookOpen,
} from "lucide-react";
import { familyTreeSource, type FamilyMember } from "@/lib/family-tree";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buildLayout, type PersonNode } from "./layout-tree";
import { PersonNodeView } from "./person-node";

const nodeTypes = { person: PersonNodeView };

/** Collect the ids of every member that has children (used for collapse-all). */
function collectParentIds(
  member: FamilyMember,
  acc: Set<string> = new Set()
): Set<string> {
  if (member.children?.length) {
    acc.add(member.id);
    for (const child of member.children) collectParentIds(child, acc);
  }
  return acc;
}

/** The five branch heads (grandchildren of Hlomza) — a useful default view. */
const BRANCH_HEADS = new Set([
  "masole",
  "ndlebe",
  "gaxa-james",
  "mayifuthi",
  "matshakeni",
]);

function TreeCanvas({
  tree,
  total,
  focusId,
  onOpenFamilyChart,
}: {
  tree: FamilyMember;
  total: number;
  focusId?: string;
  onOpenFamilyChart?: (slug: string) => void;
}) {
  const { fitView } = useReactFlow();
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<string>>(
    () => new Set(BRANCH_HEADS)
  );
  const [selected, setSelected] = React.useState<FamilyMember | null>(null);

  const onToggle = React.useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const { nodes, edges } = React.useMemo(() => {
    const layout = buildLayout(tree, collapsed, onToggle);
    const nodes: PersonNode[] = layout.nodes.map((node) => ({
      ...node,
      selected: node.id === selected?.id || node.id === focusId,
    }));
    return { nodes, edges: layout.edges as Edge[] };
  }, [tree, collapsed, onToggle, selected, focusId]);

  // Re-fit the viewport whenever the visible set of nodes changes.
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.2, duration: 400 });
    });
    return () => cancelAnimationFrame(frame);
  }, [collapsed, fitView]);

  const expandAll = React.useCallback(() => setCollapsed(new Set()), []);
  const collapseAll = React.useCallback(
    () => setCollapsed(collectParentIds(tree)),
    [tree]
  );
  const resetView = React.useCallback(
    () => setCollapsed(new Set(BRANCH_HEADS)),
    []
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) =>
          setSelected((node as PersonNode).data.member)
        }
        onPaneClick={() => setSelected(null)}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.08}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        className="bg-muted/20"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          className="text-border"
        />
        <Controls
          showInteractive={false}
          className="!rounded-lg !border !border-border !bg-background !shadow-sm [&_button]:!border-border [&_button]:!bg-background [&_button:hover]:!bg-accent [&_button_svg]:!fill-foreground"
        />
        <MiniMap
          pannable
          zoomable
          className="!hidden !rounded-lg !border !border-border !bg-background md:!block"
          maskColor="oklch(0 0 0 / 0.06)"
          nodeColor={(n) =>
            (n as PersonNode).data.member.gender === "female"
              ? "var(--chart-4)"
              : "var(--chart-3)"
          }
        />
      </ReactFlow>

      {/* Toolbar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-2 sm:p-3">
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur sm:gap-2 sm:p-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="min-h-9 px-2 sm:px-3"
            onClick={expandAll}
          >
            <Maximize2 className="size-4" />
            <span className="hidden sm:inline">Expand all</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="min-h-9 px-2 sm:px-3"
            onClick={collapseAll}
          >
            <Minimize2 className="size-4" />
            <span className="hidden sm:inline">Collapse all</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="min-h-9 px-2 sm:px-3"
            onClick={resetView}
          >
            <Users2 className="size-4" />
            <span className="hidden sm:inline">Branches</span>
          </Button>
        </div>

        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border bg-background/90 px-2.5 py-2 text-xs shadow-sm backdrop-blur sm:px-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-3" /> Male
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-4" /> Female
          </span>
          <span className="hidden text-muted-foreground sm:inline">
            {total} people
          </span>
        </div>
      </div>

      {/* Detail panel — bottom sheet on mobile, side card on desktop */}
      {selected && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 max-h-[55%] overflow-y-auto rounded-t-xl border border-b-0 bg-background/95 p-4 shadow-lg backdrop-blur sm:inset-x-auto sm:right-3 sm:top-20 sm:bottom-auto sm:max-h-none sm:w-[min(20rem,calc(100%-1.5rem))] sm:rounded-xl sm:border-b">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {selected.id === tree.id && (
                <Crown className="size-4 shrink-0 text-primary" />
              )}
              <h3 className="font-heading text-lg font-semibold leading-tight">
                {selected.name}
              </h3>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="-mr-1 -mt-1 size-10 shrink-0"
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="capitalize">
              {selected.gender}
            </Badge>
            {selected.order && (
              <Badge variant="outline">{selected.order}</Badge>
            )}
          </div>

          {selected.house && (
            <p className="mt-3 text-sm font-medium text-primary">
              {selected.house}
            </p>
          )}

          {selected.spouse && (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Married
              </p>
              <p className="mt-0.5 text-sm">{selected.spouse}</p>
            </div>
          )}

          {selected.note && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <BookText className="size-3.5" /> From the record
              </p>
              <p className="mt-1 text-sm leading-relaxed">{selected.note}</p>
            </div>
          )}

          {selected.children?.length ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {selected.children.length}{" "}
              {selected.children.length === 1 ? "child" : "children"} recorded
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            {onOpenFamilyChart && (
              <Button
                size="sm"
                className="w-full"
                onClick={() => onOpenFamilyChart(selected.id)}
              >
                <BookOpen className="size-4" /> Open family chart
              </Button>
            )}
            <Button
              render={<Link href={`/people/${selected.id}`} />}
              nativeButton={false}
              size="sm"
              variant="outline"
              className="w-full"
            >
              View full profile
            </Button>
          </div>
        </div>
      )}

      {/* Source attribution */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-3 left-1/2 z-0 hidden -translate-x-1/2 text-center text-[11px] text-muted-foreground/70 md:block",
          selected && "md:hidden"
        )}
      >
        <span className="rounded-full border bg-background/80 px-3 py-1 backdrop-blur">
          Source: {familyTreeSource.title} — compiled by{" "}
          {familyTreeSource.compiler}, {familyTreeSource.place}
        </span>
      </div>
    </div>
  );
}

export function TreeView({
  tree,
  total,
  focusId,
  onOpenFamilyChart,
}: {
  tree: FamilyMember;
  total: number;
  focusId?: string;
  onOpenFamilyChart?: (slug: string) => void;
}) {
  return (
    <ReactFlowProvider>
      <TreeCanvas
        tree={tree}
        total={total}
        focusId={focusId}
        onOpenFamilyChart={onOpenFamilyChart}
      />
    </ReactFlowProvider>
  );
}
