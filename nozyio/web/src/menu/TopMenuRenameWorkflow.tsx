import { Button } from "@/components/ui/button";
import type { CanvasState } from "@/type/types";
import { fetchApi } from "@/common_app/app";
import { IconPencil } from "@tabler/icons-react";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/shallow";
import { getCurWorkflow, setCurWorkflow } from "@/utils/routeUtils";

export default function TopMenuRenameWorkflow() {
  const { setName } = useAppStore(
    useShallow((state: CanvasState) => ({
      setName: state.setName,
    }))
  );

  return (
    <Button
      className="text-sm"
      size={"sm"}
      title="Rename workflow"
      variant={"ghost"}
      onClick={() => {
        const curWorkflow = getCurWorkflow();
        const userInput = prompt(
          "Enter a name for this workflow",
          curWorkflow?.slice(0, -5) ?? ""
        );
        if (!userInput) {
          return;
        }
        if (curWorkflow) {
          fetchApi("/workflow/rename", {
            method: "POST",
            body: JSON.stringify({
              path: curWorkflow,
              new_name: userInput.endsWith(".json")
                ? userInput
                : `${userInput}.json`,
            }),
          })
            .then((res) => res.json())
            .then((json) => {
              const newPath = json.path;
              if (typeof newPath !== "string") {
                throw new Error(json.error);
              }
              setCurWorkflow(newPath);
            })
            .catch((err) => {
              alert(`❌Failed to rename workflow: ${err.message}`);
            });
        } else {
          setName(userInput);
        }
      }}
    >
      <IconPencil size={18} />
    </Button>
  );
}
