import { apiBase, fetchApi } from "@/common_app/app";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Stack } from "./ui/Stack";
import { IconFolder } from "@tabler/icons-react";
import { Flex } from "./ui/Flex";
import { Button } from "./ui/button";

export type FileItem = { type: string; name: string; path: string };
export function ServerFileBrowser({
  extensions,
  defaultPath = "",
  onSelect,
}: {
  extensions?: string[];
  defaultPath?: string;
  onSelect: (file: FileItem) => void;
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
    fetchFiles(path);
  }, []);

  const fetchFiles = (path: string) => {
    fetchApi("/file_picker/list_files", {
      method: "POST",
      body: JSON.stringify({
        path,
        extensions,
      }),
    })
      .then((resp) => resp.json())
      .then((json: { path: string; items: FileItem[] }) => {
        setPath(json.path);
        setFiles(json.items);
      });
  };

  const handlePathClick = (index: number) => {
    const newPath = path
      .split(sep)
      .slice(0, index + 1)
      .join(sep);
    fetchFiles(newPath);
  };

  return (
    <Stack>
      <Flex className="gap-4 mb-3">
        <p className="text-xl font-semibold">Choose File</p>
        <p className="text-sm text-muted-foreground">
          {extensions?.join(", ")}
        </p>
      </Flex>
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
            return (
              <FileItemRow
                key={file.name}
                file={file}
                onClick={() => onSelect(file)}
              />
            );
          }
          return (
            <Flex
              key={file.name}
              className="cursor-pointer gap-1 hover:bg-secondary py-[1px]"
              onClick={() => fetchFiles(file.path)}
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

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"];

function FileItemRow({
  file,
  onClick,
}: {
  file: FileItem;
  onClick: () => void;
}) {
  const isImage = IMAGE_EXTENSIONS.includes(file.name.split(".").pop() || "");

  return (
    <Flex className="gap-1 cursor-pointer hover:bg-secondary" onClick={onClick}>
      {isImage && (
        <img
          src={apiBase + `/preview_image?path=${encodeURIComponent(file.path)}`}
          alt={file.name}
          className="w-10 h-10 object-contain"
          style={{ width: "50px", height: "50px", objectFit: "contain" }}
        />
      )}
      <span>{file.name}</span>
    </Flex>
  );
}

export default function ServerFileBrowserDialog({
  onClose,
  extensions,
  defaultPath = "",
  onSelect,
}: {
  onClose: () => void;
  extensions?: string[];
  defaultPath?: string;
  onSelect: (file: FileItem) => void;
}) {
  return (
    <Dialog onOpenChange={onClose} open={true}>
      <DialogContent
        className="sm:max-w-[50vw]"
        aria-describedby={"Choose File"}
      >
        <DialogHeader>
          {/* <DialogTitle>Choose File</DialogTitle> */}
          <ServerFileBrowser
            extensions={extensions}
            defaultPath={defaultPath}
            onSelect={onSelect}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
