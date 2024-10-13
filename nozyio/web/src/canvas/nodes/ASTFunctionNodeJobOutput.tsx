import { ASTNodeOutput, EJobNodeStatus, JobNodeStatus } from "@/type/types";
import { Stack } from "@/components/ui/Stack";
import { Flex } from "@/components/ui/Flex";
import Spinner from "@/components/ui/Spinner";
import { IconCircleCheck, IconXboxX } from "@tabler/icons-react";

export default function ASTFunctionNodeJobOutput({
  output,
  nodeID,
  status,
}: {
  output: ASTNodeOutput[] | null;
  nodeID: string;
  status: JobNodeStatus[string] | null;
}) {
  const outputsValues = status?.results;
  if (!outputsValues) return null;
  return (
    <Stack className="text-left m-2 gap-[1px]">
      <Flex className="gap-1 items-center mb-1">
        <p className="text-[10px] text-muted-foreground ">Outputs</p>
        {status?.status === EJobNodeStatus.RUNNING && (
          <Spinner className="w-4 h-4" />
        )}
        {status?.status === EJobNodeStatus.SUCCESS && (
          <IconCircleCheck className="w-4 h-4 text-green-500" />
        )}
        {status?.status === EJobNodeStatus.FAIL && (
          <IconXboxX className="w-4 h-4 text-red-500" />
        )}
      </Flex>
      {outputsValues?.map((value: any, index: number) => (
        <Stack key={index}>
          {/* {output?.[index]?.name && <p>{output[index].name}</p>} */}
          <div className="text-sm p-1 rounded-md border border-zinc-600 bg-zinc-700">
            {typeof value === "object" ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <pre className="whitespace-pre-wrap">{value}</pre>
            )}
          </div>
        </Stack>
      ))}
      {status?.error && (
        <Stack>
          <div className="text-sm p-1 rounded-md border bg-destructive">
            <pre className="whitespace-pre-wrap break-all">{status?.error}</pre>
          </div>
        </Stack>
      )}
    </Stack>
  );
}
