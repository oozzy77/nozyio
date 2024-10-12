import { createContext, useContext, useState } from "react";
import { ASTNodeData } from "@/type/types";

const DnDContext = createContext<{
  dropingNode: ASTNodeData | null;
  setDropingNode: (node: ASTNodeData | null) => void;
}>({ dropingNode: null, setDropingNode: () => {} });

export const DnDProvider = ({ children }: { children: React.ReactNode }) => {
  const [dropingNode, setDropingNode] = useState<ASTNodeData | null>(null);

  return (
    <DnDContext.Provider value={{ dropingNode, setDropingNode }}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => {
  return useContext(DnDContext);
};
