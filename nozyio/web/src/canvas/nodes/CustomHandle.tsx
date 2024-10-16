import { HANDLE_SIZE } from "@/utils/consts";
import { Handle, HandleProps } from "@xyflow/react";

export default function CustomHandle(props: HandleProps) {
  return (
    <Handle
      style={{ width: `${HANDLE_SIZE}px`, height: `${HANDLE_SIZE}px` }}
      {...props}
    />
  );
}
