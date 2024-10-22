import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  type NodeTypes,
  Controls,
  ControlButton,
  Background,
  useReactFlow,
  ReactFlowProvider,
  OnConnectEnd,
} from "@xyflow/react";
import { useTheme } from "@/components/ui/theme-provider";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowsSplit2,
} from "@tabler/icons-react";
import { useDnD } from "./DnDContext";
import { ASTNodeData, CanvasNode, CanvasState } from "@/type/types";
import ASTFunctionNode from "./nodes/ASTFunctionNode";
import useAppStore from "./store";
import { useShallow } from "zustand/react/shallow";
import { GRAPH_CACHE_SESSION_KEY } from "@/utils/canvasUtils";
import undoRedoInstance from "@/utils/undoRedo";
import { common_app, fetchApi } from "@/common_app/app";
import { getLayoutElements } from "@/utils/flowLayoutUtils";
import NodesTypeaheadSearch from "@/components/NodesTypeaheadSearch";
import { useCopyAndPaste } from "@/hooks/useCopyAndPaste";

const selector = (state: CanvasState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  setJobStatus: state.setJobStatus,
  onConnect: state.onConnect,
  addNode: state.addNode,
  loadGraph: state.loadGraph,
  setSelectedNodeIDs: state.setSelectedNodeIDs,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  setShowSearch: state.setShowSearch,
});

const nodeTypes: NodeTypes = {
  astFunction: ASTFunctionNode,
};

export function FlowCanvas() {
  const { theme } = useTheme();
  const { screenToFlowPosition } = useReactFlow();
  const { dropingNode, setDropingNode } = useDnD();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    loadGraph,
    setSelectedNodeIDs,
    setJobStatus,
    setNodes,
    setEdges,
    setShowSearch,
  } = useAppStore(useShallow(selector));
  useCopyAndPaste();

  useEffect(() => {
    // restore graph from session cache
    const graphStr = sessionStorage.getItem(GRAPH_CACHE_SESSION_KEY);
    if (graphStr) {
      loadGraph(JSON.parse(graphStr));
      // refresh node def
      fetchApi("/refresh_node_def", {
        method: "POST",
        body: graphStr,
      })
        .then((res) => res.json())
        .then((graph) => {
          loadGraph(graph);
        });
    }

    console.log("connecting to websocket", common_app.wsUrl);
    const ws = new WebSocket(common_app.wsUrl);
    ws.onopen = () => {
      console.log("websocket connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      window.dispatchEvent(new CustomEvent("message", { detail: message }));
      console.log("message", message);
      if (message.type === "job_status" && message.data) {
        setJobStatus(message.data);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  const lastClickTime = useRef(0);
  const lastOnConnectEnd = useRef(0);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // check if dropping node in progress
      if (!dropingNode) {
        return;
      }
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        data: dropingNode,
        position: position,
        type: "astFunction",
      };

      addNode(newNode);
      setDropingNode(null);
    },
    [screenToFlowPosition, dropingNode]
  );
  const onPaneClick = useCallback((event: MouseEvent) => {
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setSelectedNodeIDs([]);
    const now = Date.now();
    if (lastClickTime.current && now - lastClickTime.current < 300) {
      setShowSearch({
        mouseX: position.x,
        mouseY: position.y,
      });
    } else if (now - lastOnConnectEnd.current > 300) {
      setShowSearch(null);
    }
    lastClickTime.current = now;
  }, []);
  const onConnectEnd: OnConnectEnd = useCallback((_event, params) => {
    lastOnConnectEnd.current = Date.now();
    if (params.isValid) {
      return;
    }
    if (!params.to?.x || !params.to?.x) {
      throw new Error("onConnectEnd No position found!");
    }
    const position = screenToFlowPosition({
      x: params.to?.x,
      y: params.to?.y,
    });
    const fromNode = params.fromNode?.data as ASTNodeData;
    const toNode = params.toNode?.data as ASTNodeData;
    const fromHandleType = fromNode?.output?.find(
      (output) => output.id === params.fromHandle?.id
    )?.type;
    const toHandleType = toNode?.input?.find(
      (input) => input.id === params.toHandle?.id
    )?.type;
    console.log("onconnectend", params);
    setShowSearch({
      mouseX: position.x,
      mouseY: position.y,
      connectFrom: {
        source: params.fromNode?.id,
        sourceHandle: params.fromHandle?.id ?? undefined,
        target: params.toNode?.id,
        targetHandle: params.toHandle?.id ?? undefined,
        handleType: fromHandleType ?? toHandleType,
      },
    });
  }, []);

  const onLayout = (direction: string) => {
    const { nodes: layoutNodes, edges: layoutEdges } = getLayoutElements(
      nodes,
      edges,
      direction
    );

    setNodes([...layoutNodes]);
    setEdges([...layoutEdges]);
  };

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      colorMode={theme}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onConnect={onConnect}
      fitView
      fitViewOptions={{
        padding: 0.2,
      }}
      defaultEdgeOptions={{
        style: {
          strokeWidth: 2,
          stroke: "#9049CF",
        },
      }}
      onNodeClick={(_event, node) => {
        console.log("node click #" + node.id);
        setSelectedNodeIDs([node.id]);
      }}
      onPaneClick={onPaneClick}
      onConnectEnd={onConnectEnd}
      zoomOnDoubleClick={false}
    >
      <Background />
      <Controls orientation="horizontal">
        <ControlButton onClick={undoRedoInstance.undo}>
          <IconArrowBackUp
            size={16}
            className="!fill-[none] !max-w-4 !max-h-4"
          />
        </ControlButton>
        <ControlButton onClick={undoRedoInstance.redo}>
          <IconArrowForwardUp
            size={16}
            className="!fill-[none] !max-w-4 !max-h-4"
          />
        </ControlButton>
        <ControlButton onClick={() => onLayout("LR")}>
          <IconArrowsSplit2
            size={16}
            className="!fill-[none] !max-w-4 !max-h-4"
          />
        </ControlButton>
        <ControlButton onClick={() => onLayout("TB")}>
          <IconArrowsSplit2
            size={16}
            className="!fill-[none] !max-w-4 !max-h-4 rotate-90"
          />
        </ControlButton>
      </Controls>
    </ReactFlow>
  );
}

export default function FlowCanvasWithProvider() {
  const { showSearch } = useAppStore(
    useShallow((state) => ({ showSearch: state.showSearch }))
  );

  return (
    <ReactFlowProvider>
      <FlowCanvas />
      {showSearch && <NodesTypeaheadSearch showSearch={showSearch} />}
    </ReactFlowProvider>
  );
}
