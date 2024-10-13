import useAppStore from "@/canvas/store";
import { apiBase, common_app } from "@/common_app/app";
import ServerFileBrowserDialog, {
  FileItem,
} from "@/components/ServerFileBrowserDialog";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/Flex";
import { Stack } from "@/components/ui/Stack";
import { CanvasState, ASTNodeInput } from "@/type/types";
import { get_handle_uid } from "@/utils/canvasUtils";
import { IconX } from "@tabler/icons-react";
import { useUpdateNodeInternals } from "@xyflow/react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

export default function ServerFilePicker({
  input,
  extensions,
  nodeID,
}: {
  input: ASTNodeInput;
  extensions?: string[];
  nodeID: string;
}) {
  const { updateValues, values } = useAppStore(
    useShallow((state: CanvasState) => ({
      values: state.values,
      updateValues: state.updateValues,
    }))
  );
  const updateNodeInternals = useUpdateNodeInternals();
  const [open, setOpen] = useState(false);
  const selectedFilePath = values[get_handle_uid("input", nodeID, input.id!)];
  console.log("selectedFilePath", selectedFilePath);
  const selectedFileName = selectedFilePath?.split(common_app.osSep).pop();
  return (
    <Stack className="px-1 w-[200px]">
      <Button
        variant={"outline"}
        onClick={() => setOpen(true)}
        className="mb-2"
      >
        Choose file
      </Button>
      {selectedFilePath && (
        <Stack>
          <Flex className="gap-2">
            <p className="text-sm break-all">{selectedFileName}</p>
            <Button
              variant={"secondary"}
              className="p-[1px] w-5 h-5"
              onClick={() => {
                updateValues({
                  [get_handle_uid("input", nodeID, input.id!)]: undefined,
                });
              }}
            >
              <IconX size={15} />
            </Button>
          </Flex>
        </Stack>
      )}
      {open && (
        <ServerFileBrowserDialog
          extensions={extensions}
          onClose={() => setOpen(false)}
          onSelect={(file) => {
            setOpen(false);
            updateValues({
              [get_handle_uid("input", nodeID, input.id!)]: file.path,
            });
          }}
        />
      )}
    </Stack>
  );
}
