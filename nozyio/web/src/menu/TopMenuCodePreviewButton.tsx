import { Button } from "@/components/ui/button";
import type { CanvasState } from "@/type/types";
import { common_app, fetchApi } from "@/common_app/app";
import {
  IconCode,
  IconCopy,
  IconPin,
  IconPinFilled,
} from "@tabler/icons-react";
import { Flex } from "@/components/ui/Flex";
import { useEffect, useState } from "react";
import useAppStore from "@/canvas/store";
import { useShallow } from "zustand/shallow";
import CustomDrawer from "@/components/ui/CustomDrawer";
import { Stack } from "@/components/ui/Stack";
import { useToast } from "@/hooks/use-toast";
import { Highlight, themes } from "prism-react-renderer";

export default function TopMenuCodePreviewButton() {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

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
        <CustomDrawer
          onClose={() => setOpen(false)}
          position="right"
          backdrop={null}
        >
          {/* <Button
            className="absolute top-2 right-2 w-8 h-8"
            variant={"ghost"}
            onClick={() => setPinned(!pinned)}
          >
            {pinned ? <IconPin size={18} /> : <IconPinFilled size={18} />}
          </Button> */}
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
    <Stack className="px-4 py-2 w-[36vw]">
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

      <Highlight theme={themes.shadesOfPurple} code={code} language="python">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            style={style}
            className="w-full overflow-x-auto px-2 py-4 rounded-md"
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </Stack>
  );
}
