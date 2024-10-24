import "./App.css";
import "@xyflow/react/dist/style.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import FPSCounter from "@/components/FPSCounter";
import { DnDProvider } from "./canvas/DnDContext";
import { lazy, useEffect } from "react";
import useAppStore from "./canvas/store";
import { CanvasState, NozyGraph } from "./type/types";
import { useShallow } from "zustand/shallow";
import { fetchApi } from "./common_app/app";
import { getCurWorkflow, setCurWorkflow } from "./utils/routeUtils";
import { GRAPH_CACHE_SESSION_KEY } from "./utils/canvasUtils";
const TopMenu = lazy(() => import("./menu/TopMenu"));
const FlowCanvas = lazy(() => import("./canvas/FlowCanvas"));

export default function App() {
  const { setName, loadGraph } = useAppStore(
    useShallow((state: CanvasState) => ({
      setName: state.setName,
      loadGraph: state.loadGraph,
    }))
  );
  useEffect(() => {
    window.addEventListener("setCurWorkflow", (e: Event) => {
      const customEvent = e as CustomEvent<{
        workflow: string;
        graph: NozyGraph;
      }>;
      const { workflow, graph } = customEvent.detail;
      if (typeof workflow !== "string") {
        return;
      }
      const name = workflow.slice(0, -5);
      setName(name);
      if (graph) {
        loadGraph(graph);
      } else {
        fetchApi(`/workflow/get?path=${encodeURIComponent(workflow)}`)
          .then((res) => res.json())
          .then((json: NozyGraph) => {
            if (!json.nodes) {
              console.error("Invalid graph");
              alert("❌Invalid nozy workflow");
              return;
            }
            loadGraph(json);
          });
      }
    });

    const initialWorkflow = getCurWorkflow();
    // restore graph from session cache if exists
    const graphStr = sessionStorage.getItem(GRAPH_CACHE_SESSION_KEY);
    if (initialWorkflow) {
      setCurWorkflow(initialWorkflow, graphStr ? JSON.parse(graphStr) : null);
    } else if (graphStr) {
      loadGraph(JSON.parse(graphStr));
    } else {
      fetchApi("/workflow/get_default")
        .then((res) => res.json())
        .then((json) => {
          if (json && typeof json === "string") {
            setCurWorkflow(json);
          }
        });
    }
  }, []);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DnDProvider>
        <div
          style={{
            width: "100vw",
            height: "100vh",
          }}
          className="absolute top-0 bottom-0 left-0 right-0"
        >
          <FlowCanvas />
          <TopMenu />
          <FPSCounter />
          <Toaster />
        </div>
      </DnDProvider>
    </ThemeProvider>
  );
}
