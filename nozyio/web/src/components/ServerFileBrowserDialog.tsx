import { fetchApi } from "@/common_app/app";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Stack } from "./ui/Stack";
import { IconFolder } from "@tabler/icons-react";
import { Flex } from "./ui/Flex";
import { Button } from "./ui/button";
type FileItem = { type: string; name: string; path: string };
export function ServerFileBrowser({
  extensions,
  defaultPath = "",
}: {
  extensions?: string[];
  defaultPath?: string;
}) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [sep, setSep] = useState<string>(".");
  const [path, setPath] = useState<string>(defaultPath);

  useEffect(() => {
    fetchApi("/get_os_sep", {
      method: "GET",
    })
      .then((resp) => resp.text())
      .then((text) => {
        setSep(text);
      });
    fetchFiles(path, ["txt"]);
  }, []);

  const fetchFiles = (path: string, extensions: string[] | null) => {
    fetchApi("/file_picker/list_files", {
      method: "POST",
      body: JSON.stringify({
        path,
        extensions,
      }),
    })
      .then((resp) => resp.json())
      .then((json: { path: string; items: FileItem[] }) => {
        console.log("json: ", json);
        setPath(json.path);
        setFiles(json.items);
      });
  };

  const handlePathClick = (index: number) => {
    const newPath = path
      .split(sep)
      .slice(0, index + 1)
      .join(sep);
    fetchFiles(newPath, extensions ?? null);
  };

  return (
    <Stack>
      <Flex>
        {path.split(sep).map((component, index) => (
          <Flex key={index} className="mb-2">
            <Button
              variant={"link"}
              className="px-0 text-lg"
              onClick={() => handlePathClick(index)}
            >
              {component}
            </Button>
            <span className="px-1">
              {index < path.split(sep).length - 1 && sep}
            </span>
          </Flex>
        ))}
      </Flex>
      <Stack className="overflow-y-auto h-[70vh]">
        {files.map((file) => {
          if (file.type === "file") {
            return <p key={file.name}>{file.name}</p>;
          }
          return (
            <Flex
              key={file.name}
              className="cursor-pointer gap-1"
              onClick={() => fetchFiles(file.path, extensions ?? null)}
            >
              <IconFolder size={16} />
              <span>{file.name}</span>
            </Flex>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default function ServerFileBrowserDialog({
  onClose,
  extensions,
  defaultPath = "",
}: {
  onClose: () => void;
  extensions?: string[];
  defaultPath?: string;
}) {
  return (
    <Dialog onOpenChange={onClose} open={true}>
      <DialogContent className="sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Choose File</DialogTitle>
          <ServerFileBrowser
            extensions={extensions}
            defaultPath={defaultPath}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
