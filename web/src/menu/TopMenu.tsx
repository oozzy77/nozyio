import { Button } from "@/components/ui/button";
import type { CanvasState, NozyGraph } from "@/type/types";
import { common_app, fetchApi } from "@/common_app/app";
import {
  IconDownload,
  IconFolderOpen,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { Flex } from "@/components/ui/Flex";
import { lazy, useRef } from "react";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/shallow";
import { customAlphabet } from "nanoid";
const TopMenuNodes = lazy(() => import("./TopMenuNodes"));
const TopMenuCodePreviewButton = lazy(
  () => import("./TopMenuCodePreviewButton")
);

export default function TopMenu() {
  const { name, setName, loadGraph } = useAppStore(
    useShallow((state: CanvasState) => ({
      name: state.name,
      setName: state.setName,
      loadGraph: state.loadGraph,
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
  const nanoidCustom = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    12
  );

  return (
    <div className="flex items-center justify-between absolute top-0 left-0 right-0">
      <div className="flex items-center gap-2">
        <TopMenuNodes />
        <div
          className="text-sm"
          onClick={() => {
            const userInput = prompt("Enter a name for this workflow");
            if (userInput) {
              setName(userInput);
            }
          }}
        >
          {name ?? "Untitled"}
        </div>
        <Flex className="gap-0">
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
        <Button
          left={<IconPlayerPlayFilled size={15} />}
          onClick={() => {
            const graph: NozyGraph = {
              job_id: nanoidCustom(),
              nodes: common_app.graph.nodes,
              edges: common_app.graph.edges,
              values: common_app.graph.values,
            };
            console.log("graph", graph);
            fetchApi("/queue_job", {
              method: "POST",
              body: JSON.stringify(graph),
            });
          }}
        >
          Run
        </Button>
      </div>
    </div>
  );
}
