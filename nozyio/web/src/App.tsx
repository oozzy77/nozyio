import "./App.css";
import "@xyflow/react/dist/style.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
// import FlowCanvas from "./canvas/FlowCanvas";
// import TopMenu from "./menu/TopMenu";
import { Toaster } from "@/components/ui/toaster";
import FPSCounter from "@/components/FPSCounter";
import { DnDProvider } from "./canvas/DnDContext";
import { lazy } from "react";
const TopMenu = lazy(() => import("./menu/TopMenu"));
const FlowCanvas = lazy(() => import("./canvas/FlowCanvas"));

export default function App() {
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
