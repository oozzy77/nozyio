import { apiBase } from "@/common_app/app";
import ServerFileBrowserDialog, {
  FileItem,
} from "@/components/ServerFileBrowserDialog";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/Flex";
import { Stack } from "@/components/ui/Stack";
import { ASTNodeData, ASTNodeInput } from "@/type/types";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

export default function ServerFilePicker({
  input,
  extensions,
}: {
  input: ASTNodeInput;
  extensions?: string[];
}) {
  const widget = input.widget;
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  return (
    <Stack className="px-1 w-[200px]">
      <Button
        variant={"outline"}
        onClick={() => setOpen(true)}
        className="mb-2"
      >
        Choose file
      </Button>
      {selectedFile && (
        <Stack>
          <Flex className="gap-2">
            <p className="text-sm break-all">{selectedFile.name}</p>
            <Button
              variant={"secondary"}
              className="p-[1px] w-5 h-5"
              onClick={() => setSelectedFile(null)}
            >
              <IconX size={15} />
            </Button>
          </Flex>
        </Stack>
      )}
      {open && (
        <ServerFileBrowserDialog
          extensions={extensions}
          onClose={() => setOpen(false)}
          onSelect={(file) => {
            setOpen(false);
            setSelectedFile(file);
          }}
        />
      )}
    </Stack>
  );
}
