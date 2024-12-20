import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Edge,
} from "@xyflow/react";

import {
  CanvasNode,
  CanvasState,
  JobStatus,
  NozyGraph,
  ShowSearchEvent,
} from "../type/types";
import { get_handle_uid, GRAPH_CACHE_SESSION_KEY } from "@/utils/canvasUtils";
import { common_app, fetchApi } from "@/common_app/app";
import undoRedoInstance from "@/utils/undoRedo";
import { nanoid } from "nanoid";
import { getCurWorkflow, setCurWorkflow } from "@/utils/routeUtils";

const useAppStore = create<CanvasState>((set, get) => {
  const onGraphChange = () => {
    // any changes happen to the graph (nodes, edges, values, job_status) will trigger this
    const { workflow_id, nodes, edges, values, job_status } = get();
    common_app.graph.workflow_id = workflow_id;
    common_app.graph.nodes = nodes;
    common_app.graph.edges = edges;
    common_app.graph.values = values;
    common_app.graph.job_status = job_status ?? null;
    sessionStorage.setItem(
      GRAPH_CACHE_SESSION_KEY,
      JSON.stringify({
        workflow_id,
        nodes,
        edges,
        values,
        curWorkflow: getCurWorkflow(),
      })
    );
  };
  const getNextNodeID = () => {
    const { nodes } = get();
    let start = 1;
    while (start < nodes.length + 1) {
      if (nodes.every((node) => node.id !== start.toString())) {
        return start.toString();
      }
      start++;
    }
    return start.toString();
  };
  return {
    /// states ///
    workflow_id: nanoid(),
    name: "Untitled", // workflow name
    nodes: [],
    edges: [],
    values: {},
    job_status: undefined,
    isDirty: getCurWorkflow() == null,
    /// methods ///
    getNextNodeID,
    onSaveGraph: () => {
      set({ isDirty: false });
    },
    selectedNodeIDs: [],
    setSelectedNodeIDs: (node: string[]) => {
      set({ selectedNodeIDs: node });
    },
    showSearch: null,
    setShowSearch: (show: ShowSearchEvent | null) => {
      set({ showSearch: show });
    },
    updateValues: (change: Record<string, any>) => {
      let newValues = { ...get().values };
      for (const [key, value] of Object.entries(change)) {
        if (value === undefined) {
          delete newValues[key];
        } else {
          newValues[key] = value;
        }
      }
      set({ values: newValues });
      // save graph to session cache
      onGraphChange();
      set({ isDirty: true });
    },
    onNodesChange: (changes) => {
      undoRedoInstance.addUndoStack("onNodesChange", changes);
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
      // remove values for removed nodes
      const removedNodeIds = changes
        .filter((change) => change.type === "remove")
        .map((change) => change.id);

      const newValues = { ...get().values };
      removedNodeIds.forEach((nodeId) => {
        Object.keys(newValues).forEach((key) => {
          if (key.includes(`node_${nodeId}`)) {
            delete newValues[key];
          }
        });
      });
      set({ values: newValues });

      onGraphChange();

      const nodesChanged = changes.some((change) => change.type !== "select");
      if (nodesChanged) {
        set({ isDirty: true });
      }
    },
    onEdgesChange: (changes) => {
      undoRedoInstance.addUndoStack("onEdgesChange", changes);
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
      onGraphChange();
      set({ isDirty: true });
    },
    addEdge: (edge: Edge) => {
      set({ edges: get().edges.concat(edge) });
      set({ isDirty: true });
    },
    onConnect: (connection) => {
      undoRedoInstance.addUndoStack("onConnect");
      set({
        edges: addEdge(connection, get().edges),
      });
      onGraphChange();
      set({ isDirty: true });
    },
    setNodes: (nodes) => {
      set({ nodes });
    },
    setEdges: (edges) => {
      set({ edges });
    },
    addNode: (node: Omit<CanvasNode, "id"> & { id?: string }) => {
      if (!node.id) {
        node.id = getNextNodeID();
      }

      undoRedoInstance.addUndoStack("addNode");
      set({ nodes: get().nodes.concat(node as CanvasNode) });
      // add values for new node
      const newValues = { ...get().values };
      node.data.input?.forEach((input) => {
        newValues[get_handle_uid("input", node.id!, input.id!)] =
          input.default ?? null;
      });
      set({ values: newValues });
      set({ isDirty: true });
      return node as CanvasNode;
    },
    loadGraph: (graph: NozyGraph) => {
      set({
        workflow_id: graph.workflow_id,
        nodes: graph.nodes,
        edges: graph.edges,
        values: graph.values,
        job_status: graph.job_status ?? null,
        isDirty: false,
      });
      onGraphChange();
      undoRedoInstance.addUndoStack("init");

      // refresh node def
      fetchApi("/refresh_node_def", {
        method: "POST",
        body: JSON.stringify(graph),
      })
        .then((res) => res.json())
        .then((graph) => {
          set({ nodes: graph.nodes });
        });
    },
    clearGraph: () => {
      set({
        workflow_id: nanoid(),
        nodes: [],
        edges: [],
        name: "Untitled",
        values: {},
        job_status: undefined,
        isDirty: false,
      });
      setCurWorkflow(null);
    },
    setJobStatus: (status: JobStatus) => {
      set({ job_status: status });
      onGraphChange();
    },
    setJobID: (job_id: string) => {
      set({ job_id });
    },
    setName: (name: string) => {
      set({ name });
      onGraphChange();
    },
  };
});

export default useAppStore;
