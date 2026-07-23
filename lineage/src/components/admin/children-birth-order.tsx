"use client";

import * as React from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Baby, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/person-avatar";
import { reorderPeopleAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import type { Gender } from "@/lib/supabase/types";

export type BirthOrderChild = {
  id: string;
  slug: string;
  full_name: string;
  gender: Gender;
  honorific: string | null;
  imageUrl: string | null;
  sort_order: number | null;
};

function SortableRow({
  child,
  index,
}: {
  child: BirthOrderChild;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: child.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card px-2 py-2 sm:gap-3 sm:px-3",
        isDragging && "z-10 border-primary shadow-md ring-2 ring-primary/20"
      )}
    >
      <button
        type="button"
        className="flex size-10 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-accent active:cursor-grabbing touch-none"
        aria-label={`Drag to reorder ${child.full_name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
        {index + 1}
      </span>

      <PersonAvatar
        name={child.full_name}
        gender={child.gender}
        imageUrl={child.imageUrl}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{child.full_name}</p>
        {child.honorific && (
          <p className="truncate text-xs text-muted-foreground">
            {child.honorific}
          </p>
        )}
      </div>

      <Button
        render={<Link href={`/admin/people/${child.id}/edit`} />}
        nativeButton={false}
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        aria-label={`Edit ${child.full_name}`}
      >
        <Pencil className="size-3.5" />
      </Button>
    </li>
  );
}

/**
 * Elementor-style drag list to set birth order among a parent's children.
 * Top of the list = eldest (lowest sort_order).
 */
export function ChildrenBirthOrder({
  parentId,
  parentName,
  children: initialChildren,
}: {
  parentId: string;
  parentName: string;
  children: BirthOrderChild[];
}) {
  const [items, setItems] = React.useState(initialChildren);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setItems(initialChildren);
  }, [initialChildren]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (items.length < 2) {
    if (items.length === 1) {
      return (
        <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Baby className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Children birth order
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {parentName} has one child recorded. Add another sibling to
                rearrange birth order.
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 rounded-lg border px-3 py-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                1
              </span>
              <PersonAvatar
                name={items[0].full_name}
                gender={items[0].gender}
                imageUrl={items[0].imageUrl}
                size="sm"
              />
              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                {items[0].full_name}
              </p>
            </li>
          </ul>
        </section>
      );
    }
    return null;
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex);
    const previous = items;
    setItems(next);
    setSaving(true);

    const result = await reorderPeopleAction(
      parentId,
      next.map((c) => c.id)
    );
    setSaving(false);

    if (!result.ok) {
      setItems(previous);
      toast.error("Could not save birth order", { description: result.error });
      return;
    }
    toast.success("Birth order updated");
  };

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Baby className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-semibold">
              Children birth order
            </h2>
            {saving && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Drag to rearrange {parentName}&rsquo;s children. Top = eldest,
            bottom = youngest. Changes apply to the tree and family chart.
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {items.map((child, index) => (
              <SortableRow key={child.id} child={child} index={index} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}
