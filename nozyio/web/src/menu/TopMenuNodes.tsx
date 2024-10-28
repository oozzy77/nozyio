import { Button } from "@/components/ui/button";
import CustomDrawer from "@/components/ui/CustomDrawer";
import { useState } from "react";
import { IconBox } from "@tabler/icons-react";
import FunctionFilesList from "./FunctionFilesList";
import { Stack } from "@/components/ui/Stack";
import { Flex } from "@/components/ui/Flex";
import InstallPackageDialog from "@/components/InstallPackageDialog";

export default function TopMenuNodes() {
  const [open, setOpen] = useState(false);
  const [installPackageDialogOpen, setInstallPackageDialogOpen] =
    useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} left={<IconBox size={18} />}>
        Nodes
      </Button>
      {open && (
        <CustomDrawer onClose={() => setOpen(false)} backdrop={null}>
          <Stack className="w-[400px] py-2 px-2 overflow-y-auto h-[100vh]">
            <Flex className="justify-between">
              <h2 className="text-xl font-bold p-2">Nodes</h2>
              <Button onClick={() => setInstallPackageDialogOpen(true)}>
                Install Node Package
              </Button>
            </Flex>
            <FunctionFilesList path="" />
          </Stack>
        </CustomDrawer>
      )}
      {installPackageDialogOpen && (
        <InstallPackageDialog
          onClose={() => setInstallPackageDialogOpen(false)}
        />
      )}
    </>
  );
}
