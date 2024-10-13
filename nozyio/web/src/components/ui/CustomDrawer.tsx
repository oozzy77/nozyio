import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function CustomDrawer({
  onClose,
  children,
  className = "",
  backdrop = "rgba(0, 0, 0, 0.5)",
  position = "left",
}: {
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  backdrop?: string | null;
  position?: "right" | "left";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // monitor outside clicks
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, []);
  return createPortal(
    <>
      {backdrop && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: backdrop,
          }}
        ></div>
      )}
      <div
        style={{
          height: "100vh",
          position: "fixed",
          top: 0,
          left: position === "right" ? "auto" : 0,
          right: position === "right" ? 0 : "auto",
        }}
        ref={ref}
        className={`bg-zinc-800 ${className}`}
      >
        {children}
      </div>
    </>,
    document.body // Portal to body
  );
}
