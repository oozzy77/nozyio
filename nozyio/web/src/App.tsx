import "./App.css";
import "@xyflow/react/dist/style.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import FPSCounter from "@/components/FPSCounter";
import { DnDProvider } from "./canvas/DnDContext";
import { lazy, useEffect } from "react";
import useAppStore from "./canvas/store";
import { CanvasState } from "./type/types";
import { useShallow } from "zustand/shallow";
const TopMenu = lazy(() => import("./menu/TopMenu"));
const FlowCanvas = lazy(() => import("./canvas/FlowCanvas"));

export default function App() {
  const { setName } = useAppStore(
    useShallow((state: CanvasState) => ({
      setName: state.setName,
    }))
  );
  useEffect(() => {
    window.addEventListener("setCurWorkflow", (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const name = customEvent.detail.endsWith(".json")
        ? customEvent.detail.slice(0, -5)
        : customEvent.detail;
      setName(name);
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
