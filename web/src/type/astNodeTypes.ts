// Base AST Node Interface
export type ASTNode = {
  node_type: string;
} & ASTIONode;

type ASTIONode = {
  io_type?: "input" | "output";
  id?: string;
  name?: string;
  type?: string;
};

// Argument Node
interface ArgNode extends ASTNode {
  node_type: "arg";
  arg: string;
  annotation: null | ASTNode;
  type_comment: null | string;
}

// Name Node
export type NameNodeData = ASTNode & {
  node_type: "Name";
  id: string;
  ctx: ContextNode;
};

// Context Node (Load, Store, etc.)
interface ContextNode extends ASTNode {
  node_type: "Load" | "Store";
}

// Constant Node
export type ConstantNodeData = ASTNode & {
  node_type: "Constant";
  value: any;
  kind: null | string;
};

// BinOp Node (Binary operations)
interface BinOpNode extends ASTNode {
  node_type: "BinOp";
  left: ASTNode;
  op: ASTNode;
  right: ASTNode;
}

// Call Node (Function Call)
export type CallNodeData = ASTNode & {
  node_type: "Call";
  func: NameNodeData;
  args: (NameNodeData | ConstantNodeData | CallNodeData)[];
  __info: {
    module: string;
    name: string;
    args: {
      name: string;
      type: string;
      default: string | number;
    }[];
  };
  keywords: ASTNode[];
};

// Attribute Node
interface AttributeNode extends ASTNode {
  node_type: "Attribute";
  value: ASTNode;
  attr: string;
  ctx: ContextNode;
}

// Function Definition Node
interface FunctionDefNode extends ASTNode {
  node_type: "FunctionDef";
  name: string;
  args: ArgumentsNode;
  body: ASTNode[];
  decorator_list: ASTNode[];
  returns: null | ASTNode;
  type_comment: null | string;
}

// Arguments Node
interface ArgumentsNode extends ASTNode {
  node_type: "arguments";
  posonlyargs: ASTNode[];
  args: ArgNode[];
  vararg: null | ASTNode;
  kwonlyargs: ASTNode[];
  kw_defaults: ASTNode[];
  kwarg: null | ASTNode;
  defaults: ASTNode[];
}

// Assign Node
export type AssignNodeData = ASTNode & {
  node_type: "Assign";
  targets: ASTNode[];
  value: CallNodeData;
  type_comment: null | string;
};

// Compare Node
interface CompareNode extends ASTNode {
  node_type: "Compare";
  left: ASTNode;
  ops: ASTNode[];
  comparators: ASTNode[];
}

// If Node
interface IfNode extends ASTNode {
  node_type: "If";
  test: ASTNode;
  body: ASTNode[];
  orelse: ASTNode[];
}

// Augmented Assignment Node (e.g., +=)
interface AugAssignNode extends ASTNode {
  node_type: "AugAssign";
  target: ASTNode;
  op: ASTNode;
  value: ASTNode;
}

// Return Node
interface ReturnNode extends ASTNode {
  node_type: "Return";
  value: ASTNode;
}

// List Node
interface ListNode extends ASTNode {
  node_type: "List";
  elts: ASTNode[];
  ctx: ContextNode;
}

export type AnyASTNode =
  | FunctionDefNode
  | ArgNode
  | NameNodeData
  | ConstantNodeData
  | BinOpNode
  | CallNodeData
  | AttributeNode
  | AssignNodeData
  | CompareNode
  | IfNode
  | AugAssignNode
  | ReturnNode
  | ListNode
  | ArgumentsNode;
