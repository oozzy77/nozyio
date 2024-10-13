import ServerFileBrowserDialog from "@/components/ServerFileBrowserDialog";
import { Button } from "@/components/ui/button";
import { ASTNodeData, ASTNodeInput } from "@/type/types";
import { useState } from "react";

export default function ServerFilePicker({ input }: { input: ASTNodeInput }) {
  const widget = input.widget;
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-center px-1">
      <Button variant={"outline"} onClick={() => setOpen(true)}>
        Choose file
      </Button>
      {open && <ServerFileBrowserDialog onClose={() => setOpen(false)} />}
    </div>
  );
}
