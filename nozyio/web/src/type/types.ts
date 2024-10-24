import {
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from "@xyflow/react";
import { ASTNode } from "./astNodeTypes";

export type ParamType = "str" | "int" | "float" | "bool" | "any";
export type FunctionNodeData = {
  type: "function" | "class";
  name: string;
  module: string;
  input?: {
    name: string;
    type: ParamType;
  }[];
  output?: {
    name: string;
    type: ParamType;
  }[];
};
export type NodeWidget = {
  type: string;
  options?: Record<string, any>;
};
export type ASTNodeInput = {
  id?: string;
  name?: string;
  widget?: NodeWidget;
  hide_handle?: boolean;
  type?: ParamType;
  default?: any;
  optional?: boolean;
};

export type ASTNodeOutput = {
  id?: string;
  name?: string;
  type?: ParamType;
  hide_handle?: boolean;
};

export type ASTNodeData = {
  type: "function" | "class";
  name: string;
  node_title?: string;
  description?: string;
  module: string;
  import_error?: string;
  input?: ASTNodeInput[];
  output?: ASTNodeOutput[];
  astNodes?: ASTNode[];
};

export type CanvasNode = Node<ASTNodeData>;
export type NozyGraph = {
  workflow_id?: string | null;
  job_id?: string | null;
  name?: string | null;
  job_status?: JobStatus | null;
  nodes: CanvasNode[];
  edges: Edge[];
  values: {
    [key: string]: any;
  };
};

export enum EJobNodeStatus {
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

export type JobNodeStatus = Record<
  string,
  {
    status: EJobNodeStatus;
    results: any;
    error: string;
  }
>;

export type JobStatus = {
  status: string;
  nodes: JobNodeStatus;
};

export type ShowSearchEvent = {
  mouseX: number;
  mouseY: number;
  connectFrom?: {
    source?: string;
    sourceHandle?: string;
    target?: string;
    targetHandle?: string;
    handleType?: string;
  };
};

export type CanvasState = {
  workflow_id: string | null;
  name?: string | null;
  setName: (name: string) => void;
  job_id?: string | null;
  job_status?: JobStatus | null;
  nodes: CanvasNode[];
  edges: Edge[];
  values: {
    [key: string]: any;
  };
  isDirty: boolean;
  onSaveGraph: () => void;
  updateValues: (change: Record<string, any>) => void;
  showSearch: ShowSearchEvent | null;
  setShowSearch: (show: ShowSearchEvent | null) => void;
  onNodesChange: OnNodesChange<CanvasNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Omit<CanvasNode, "id"> & { id?: string }) => CanvasNode;
  selectedNodeIDs: string[];
  setSelectedNodeIDs: (node: string[]) => void;
  loadGraph: (graph: NozyGraph) => void;
  setJobStatus: (status: JobStatus) => void;
  setJobID: (job_id: string) => void;
  addEdge: (edge: Edge) => void;
  getNextNodeID: () => string;
  clearGraph: () => void;
};
