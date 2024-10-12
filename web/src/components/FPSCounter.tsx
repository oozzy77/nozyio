import { useEffect, useState } from "react";

const FPSCounter = () => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;

    const updateFPS = () => {
      const now = performance.now();
      frameCount += 1;

      if (now >= lastTime + 1000) {
        // One second has passed
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(updateFPS);
    };

    updateFPS();

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "#00ff00",
        padding: "5px",
        borderRadius: "3px",
        fontFamily: "monospace",
        fontSize: "12px",
      }}
    >
      FPS: {fps}
    </div>
  );
};

export default FPSCounter;
