import { ASTNodeInput, CanvasState } from "@/type/types";
import { Input } from "@/components/ui/input";
import { useShallow } from "zustand/react/shallow";
import useAppStore from "../store";
import { get_handle_uid } from "@/utils/canvasUtils";

export default function ASTFunctionNodeInputBoxNumber({
  input,
  nodeID,
}: {
  input: ASTNodeInput;
  nodeID: string;
}) {
  const { updateValues, values } = useAppStore(
    useShallow((state: CanvasState) => ({
      values: state.values,
      updateValues: state.updateValues,
    }))
  );
  return (
    <Input
      type="number"
      value={values[get_handle_uid("input", nodeID, input.id!)] ?? ""}
      onChange={(e) => {
        updateValues({
          [get_handle_uid("input", nodeID, input.id!)]:
            e.target.value === "" ? undefined : Number(e.target.value),
        });
      }}
      className="w-full border-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}
