import { CanvasNode } from "@/type/types";
import dagre from "@dagrejs/dagre";
import { Edge } from "@xyflow/react";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export const getLayoutElements = (
  nodes: CanvasNode[],
  edges: Edge[],
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    const { width = 300, height = 200 } = node.measured ?? {};
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const { width = 300, height = 200 } = node.measured ?? {};
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };

    return newNode as CanvasNode;
  });

  return { nodes: newNodes, edges };
};
