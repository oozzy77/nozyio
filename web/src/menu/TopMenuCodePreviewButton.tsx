import { Button } from "@/components/ui/button";
import type { CanvasState } from "@/type/types";
import { common_app, fetchApi } from "@/common_app/app";
import { IconCode, IconCopy } from "@tabler/icons-react";
import { Flex } from "@/components/ui/Flex";
import { useEffect, useState } from "react";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/shallow";
import CustomDrawer from "@/components/ui/CustomDrawer";
import { Stack } from "@/components/ui/Stack";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useToast } from "@/hooks/use-toast";

export default function TopMenuCodePreviewButton() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        left={<IconCode size={18} />}
      >
        Code
      </Button>
      {open && (
        <CustomDrawer onClose={() => setOpen(false)} position="right">
          <CodePreview />
        </CustomDrawer>
      )}
    </div>
  );
}

function CodePreview() {
  const [code, setCode] = useState("");
  const { toast } = useToast();
  const { name } = useAppStore(
    useShallow((state: CanvasState) => ({
      name: state.name,
    }))
  );

  useEffect(() => {
    fetchApi("/graph_to_code", {
      method: "POST",
      body: JSON.stringify(common_app.graph),
    })
      .then((res) => res.json())
      .then((data) => {
        setCode(data);
      });
  }, []);
  return (
    <Stack className="px-4 py-2 w-[30vw]">
      <h2 className="text-2xl font-bold mb-3">Code</h2>
      <p className="text-sm text-gray-500 mb-2">
        This is the python code that will be executed.
      </p>
      <Flex className="gap-2">
        <pre className="text-sm text-gray-500">{name}.py</pre>
        {/* <Button variant="ghost" size="sm">
          <IconDownload size={18} />
        </Button> */}
        <Button
          variant="ghost"
          className="w-8 h-8"
          onClick={() => {
            navigator.clipboard.writeText(code);
            toast({
              title: "✅ Copied to clipboard",
            });
          }}
        >
          <IconCopy size={18} />
        </Button>
      </Flex>

      <div>
        <SyntaxHighlighter language="python" style={vscDarkPlus}>
          {code}
        </SyntaxHighlighter>
      </div>
    </Stack>
  );
}
