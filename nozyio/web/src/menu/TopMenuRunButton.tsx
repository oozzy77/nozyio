import { Button } from "@/components/ui/button";
import type { NozyGraph } from "@/type/types";
import { common_app, fetchApi } from "@/common_app/app";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { useState } from "react";
import { customAlphabet } from "nanoid";

export default function TopMenuRunButton() {
  const [isLoading, setIsLoading] = useState(false);
  const nanoidCustom = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    12
  );

  return (
    <Button
      left={<IconPlayerPlayFilled size={15} />}
      isLoading={isLoading}
      onClick={() => {
        const graph: NozyGraph = {
          job_id: nanoidCustom(),
          nodes: common_app.graph.nodes,
          edges: common_app.graph.edges,
          values: common_app.graph.values,
        };
        console.log("graph", graph);
        setIsLoading(true);
        fetchApi("/run_job", {
          method: "POST",
          body: JSON.stringify(graph),
        }).finally(() => {
          setIsLoading(false);
        });
      }}
    >
      Run
    </Button>
  );
}
