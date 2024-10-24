import { fetchApi } from "@/common_app/app";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { Stack } from "@/components/ui/Stack";
import { IconFolder, IconTriangleInvertedFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type WorkflowFileTreeNode = {
  name: string;
  path: string; // absolute path
  rel_path: string; // relative path to workflow_path
  type: "folder" | "file";
};
export default function WorkflowFilesList({
  path,
  onClickWorkflow,
}: {
  path: string;
  onClickWorkflow: (path: string) => void;
}) {
  const [nodes, setNodes] = useState<WorkflowFileTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetchApi("/workflow/list?path=" + encodeURIComponent(path))
      .then((response) => response.json())
      .then((data) => {
        setNodes(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        {loading && <Spinner />}
        {nodes.map((node) => {
          if (node.type === "folder") {
            return (
              <FolderNode
                node={node}
                key={node.path}
                onClickWorkflow={onClickWorkflow}
              />
            );
          }
          return (
            <Stack key={node.type + "_" + node.name}>
              <Button
                variant="ghost"
                className="justify-start text-lg"
                onClick={() => {
                  if (typeof node.rel_path === "string") {
                    onClickWorkflow(node.rel_path);
                  }
                }}
              >
                <p className="">{node.name}</p>
              </Button>
            </Stack>
          );
        })}
      </div>
    </div>
  );
}

function FolderNode({
  node,
  onClickWorkflow,
}: {
  node: WorkflowFileTreeNode;
  onClickWorkflow: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Stack className="">
      <div
        className="flex flex-row items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <IconTriangleInvertedFilled
          size={8}
          className={open ? "mr-1" : "-rotate-90 mr-1"}
        />

        <IconFolder className="mr-1" />
        {node.name}
      </div>
      {open && (
        <div className="ml-3">
          <WorkflowFilesList
            path={node.path}
            onClickWorkflow={onClickWorkflow}
          />
        </div>
      )}
    </Stack>
  );
}
