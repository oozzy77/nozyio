import { Button } from "@/components/ui/button";
import { ASTNodeData, ASTNodeInput } from "@/type/types";

export default function ServerFilePicker({ input }: { input: ASTNodeInput }) {
  const widget = input.widget;
  return (
    <div className="flex items-center justify-center px-1">
      <Button variant={"outline"}>Pick file</Button>
    </div>
  );
}
