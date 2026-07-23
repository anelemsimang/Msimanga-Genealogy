"use client";

import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, Minus, Crown, BookText } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_HEIGHT, NODE_WIDTH, type PersonNode } from "./layout-tree";

const genderAccent: Record<string, string> = {
  male: "border-l-chart-3",
  female: "border-l-chart-4",
  unknown: "border-l-muted-foreground",
};

function PersonNodeComponent({ data, selected }: NodeProps<PersonNode>) {
  const { member, hasChildren, collapsed, hiddenCount, isRoot, onToggle } = data;

  return (
    <div
      style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT }}
      className={cn(
        "group relative flex flex-col justify-center rounded-xl border border-l-4 bg-card px-3.5 py-2.5 text-left shadow-sm transition-all",
        "hover:shadow-md",
        genderAccent[member.gender] ?? genderAccent.unknown,
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        isRoot && "border-primary/40 bg-primary/5"
      )}
    >
      {/* Incoming edge handle (from parent, above) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!size-1.5 !border-0 !bg-border"
      />

      <div className="flex items-start gap-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {isRoot && (
              <Crown className="size-3.5 shrink-0 text-primary" aria-hidden />
            )}
            <p className="truncate font-heading text-sm font-semibold leading-tight">
              {member.name}
            </p>
          </div>

          {member.order && (
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {member.order}
            </p>
          )}

          {member.spouse && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              <span className="text-primary/70">&#9901;</span> {member.spouse}
            </p>
          )}

          {member.note && (
            <p className="mt-1 flex items-center gap-1 text-[11px] italic text-muted-foreground/80">
              <BookText className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{member.note}</span>
            </p>
          )}
        </div>
      </div>

      {/* Collapse / expand control */}
      {hasChildren && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(member.id);
          }}
          aria-label={
            collapsed
              ? `Expand ${member.name}'s descendants`
              : `Collapse ${member.name}'s descendants`
          }
          className={cn(
            "absolute -bottom-4 left-1/2 z-10 flex h-9 min-w-9 -translate-x-1/2 items-center justify-center gap-1 rounded-full border bg-background px-2.5 text-xs font-medium shadow-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {collapsed ? (
            <>
              <Plus className="size-3.5" />
              {hiddenCount}
            </>
          ) : (
            <Minus className="size-3.5" />
          )}
        </button>
      )}

      {/* Outgoing edge handle (to children, below) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-1.5 !border-0 !bg-border"
      />
    </div>
  );
}

export const PersonNodeView = React.memo(PersonNodeComponent);
