import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Stack } from "./ui/Stack";
import { useDebounced } from "@/hooks/useDebounced";
import { fetchApi } from "@/common_app/app";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Flex } from "./ui/Flex";
import { Tag } from "./ui/Tag";
import { ASTNodeData, ShowSearchEvent } from "@/type/types";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/react/shallow";
import Spinner from "./ui/Spinner";
import { TOP_HANDLE_ID } from "@/utils/consts";

type FunctionSearchItem = {
  name: string;
  type: "class" | "function";
  file_path: "string";
};
export default function NodesTypeaheadSearch({
  showSearch,
}: {
  showSearch: ShowSearchEvent;
}) {
  const { addNode, setShowSearch, addEdge } = useAppStore(
    useShallow((state) => ({
      addNode: state.addNode,
      setShowSearch: state.setShowSearch,
      addEdge: state.addEdge,
    }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounced(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<
    (FunctionSearchItem | ASTNodeData | null)[]
  >([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetchApi(
      "/search_functions?query=" + encodeURIComponent(debouncedSearchTerm)
    )
      .then((resp) => resp.json())
      .then((json) => {
        setSearchResults(json);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearchTerm]);
  const onClickSearchResult = (item: FunctionSearchItem | ASTNodeData) => {
    const newNode = addNode({
      data: item as ASTNodeData,
      position: {
        x: showSearch.mouseX,
        y: showSearch.mouseY,
      },
      type: "astFunction",
    });
    // find possible handle to connect to (same io type, not hidden)
    const input =
      newNode.data.input?.filter(
        (input) =>
          input.type === showSearch.connectFrom?.handleType &&
          !input.hide_handle
      )?.[0] ?? newNode.data.input?.filter((input) => !input.hide_handle)?.[0];
    const output =
      newNode.data.output?.filter(
        (output) =>
          output.type === showSearch.connectFrom?.handleType &&
          !output.hide_handle
      )?.[0] ??
      newNode.data.output?.filter((output) => !output.hide_handle)?.[0];
    if (showSearch.connectFrom) {
      const edge = {
        source: showSearch.connectFrom.source ?? newNode.id,
        target: showSearch.connectFrom.target ?? newNode.id,
        sourceHandle:
          showSearch.connectFrom.sourceHandle ?? output?.id ?? TOP_HANDLE_ID,
        targetHandle:
          showSearch.connectFrom.targetHandle ?? input?.id ?? TOP_HANDLE_ID,
      };
      console.log("adding edge", edge);
      addEdge({
        id:
          edge.source +
          "_" +
          edge.target +
          "_" +
          edge.sourceHandle +
          "_" +
          edge.targetHandle,
        ...edge,
      });
    }
    setShowSearch(null);
  };

  return (
    <Card
      className="sm:w-[60vw] w-[90vw] max-w-[700px]"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <CardHeader className="p-2 text-lg mb-2 relative">
        <Input
          placeholder="Search for functions and nodes"
          autoFocus
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && <Spinner className="w-4 h-4 absolute top-2 right-2" />}
      </CardHeader>
      <CardContent className="h-[60vh] overflow-y-auto px-3">
        <Stack className="">
          {searchResults.map(
            (item, index) =>
              item && (
                <Flex
                  key={`${item.type}-${item.name}-${index}`}
                  className="justify-between flex-wrap hover:bg-muted py-2 cursor-pointer"
                  onClick={() => onClickSearchResult(item)}
                >
                  <p>{item.name}</p>
                  <Flex className="gap-2">
                    <p className="text-muted-foreground text-sm">
                      {
                        //@ts-ignore
                        item.file_path ?? item.module
                      }
                    </p>
                    <Tag>{item.type}</Tag>
                  </Flex>
                </Flex>
              )
          )}
        </Stack>
        {searchResults.length === 0 && <p>No results found</p>}
      </CardContent>
    </Card>
  );
}
