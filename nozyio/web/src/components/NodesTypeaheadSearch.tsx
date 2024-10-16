import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Stack } from "./ui/Stack";
import { useDebounced } from "@/hooks/useDebounced";
import { fetchApi } from "@/common_app/app";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Flex } from "./ui/Flex";
import { Tag } from "./ui/Tag";
import { ShowSearchEvent } from "@/type/types";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/react/shallow";

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
  const { addNode } = useAppStore(
    useShallow((state) => ({ addNode: state.addNode }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounced(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<FunctionSearchItem[]>([]);
  useEffect(() => {
    fetchApi(
      "/search_functions?query=" + encodeURIComponent(debouncedSearchTerm)
    )
      .then((resp) => resp.json())
      .then((json) => {
        console.log("search json", json);
        setSearchResults(json);
      });
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
      <CardHeader className="p-2 text-lg mb-2">
        <Input
          placeholder="Search for functions and nodes"
          autoFocus
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CardHeader>
      <CardContent className="h-[60vh] overflow-y-auto px-3">
        <Stack className="">
          {searchResults.map((item) => (
            <Flex
              key={item.file_path + "." + item.name + "." + item.type}
              className="justify-between flex-wrap hover:bg-muted py-2 cursor-pointer"
              onClick={() => {
                addNode({
                  data: {
                    type: item.type,
                    name: item.name,
                    module: item.file_path,
                  },
                  position: {
                    x: showSearch.mouseX,
                    y: showSearch.mouseY,
                  },
                  type: "astFunction",
                });
              }}
            >
              <p>{item.name}</p>
              <Flex className="gap-2">
                <p className="text-muted-foreground text-sm">
                  {item.file_path}
                </p>
                <Tag>{item.type}</Tag>
              </Flex>
            </Flex>
          ))}
        </Stack>
        {searchResults.length === 0 && <p>No results found</p>}
      </CardContent>
    </Card>
  );
}
