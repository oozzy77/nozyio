import ast

def infer_type_from_annotation(annotation):
    """Infer the type from an annotation."""
    if isinstance(annotation, ast.Name):
        return annotation.id
    elif isinstance(annotation, ast.Subscript) and isinstance(annotation.value, ast.Name) and annotation.value.id == 'Literal':
        # Check if the slice is a Tuple and extract elements
        if isinstance(annotation.slice, ast.Index):
            slice_value = annotation.slice.value
        else:
            slice_value = annotation.slice

        if isinstance(slice_value, ast.Tuple):
            return [elt.s for elt in slice_value.elts if isinstance(elt, ast.Str)]
    return "any"

def infer_type_from_default(default_value):
    """Infer the type of a parameter from its default value if it's a primitive type."""
    if isinstance(default_value, int):
        return 'int'
    elif isinstance(default_value, str):
        return 'str'
    elif isinstance(default_value, bool):
        return 'bool'
    elif isinstance(default_value, float):
        return 'float'
    else:
        return None

def extract_function_info_from_ast(node, module_name):
    """Extract function information from an AST node."""
    function_info = {
        "name": node.name,
        "parameters": [],
        "return_type": infer_type_from_annotation(node.returns)
    }

    # Extract parameters
    for index, arg in enumerate(node.args.args):
        param_info = {
            "id": str(index),
            "name": arg.arg,
            "type": infer_type_from_annotation(arg.annotation),
            "default": None
        }
        function_info["parameters"].append(param_info)

    # Extract default values
    if node.args.defaults:
        for i, default in enumerate(node.args.defaults):
            param_info = function_info["parameters"][-(i + 1)]
            param_info["default"] = ast.unparse(default)
            inferred_type = infer_type_from_default(eval(param_info["default"]))
            if inferred_type:
                param_info["type"] = inferred_type
    astNode = {
            "node_type": "Assign",
            "value": {
                "node_type": "Call",
                "func": {
                    "node_type": "Name",
                    "id": node.name,
                    "ctx": {
                        "node_type": "Load"
                    }
                },
                "args": function_info["parameters"],
                "keywords": []
            },
            "targets": [{
                "id": "0",
                "io_type": "output",
                "type": function_info["return_type"]
            }]
        } 
    return {
        "type": "function",
        "name": node.name,
        "module": module_name,
        "input": function_info["parameters"],
        "output": [{
            "id": "0",
            "type": function_info["return_type"]
        }],
        "astNodes": [astNode]
    }

def parse_python_file(file_path, module_name):
    """Parse a Python file and extract function information."""
    with open(file_path, "r") as file:
        source_code = file.read()

    tree = ast.parse(source_code)
    functions = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            func_info = extract_function_info_from_ast(node, module_name)
            functions.append(func_info)

    return functions

if __name__ == "__main__":
    # Example usage
    file_path = "path/to/your/module.py"
    module_name = "module"
    functions_info = parse_python_file(file_path, module_name)
    for func in functions_info:
        print(func)