import { Handle, Node, Position, useUpdateNodeInternals } from "@xyflow/react";
import type { ASTNodeData, ASTNodeInput, CanvasState } from "@/type/types";
import { useShallow } from "zustand/react/shallow";
import useAppStore from "../store";
import { get_handle_uid } from "@/utils/canvasUtils";
import { Textarea } from "@/components/ui/textarea";
import { Flex } from "@/components/ui/Flex";
import ASTFunctionNodeInputBoxNumber from "./ASTFunctionNodeInputBoxNumber";
import { useEffect, useRef, useState } from "react";
import ServerFilePicker from "@/widgets/ServerFilePicker";
import { Checkbox } from "@/components/ui/checkbox";
import CustomHandle from "./CustomHandle";
import { Stack } from "@/components/ui/Stack";

export type ASTFunctionNode = Node<ASTNodeData, "function">;

export default function ASTFunctionNodeInput({
  input,
  nodeID,
  isConnected,
}: {
  input: ASTNodeInput;
  nodeID: string;
  isConnected: boolean;
}) {
  const isNumber = input.type === "int" || input.type === "float";
  const widget = input.widget || input.type === "filepath";

  return (
    <Stack
      className={`flex w-full ${isNumber ? "h-10" : ""}`}
      key={"input" + input.id}
    >
      <Flex className="gap-2 w-full">
        {!input.hide_handle && (
          <div className="relative flex items-center gap-1">
            <CustomHandle
              type="target"
              position={Position.Left}
              id={input.id}
            />
            <span className="text-sm font-semibold ml-2">{input.name}</span>
            {typeof input.type === "string" && (
              <span className="text-[10px] text-zinc-500 italic">
                {input.type}
              </span>
            )}
          </div>
        )}
        {widget ? (
          <InputWidget input={input} nodeID={nodeID} />
        ) : (
          !isConnected && (
            <ASTFunctionNodeInputBox input={input} nodeID={nodeID} />
          )
        )}
      </Flex>
    </Stack>
  );
}

function InputWidget({
  input,
  nodeID,
}: {
  input: ASTNodeInput & { accept?: string };
  nodeID: string;
}) {
  if (
    input.widget?.type === "server_file_picker" ||
    input.type === "filepath"
  ) {
    return (
      <ServerFilePicker
        input={input}
        extensions={input.widget?.options?.extensions ?? input.accept}
        nodeID={nodeID}
      />
    );
  }
}

function ASTFunctionNodeInputBox({
  input,
  nodeID,
}: {
  input: ASTNodeInput;
  nodeID: string;
}) {
  const { updateValues, values } = useAppStore(
    useShallow((state: CanvasState) => ({
      values: state.values,
      updateValues: state.updateValues,
    }))
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (input.type !== "str") return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Function to adjust the textarea height and update node internals
    const adjustTextareaHeight = () => {
      // Reset height to auto to calculate the new scrollHeight
      textarea.style.height = "auto";
      // Set the height to scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`;
      // Update node internals
      updateNodeInternals(nodeID);
    };

    // Adjust the height initially
    adjustTextareaHeight();

    // Adjust the height whenever the content changes
    textarea.addEventListener("input", adjustTextareaHeight);

    return () => {
      textarea.removeEventListener("input", adjustTextareaHeight);
    };
  }, [
    input.type,
    nodeID,
    updateNodeInternals,
    values[get_handle_uid("input", nodeID, input.id!)],
  ]);

  if (input.type === "int" || input.type === "float") {
    return <ASTFunctionNodeInputBoxNumber input={input} nodeID={nodeID} />;
  }
  if (input.type === "bool") {
    return (
      <Checkbox
        className="mx-4"
        checked={values[get_handle_uid("input", nodeID, input.id!)] ?? false}
        onCheckedChange={(checked) => {
          console.log("checked", checked);
          updateValues({
            [get_handle_uid("input", nodeID, input.id!)]: checked.valueOf(),
          });
        }}
      />
    );
  }

  if (Array.isArray(input.type)) {
    return (
      <select
        id="countries"
        value={values[get_handle_uid("input", nodeID, input.id!)] ?? ""}
        onChange={(e) => {
          updateValues({
            [get_handle_uid("input", nodeID, input.id!)]: e.target.value,
          });
        }}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        {input.type.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    );
  }

  if (input.type === "str") {
    return (
      <Textarea
        ref={textareaRef}
        value={values[get_handle_uid("input", nodeID, input.id!)] ?? ""}
        className="border-zinc-700 py-1 flex-1 flex-grow nodrag nopan resize-none" // Removed 'resize-y' class
        style={{ height: "auto", overflow: "hidden" }} // Added style for auto-resizing
        onChange={(e) => {
          updateValues({
            [get_handle_uid("input", nodeID, input.id!)]: e.target.value,
          });
        }}
      />
    );
  }
}
