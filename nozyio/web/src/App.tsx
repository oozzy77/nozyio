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
    const initialWorkflow = getCurWorkflow();
    setCurWorkflow(initialWorkflow);
    window.addEventListener("setCurWorkflow", (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (typeof customEvent.detail !== "string") {
        return;
      }
      const name = customEvent.detail.slice(0, -5);
      setName(name);
      fetchApi(`/workflow/get?path=${encodeURIComponent(customEvent.detail)}`)
        .then((res) => res.json())
        .then((json: NozyGraph) => {
          if (!json.nodes) {
            console.error("Invalid graph");
            alert("❌Invalid nozy workflow");
            return;
          }
          loadGraph(json);
        });
    });
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
