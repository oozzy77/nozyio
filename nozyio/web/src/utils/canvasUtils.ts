// same as get_handle_uid in ast_execution.py
export function get_handle_uid(
  ioType: "input" | "output",
  nodeID: string,
  handleID: string
) {
  return "node_" + nodeID + "_" + ioType + "_" + handleID;
}

export const GRAPH_CACHE_SESSION_KEY = "nozy_graph";
