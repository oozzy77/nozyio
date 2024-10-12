import { Edge, NodeChange } from "@xyflow/react";
import { CanvasNode } from "@/type/types";
import useAppStore from "@/canvas/store";

interface StackType {
  nodes: CanvasNode[];
  edges: Edge[];
}

class UndoRedo {
  public undoStack: StackType[] = [];
  private redoStack: StackType[] = [];
  private nodeMoveOrResizeStorage: CanvasNode[] = [];

  constructor() {
    const onKeydown = (e: KeyboardEvent) => {
      const isUndo = (e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey; // Ctrl/Command + z
      const isRedo =
        (e.ctrlKey || e.metaKey) &&
        ((e.shiftKey && e.key === "z") || e.key === "y"); // Ctrl/Command + Shift + z ||  Ctrl/Command + y

      if (isUndo || isRedo) {
        const target = e.target as HTMLElement;
        if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA") {
          document.execCommand(isUndo ? "undo" : "redo");
          e.preventDefault();
          return;
        }

        if (isUndo) {
          this.undo();
        } else {
          this.redo();
        }
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeydown);
  }

  public undo = () => {
    if (this.undoStack.length) {
      const preState = this.undoStack.pop();
      if (preState) {
        const { nodes, edges } = useAppStore.getState();
        this.redoStack.push({ nodes, edges });
        useAppStore.setState({
          nodes: preState.nodes,
          edges: preState.edges,
        });
      } else {
        useAppStore.setState({
          nodes: [],
          edges: [],
        });
      }
    }
  };

  public redo = () => {
    const nextState = this.redoStack.pop();
    if (nextState) {
      const { nodes, edges } = useAppStore.getState();
      this.undoStack.push({ nodes, edges });
      useAppStore.setState({
        nodes: nextState.nodes,
        edges: nextState.edges,
      });
    }
  };

  public addUndoStack = (
    type: string,
    nodeChanges?: NodeChange<CanvasNode>[]
  ) => {
    const { nodes, edges } = useAppStore.getState();

    switch (type) {
      case "init":
        this.undoStack = [];
        break;
      case "onNodesChange":
        if (nodeChanges) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const change = nodeChanges[0] as any;
          const ignoreAddUndoStack = [
            "dimensions",
            "position",
            "select",
          ].includes(change.type);

          // It will be triggered multiple times when moving and scaling nodes. The node data is only cached on the first trigger and added to the undoStack on the last trigger.
          const isPositionOrResizeType =
            change.type === "position" ||
            (change.type === "dimensions" && Object.hasOwn(change, "resizing"));
          const isDraggingOrResizing = change.dragging || change.resizing;

          if (isPositionOrResizeType) {
            if (
              isDraggingOrResizing &&
              this.nodeMoveOrResizeStorage.length === 0
            ) {
              this.nodeMoveOrResizeStorage = [...nodes];
            } else if (
              !isDraggingOrResizing &&
              this.nodeMoveOrResizeStorage.length > 0
            ) {
              this.undoStack.push({
                nodes: this.nodeMoveOrResizeStorage,
                edges,
              });
              this.nodeMoveOrResizeStorage = [];
            }
          }

          if (ignoreAddUndoStack) {
            return;
          }
        }
        break;
    }

    this.undoStack.push({
      nodes,
      edges,
    });

    if (this.undoStack.length > 30) {
      this.undoStack.shift();
    }
  };
}

const undoRedoInstance = new UndoRedo();
export default undoRedoInstance;
