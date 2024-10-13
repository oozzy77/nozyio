import React, { useRef, useState, useEffect } from "react";
import { NodeResizeControl } from "@xyflow/react";
import { IconArrowsDiagonal2 } from "@tabler/icons-react";

export default function NodeContainer({
  children,
}: {
  children: React.ReactElement;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const [minHeight, setMinHeight] = useState(100);

  useEffect(() => {
    if (nodeRef.current?.offsetHeight) {
      setMinHeight(nodeRef.current.offsetHeight);
    }
  }, []);

  return (
    <div className="group h-full">
      <NodeResizeControl
        className="!w-3 !h-3 !translate-x-[-30%] !translate-y-[-30%] !bg-transparent !border-none group"
        minWidth={150}
        minHeight={minHeight}
      >
        <IconArrowsDiagonal2
          size={10}
          className="hidden group-hover:block absolute bottom-0 right-0"
        />
      </NodeResizeControl>
      <div className="h-full" ref={nodeRef}>
        {children}
      </div>
    </div>
  );
}
