import { Button } from "@/components/ui/button";
import type { NozyGraph, CanvasState } from "@/type/types";
import { common_app, fetchApi } from "@/common_app/app";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/shallow";
import { getCurWorkflow, setCurWorkflow } from "@/utils/routeUtils";

export default function TopMenuRunButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { onSaveGraph } = useAppStore(
    useShallow((state: CanvasState) => ({
      onSaveGraph: state.onSaveGraph,
    }))
  );
  return (
    <Button
      variant={"ghost"}
      size="sm"
      title="Save workflow"
      isLoading={isLoading}
      onClick={() => {
        const graph: NozyGraph = {
          nodes: common_app.graph.nodes,
          edges: common_app.graph.edges,
          values: common_app.graph.values,
        };
        console.log("graph", graph);
        let curWf = getCurWorkflow();
        if (!curWf) {
          curWf = prompt("Enter workflow name");
        }
        if (!curWf) {
          return;
        }
        setIsLoading(true);
        fetchApi("/workflow/save", {
          method: "POST",
          body: JSON.stringify({
            graph,
            path: curWf.endsWith(".json") ? curWf : `${curWf}.json`,
            new: getCurWorkflow() == null,
          }),
        })
          .then((resp) => resp.json())
          .then((json) => {
            console.log("json", json);
            if (typeof json.path !== "string") {
              throw new Error(json.error);
            }
            setCurWorkflow(json.path);
            onSaveGraph();
            toast({
              title: "✅ Workflow saved to",
              description: json.root_rel,
            });
          })
          .catch((e) => {
            toast({
              title: "Error saving workflow",
              variant: "destructive",
              description: e.message,
            });
            console.error(e);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }}
    >
      <IconDeviceFloppy size={18} />
    </Button>
  );
}
