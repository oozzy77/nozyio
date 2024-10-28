import { useDnD } from "@/canvas/DnDContext";
import { fetchApi } from "@/common_app/app";
import { Flex } from "@/components/ui/Flex";
import Spinner from "@/components/ui/Spinner";
import { Stack } from "@/components/ui/Stack";
import { FunctionNodeData } from "@/type/types";
import {
  IconBrandTabler,
  IconFolder,
  IconTriangleInvertedFilled,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

type FunctionFileTreeNode = {
  type: "folder" | "file";
  name: string;
  path: string; // relative to the package path
  functions?: FunctionNodeData[];
};
export default function FunctionFilesList({ path }: { path: string }) {
  const [nodes, setNodes] = useState<FunctionFileTreeNode[]>([]);
  const { setDropingNode } = useDnD();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetchApi("/list_package_children?path=" + encodeURIComponent(path))
      .then((response) => {
        return response.json();
      })
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
            return <FolderNode node={node} key={node.path} />;
          }
          // python file item
          return (
            <Stack
              key={node.type + "_" + node.name}
              onClick={() => {
                // fetchApi("/code_to_graph?path=" + encodeURIComponent(node.path))
                //   .then((response) => response.json())
                //   .then((data) => {
                //     console.log(data);
                //   });
              }}
            >
              <Flex>
                <p className="text-muted-foreground">{node.name}</p>
              </Flex>
              {node.functions?.map((functionNode) => {
                return (
                  <div
                    draggable
                    onDragStart={(_event) => {
                      console.log(functionNode);
                      setDropingNode(functionNode);
                    }}
                    className="flex flex-row items-center ml-2 py-1 font-semibold gap-1 cursor-pointer hover:bg-secondary"
                    key={node.path + "_" + functionNode.name}
                  >
                    <IconBrandTabler size={18} />
                    <span>{functionNode.name}</span>
                  </div>
                );
              })}
            </Stack>
          );
        })}
      </div>
    </div>
  );
}

function FolderNode({ node }: { node: FunctionFileTreeNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Stack className="">
      <div
        className="flex flex-row items-center cursor-pointer hover:bg-secondary"
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
          <FunctionFilesList path={node.path} />
        </div>
      )}
    </Stack>
  );
}
