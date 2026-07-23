/**
 * A small, dependency-free "tidy tree" layout for the Msimanga family tree.
 *
 * We compute (x, y) positions ourselves rather than pulling in a layout library:
 *  - depth maps to the vertical axis (root at the top, generations flow down);
 *  - leaves are packed left-to-right into columns, and every parent is centred
 *    over the span of its visible children.
 *
 * The result is fed straight into React Flow as pre-positioned nodes + edges.
 * Collapsed nodes are treated as leaves so whole branches can be folded away.
 */
import type { Edge, Node } from "@xyflow/react";
import type { FamilyMember } from "@/lib/family-tree";

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 104;

const X_GAP = 34;
const Y_GAP = 76;
const X_SPACING = NODE_WIDTH + X_GAP;
const Y_SPACING = NODE_HEIGHT + Y_GAP;

export interface PersonNodeData extends Record<string, unknown> {
  member: FamilyMember;
  hasChildren: boolean;
  collapsed: boolean;
  /** Number of descendants hidden while this node is collapsed. */
  hiddenCount: number;
  isRoot: boolean;
  onToggle: (id: string) => void;
}

export type PersonNode = Node<PersonNodeData, "person">;

/** Total number of descendants beneath a member (all generations). */
function countDescendants(member: FamilyMember): number {
  return (member.children ?? []).reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0
  );
}

export interface LayoutResult {
  nodes: PersonNode[];
  edges: Edge[];
}

export function buildLayout(
  root: FamilyMember,
  collapsed: ReadonlySet<string>,
  onToggle: (id: string) => void
): LayoutResult {
  const nodes: PersonNode[] = [];
  const edges: Edge[] = [];
  let nextLeafColumn = 0;

  const walk = (member: FamilyMember, depth: number): number => {
    const children = member.children ?? [];
    const hasChildren = children.length > 0;
    const isCollapsed = collapsed.has(member.id);
    const expanded = hasChildren && !isCollapsed;

    let x: number;
    if (expanded) {
      const childCenters = children.map((child) => walk(child, depth + 1));
      x = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    } else {
      x = nextLeafColumn * X_SPACING;
      nextLeafColumn += 1;
    }

    nodes.push({
      id: member.id,
      type: "person",
      position: { x, y: depth * Y_SPACING },
      data: {
        member,
        hasChildren,
        collapsed: isCollapsed,
        hiddenCount: hasChildren ? countDescendants(member) : 0,
        isRoot: depth === 0,
        onToggle,
      },
      // Draw the trunk before the leaves so edges sit underneath the cards.
      zIndex: 1,
    });

    if (expanded) {
      for (const child of children) {
        edges.push({
          id: `${member.id}--${child.id}`,
          source: member.id,
          target: child.id,
          type: "smoothstep",
          style: { strokeWidth: 1.5 },
        });
      }
    }

    return x;
  };

  walk(root, 0);
  return { nodes, edges };
}
