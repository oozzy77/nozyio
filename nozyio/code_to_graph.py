import ast
import json
import astpretty
from typing import Union


def code_to_json(code: str) -> Union[dict, list]:
    # Parse the Python code to create the AST
    class ASTToJSON(ast.NodeVisitor):
        def generic_visit(self, node):
            if isinstance(node, ast.AST):
                fields = {field: self.generic_visit(getattr(node, field)) for field in node._fields}
                return {"node_type": node.__class__.__name__, **fields}
            elif isinstance(node, list):
                return [self.generic_visit(item) for item in node]
            else:
                return node
    tree = ast.parse(code)
    astpretty.pprint(tree, indent='    ', show_offsets=False)
    # Convert the AST to JSON-compatible format
    return ASTToJSON().generic_visit(tree)



class JSONToAST:
    def convert(self, node):
        # If it's a dictionary (representing an AST node), reconstruct the node
        if isinstance(node, dict) and 'node_type' in node:
            node_type = node.pop('node_type')
            # Find the corresponding AST class
            ast_class = getattr(ast, node_type)
            # Reconstruct the AST node
            ast_node = ast_class()
            for field, value in node.items():
                setattr(ast_node, field, self.convert(value))
            # Ensure 'lineno' and 'col_offset' are set for nodes that require them
            if isinstance(ast_node, ast.AST):
                if not hasattr(ast_node, 'lineno'):
                    ast_node.lineno = 0  # Default value for missing line number
                if not hasattr(ast_node, 'col_offset'):
                    ast_node.col_offset = 0  # Default value for missing column offset
            return ast_node
        # If it's a list, recursively convert each item
        elif isinstance(node, list):
            return [self.convert(item) for item in node]
        # For everything else (constants like numbers, strings), return as-is
        else:
            return node

def json_dict_to_code(json_dict: dict) -> str:
    ast_node = JSONToAST().convert(json_dict)
    return ast.unparse(ast_node)

def json_to_ast(json_data):
    try:
        # Parse the JSON string to get a dictionary
        ast_dict = json.loads(json_data)
        # Convert the dictionary back to an AST
        return JSONToAST().convert(ast_dict)
    except Exception as e:
        print(f"Error while converting JSON to AST: {e}")
        return None

def code_to_graph(abs_path: str):
    with open(abs_path, "r") as file:
        code = file.read()
    tree = code_to_json(code)
    return tree

if __name__ == "__main__":
    code = """

b = find(a=44)

"""
    print('python to ast json...')
    json_dict = code_to_json(code)
    json_string = json.dumps(json_dict, indent=2)
    print('➡️json graph of ast tree...', json_string)
    ast_node = json_to_ast(json_string)
    print('➡️ json back to ast tree...')
    astpretty.pprint(ast_node, indent='    ', show_offsets=False)
    print('⭐️ ast back to code...')
    code = ast.unparse(ast_node)
    
    print(code)