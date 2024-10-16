import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { NodeProps, Node } from "@xyflow/react";
import { Flex } from "@/components/ui/Flex";
import { Stack } from "@/components/ui/Stack";
import { ASTNodeData, CanvasState } from "@/type/types";
import { useShallow } from "zustand/react/shallow";
import useAppStore from "../store";
import ASTFunctionNodeInput from "./ASTFunctionNodeInput";
import NodeContainer from "./NodeContainer";
import ASTFunctionNodeJobOutput from "./ASTFunctionNodeJobOutput";
import { useEffect } from "react";
import CustomHandle from "./CustomHandle";

export type ASTFunctionNode = Node<ASTNodeData, "function">;

export default function ASTFunctionNode({
  data,
  id,
}: NodeProps<ASTFunctionNode>) {
  const { selectedNodeIDs, edges, status } = useAppStore(
    useShallow((state: CanvasState) => ({
      selectedNodeIDs: state.selectedNodeIDs,
      edges: state.edges,
      status: state.job_status?.nodes?.[id],
    }))
  );
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    // Update node internals when the status changes to avoid edge drifting away from correct handle position
    updateNodeInternals(id);
  }, [status, edges, id, updateNodeInternals]);

  return (
    <NodeContainer>
      <div className="h-full flex flex-col min-w-[120px]">
        {/* node number floating header */}
        <div className="h-4 flex justify-end">
          {data.import_error && (
            <p className="text-[10px] font-bold px-2">
              <span className="text-red-500"> ❌ Import Failed: </span>
              <span>{data.import_error}</span>
            </p>
          )}
          <p className="text-[10px] text-muted-foreground italic px-2 w-fit text-right">
            #{id}
          </p>
        </div>
        {/* node card */}
        <Stack
          className={`flex-1 bg-zinc-800 rounded-md ${
            selectedNodeIDs.includes(id)
              ? "outline outline-[0.8px] outline-zinc-300"
              : status?.status === "RUNNING"
              ? "outline outline-2 outline-purple-500"
              : ""
          }`}
        >
          <Flex
            className={`relative py-1 ${
              data.import_error ? "bg-red-500" : "bg-gray-700"
            } rounded-t-md justify-between`}
          >
            <Handle type="target" position={Position.Left} id="top" />
            <Flex className="justify-between  flex-grow">
              <p className="px-2 font-semibold">
                {data.node_title ?? data.name}
              </p>
            </Flex>
            <Handle type="source" position={Position.Right} id="top" />
          </Flex>
          <Flex className="flex justify-between py-2 h-full">
            <div className="flex flex-col gap-2 h-full w-full pr-2">
              {data.input?.map((input) => {
                const isConnected = edges.some(
                  (edge) => edge.target === id && edge.targetHandle === input.id
                );

                return (
                  <ASTFunctionNodeInput
                    key={input.id}
                    input={input}
                    nodeID={id}
                    isConnected={isConnected}
                  />
                );
              })}
            </div>
            <Stack className="flex flex-col justify-center ml-2 gap-2">
              {data.output?.map((output) => {
                return (
                  <div
                    className="relative flex items-center ml-3"
                    key={"output" + output.id}
                  >
                    <p className="text-[10px] text-zinc-500 italic mr-[8px]">
                      {output.type}
                    </p>

                    <CustomHandle
                      type="source"
                      position={Position.Right}
                      id={output.id}
                    />
                  </div>
                );
              })}
            </Stack>
          </Flex>
          {/* node run outputs */}
          <ASTFunctionNodeJobOutput
            nodeID={id}
            output={data.output ?? null}
            status={status ?? null}
          />
        </Stack>
      </div>
    </NodeContainer>
  );
}
