import { fetchApi } from "@/common_app/app";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fragment, useEffect, useState } from "react";
import { Stack } from "./ui/Stack";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { IconBrandGithub } from "@tabler/icons-react";
import { Flex } from "./ui/Flex";

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
          <div className="grid grid-cols-[2fr_3fr_1fr_1fr] gap-4">
            {/* <div className="font-bold">Name</div>
            <div className="font-bold">Description</div>
            <div className="font-bold">Install</div> */}
            {packages.map((pkg) => {
              return (
                <Fragment key={pkg.url}>
                  <div className="font-bold">{pkg.name}</div>
                  <div>{pkg.description}</div>
                  <Flex>
                    <a
                      href={pkg.url}
                      target="_blank"
                      className="flex items-center"
                    >
                      <IconBrandGithub size={18} />
                      <span className="ml-1">Github</span>
                    </a>
                  </Flex>

                  <Button
                    onClick={() => installPackage(pkg.url)}
                    isLoading={installingUrl === pkg.url}
                  >
                    Install
                  </Button>
                </Fragment>
              );
            })}
          </div>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
