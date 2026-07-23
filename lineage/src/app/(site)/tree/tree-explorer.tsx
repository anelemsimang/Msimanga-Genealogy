"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Network, MousePointer2, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FamilyMember } from "@/lib/family-tree";
import type { FamilyChart } from "@/lib/people/service";
import { FamilyChartView } from "./family-chart";
import { TreeView } from "./tree-view";

type ViewMode = "chart" | "map";

export function TreeExplorer({
  chart,
  tree,
  total,
  mode: initialMode,
  focusSlug,
}: {
  chart: FamilyChart;
  tree: FamilyMember | null;
  total: number;
  mode: ViewMode;
  focusSlug: string;
}) {
  const router = useRouter();
  // Local state for instant toggle; URL stays in sync for sharing/bookmarks.
  const [mode, setMode] = React.useState<ViewMode>(initialMode);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const switchMode = (next: ViewMode) => {
    setMode(next);
    const params = new URLSearchParams();
    params.set("person", focusSlug);
    if (next === "map") params.set("view", "map");
    router.replace(`/tree?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="inline-flex w-full rounded-lg border bg-card p-1 shadow-sm sm:w-fit">
          <button
            type="button"
            onClick={() => switchMode("chart")}
            className={cn(
              "inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
              mode === "chart"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="size-4" />
            Family chart
          </button>
          <button
            type="button"
            onClick={() => switchMode("map")}
            className={cn(
              "inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
              mode === "map"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Network className="size-4" />
            Whole tree
          </button>
        </div>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          {mode === "chart" ? (
            <>
              One household at a time for easy reading. Prefer the big picture?{" "}
              <button
                type="button"
                onClick={() => switchMode("map")}
                className="min-h-9 font-medium text-primary hover:underline"
              >
                Open the whole tree
              </button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1">
                <MousePointer2 className="size-3.5" /> Drag to pan
              </span>
              <span className="inline-flex items-center gap-1 md:hidden">
                <ZoomIn className="size-3.5" /> Pinch to zoom
              </span>
              <span className="hidden items-center gap-1 md:inline-flex">
                <ZoomIn className="size-3.5" /> Scroll or +/− to zoom
              </span>
              <span className="hidden sm:inline">
                Tap a person for details, or open their{" "}
                <span className="font-medium">Family chart</span>.
              </span>
            </>
          )}
        </p>
      </div>

      {/* Keep both mounted once visited so toggling feels instant; hide inactive. */}
      <div className={cn(mode !== "chart" && "hidden")}>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <FamilyChartView chart={chart} />
          <div className="border-t bg-muted/20 px-4 py-3 text-center">
            <button
              type="button"
              onClick={() => switchMode("map")}
              className="text-sm font-medium text-primary hover:underline"
            >
              See {chart.focus.full_name.split(" ")[0]} in the whole tree →
            </button>
          </div>
        </div>
      </div>

      <div className={cn(mode !== "map" && "hidden")}>
        {tree ? (
          <div className="h-[min(70dvh,40rem)] min-h-[20rem] w-full overflow-hidden rounded-xl border shadow-sm sm:min-h-[28rem] md:h-[calc(100vh-16rem)] md:min-h-[32rem]">
            <TreeView
              tree={tree}
              total={total}
              focusId={focusSlug}
              onOpenFamilyChart={(slug) => {
                setMode("chart");
                router.push(`/tree?person=${encodeURIComponent(slug)}`);
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            Whole-tree view needs a connected tree in the archive.{" "}
            <Link href="/search" className="text-primary hover:underline">
              Browse people
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
