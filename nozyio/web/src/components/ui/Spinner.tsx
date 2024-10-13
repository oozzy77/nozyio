import { cn } from "@/utils";
import { IconLoader2 } from "@tabler/icons-react";
import React, { forwardRef } from "react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number | "sm" | "md" | "lg";
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>((props, _ref) => {
  let { size = 18, ...rest } = props;
  if (typeof size === "string") {
    size = size === "sm" ? 12 : size === "md" ? 24 : 18;
  }
  return (
    <div {...rest}>
      <IconLoader2 className={cn("w-4 h-4 animate-spin", props.className)} />
      <span className="sr-only">Loading...</span>
    </div>
  );
});
Spinner.displayName = "Spinner";
export default Spinner;
