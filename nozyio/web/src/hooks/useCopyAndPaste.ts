import useAppStore from "@/canvas/store";
import { CanvasNode } from "@/type/types";
import { useRef, useEffect } from "react";
import { useDebounceFunc } from "./useDebounceFunc";
import { useReactFlow } from "@xyflow/react";
import { get_handle_uid } from "@/utils/canvasUtils";

export function useCopyAndPaste() {
  const { screenToFlowPosition } = useReactFlow();
  const copiedNodeRef = useRef<CanvasNode | null>(null);
  const mousePositionRef = useRef<{ x: number; y: number }>();

  const onMouseMove = useDebounceFunc((event: MouseEvent) => {
    mousePositionRef.current = { x: event.clientX, y: event.clientY };
  }, 100);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).nodeName) &&
        (e.ctrlKey || e.metaKey) &&
        ["c", "v"].includes(e.key)
      ) {
        const { nodes, addNode, selectedNodeIDs, values } =
          useAppStore.getState();
        if (e.key === "c") {
          e.preventDefault();
          const selectedNode = nodes.find(
            (node) => node.id === selectedNodeIDs[0]
          );
          if (selectedNode) {
            copiedNodeRef.current = { ...selectedNode, selected: false };
          }
        } else if (e.key === "v" && copiedNodeRef.current) {
          e.preventDefault();
          const position = screenToFlowPosition({
            x:
              mousePositionRef.current?.x ??
              copiedNodeRef.current.position.x + 100,
            y:
              mousePositionRef.current?.y ??
              copiedNodeRef.current.position.y + 100,
          });
          const newNode = {
            ...copiedNodeRef.current,
            position: position,
          };

          newNode.data.input?.forEach((input) => {
            input.default =
              values[get_handle_uid("input", newNode.id, input.id!)] ?? null;
          });

          delete (newNode as Omit<CanvasNode, "id"> & { id?: string }).id;
          addNode(newNode);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);
}
