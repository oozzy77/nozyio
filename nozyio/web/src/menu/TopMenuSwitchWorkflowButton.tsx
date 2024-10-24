import { Button } from "@/components/ui/button";
import CustomDrawer from "@/components/ui/CustomDrawer";
import { useState } from "react";
import { IconFolder, IconTriangleInvertedFilled } from "@tabler/icons-react";
import { Stack } from "@/components/ui/Stack";
import WorkflowFilesList from "./WorkflowFilesList";
import { setCurWorkflow } from "@/utils/routeUtils";
import { Flex } from "@/components/ui/Flex";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/shallow";
import { CanvasState } from "@/type/types";

export default function TopMenuSwitchWorkflowButton() {
  const [open, setOpen] = useState(false);
  const { name, isDirty } = useAppStore(
    useShallow((state: CanvasState) => ({
      name: state.name,
      isDirty: state.isDirty,
    }))
  );
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        // variant="secondary"
        size={"sm"}
        className="px-[8px] bg-zinc-800 hover:bg-zinc-500"
      >
        <Flex className="gap-[4px]">
          {/* <IconFolder size={18} /> */}
          {isDirty && <span> * </span>}
          <span className="mr-1">{name ?? "Untitled"}</span>
          <IconTriangleInvertedFilled size={7} />
        </Flex>
      </Button>
      {open && (
        <CustomDrawer onClose={() => setOpen(false)} backdrop={null}>
          <Stack className="w-[400px] py-2 px-2 overflow-y-auto h-[100vh]">
            <h2 className="text-xl font-bold p-2">Workflows</h2>
            <WorkflowFilesList
              path=""
              onClickWorkflow={(path) => {
                setCurWorkflow(path);
                setOpen(false);
              }}
            />
          </Stack>
        </CustomDrawer>
      )}
    </>
  );
}
