import { fetchApi } from "@/common_app/app";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Stack } from "./ui/Stack";
import { Flex } from "./ui/Flex";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

export default function InstallPackageDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [installingUrl, setInstallingUrl] = useState<string | null>(null);
  useEffect(() => {
    fetchApi("/package/list_community")
      .then((resp) => resp.json())
      .then(setPackages);
  }, []);
  const installPackage = (url: string) => {
    setInstallingUrl(url);
    fetchApi(`/package/install`, {
      method: "POST",
      body: JSON.stringify({ url }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        setInstallingUrl(null);
        if (json.error) {
          toast({
            title: `❌Failed to install package ${url}`,
            description: json.error,
          });
        } else {
          toast({
            title: `✅Installed package ${url}`,
            description: "Please refresh the page.",
          });
        }
      });
  };
  return (
    <Dialog onOpenChange={onClose} open={true}>
      <DialogContent
        className="sm:max-w-[50vw]"
        aria-describedby={"Choose File"}
      >
        <DialogHeader>
          <DialogTitle>Community Node Packages</DialogTitle>
        </DialogHeader>
        <Stack>
          {packages.map((pkg) => (
            <Flex key={pkg.url} className="gap-2">
              <p className="font-bold flex-1">{pkg.name}</p>
              <p className="flex-2 mr-4">{pkg.description}</p>
              <Button
                onClick={() => installPackage(pkg.url)}
                isLoading={installingUrl === pkg.url}
              >
                Install
              </Button>
            </Flex>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
