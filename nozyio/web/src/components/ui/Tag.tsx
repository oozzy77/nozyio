import { cn } from "@/utils";
import React, { forwardRef } from "react";

const Tag = forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-xs rounded-lg bg-zinc-800 px-2 py-1 font-semibold",
          props.className
        )}
        {...props}
      />
    );
  }
);
Tag.displayName = "Tag";
export { Tag };
