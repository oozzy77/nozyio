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
  const { addNode, setShowSearch } = useAppStore(
    useShallow((state) => ({
      addNode: state.addNode,
      setShowSearch: state.setShowSearch,
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
                  onClick={() => {
                    console.log("selected add node", showSearch);
                    addNode({
                      data: item as ASTNodeData,
                      position: {
                        x: showSearch.mouseX,
                        y: showSearch.mouseY,
                      },
                      type: "astFunction",
                    });
                    setShowSearch(null);
                  }}
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
