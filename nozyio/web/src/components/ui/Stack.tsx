import React, { forwardRef } from "react";

const Stack = forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        style={{ display: "flex", flexDirection: "column", ...props.style }}
        {...props}
      />
    );
  },
);
Stack.displayName = "Stack";
export { Stack };
