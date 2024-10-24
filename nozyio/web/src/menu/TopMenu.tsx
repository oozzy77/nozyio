import { Button } from "@/components/ui/button";
import type { CanvasState } from "@/type/types";
import { common_app } from "@/common_app/app";
import { IconDownload, IconFolderOpen, IconPlus } from "@tabler/icons-react";
import { Flex } from "@/components/ui/Flex";
import { lazy, useRef } from "react";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/shallow";
import TopMenuRunButton from "./TopMenuRunButton";
import TopMenuSaveButton from "./TopMenuSaveButton";
import TopMenuSwitchWorkflowButton from "./TopMenuSwitchWorkflowButton";
import TopMenuRenameWorkflow from "./TopMenuRenameWorkflow";
const TopMenuNodes = lazy(() => import("./TopMenuNodes"));
const TopMenuCodePreviewButton = lazy(
  () => import("./TopMenuCodePreviewButton")
);

export default function TopMenu() {
  const { name, loadGraph, clearGraph } = useAppStore(
    useShallow((state: CanvasState) => ({
      name: state.name,
      loadGraph: state.loadGraph,
      clearGraph: state.clearGraph,
    }))
  );

  const downloadWorkflow = () => {
    document.getElementById("workflow-download")?.click();
    const json = JSON.stringify(common_app.graph, null, 2);
    console.log("common_app.graph", common_app.graph);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name ?? "nozy_workflow"}.json`;
    a.click();
  };

  const workflowUploadRef = useRef<HTMLInputElement>(null);
  const openWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();
    if (!file) return;
    reader.readAsText(file, "UTF-8");
    reader.onload = (e) => {
      const json = JSON.parse(e.target?.result as string);
      json.name = file.name.replace(/\.json$/, ""); // Remove only the last .json
      loadGraph(json);
    };
  };

  return (
    <div className="flex items-center justify-between absolute top-0 left-0 right-0">
      <div className="flex items-center gap-2">
        <TopMenuNodes />
        <Button
          size="sm"
          className="px-1"
          variant="ghost"
          title="New workflow"
          onClick={() => {
            clearGraph();
          }}
        >
          <IconPlus size={18} />
        </Button>
        <TopMenuSwitchWorkflowButton />
        {/* <div
          className="text-sm"
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
          {isDirty && <span> * </span>}
          {name ?? "Untitled"}
        </div> */}
        <Flex className="gap-0">
          <TopMenuSaveButton />
          <TopMenuRenameWorkflow />
          <Button
            size="sm"
            variant="ghost"
            title="Download workflow"
            onClick={downloadWorkflow}
          >
            <IconDownload size={18} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Open workflow"
            onClick={() => {
              workflowUploadRef.current?.click();
            }}
          >
            <IconFolderOpen size={18} />
          </Button>
          <input
            type="file"
            accept=".json"
            id="workflow-upload"
            ref={workflowUploadRef}
            style={{ display: "none" }}
            onChange={openWorkflow}
          />
        </Flex>
      </div>
      <div className="flex items-center gap-2">
        <TopMenuCodePreviewButton />
        <TopMenuRunButton />
      </div>
    </div>
  );
}
