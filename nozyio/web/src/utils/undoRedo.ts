import { CanvasNode, CanvasState } from "@/type/types";
import useAppStore from "@/canvas/store";

type StackType = Pick<CanvasState, "nodes" | "edges" | "values">;

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
        const { nodes, edges, values } = useAppStore.getState();
        this.redoStack.push({ nodes, edges, values });
        useAppStore.setState({
          nodes: preState.nodes,
          edges: preState.edges,
          values: preState.values,
        });
      } else {
        useAppStore.setState({
          nodes: [],
          edges: [],
          values: [],
        });
      }
    }
  };

  public redo = () => {
    const nextState = this.redoStack.pop();
    if (nextState) {
      const { nodes, edges, values } = useAppStore.getState();
      this.undoStack.push({ nodes, edges, values });
      useAppStore.setState({
        nodes: nextState.nodes,
        edges: nextState.edges,
        values: nextState.values,
      });
    }
  };

  public addUndoStack = (
    type: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changes?: any
  ) => {
    const { nodes, edges, values } = useAppStore.getState();
    const change = changes?.[0];
    switch (type) {
      case "init":
        this.undoStack = [];
        break;
      case "onNodesChange":
        if (changes) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                values,
              });
              this.nodeMoveOrResizeStorage = [];
            }
          }

          if (ignoreAddUndoStack) {
            return;
          }
        }
        break;
      case "onEdgesChange":
        if (change.type === "select") {
          return;
        }
        break;
    }

    this.undoStack.push({
      nodes,
      edges,
      values,
    });

    if (this.undoStack.length > 30) {
      this.undoStack.shift();
    }
  };
}

const undoRedoInstance = new UndoRedo();
export default undoRedoInstance;
