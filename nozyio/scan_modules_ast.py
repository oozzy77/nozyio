import ast
import json
def is_serializable(value):
    try:
        json.dumps(value)
        return True
    except:
        return False

def infer_type_from_default(default):
    if default is None:
        return None
    elif isinstance(default, bool):
        return 'bool'
    elif isinstance(default, int):
        return 'int'
    elif isinstance(default, float):
        return 'float'
    elif isinstance(default, str):
        return 'str'
    elif isinstance(default, list):
        return 'list'
    elif isinstance(default, dict):
        return 'dict'
    else:
        return None

def extract_function_info_from_ast(function_node, module_name):
    # Get the function name
    function_name = function_node.name

    # Initialize NOZY_NODE_DEF
    nozy_node_def = {}

    # Search for NOZY_NODE_DEF assignment within the function body
    for node in function_node.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == 'NOZY_NODE_DEF':
                    try:
                        # Evaluate the assigned value
                        nozy_node_def = ast.literal_eval(node.value)
                    except:
                        pass
                    break

    if not isinstance(nozy_node_def, dict):
        nozy_node_def = {}

    extra_input_info = nozy_node_def.get('input', nozy_node_def.get('inputs', {}))
    if not isinstance(extra_input_info, dict):
        extra_input_info = {}

    # Now extract parameters, defaults, annotations, etc.
    ast_args = []
    args = function_node.args

    # Helper function to process annotations
    def process_annotation(annotation):
        if annotation is not None:
            return ast.unparse(annotation)
        return None

    # Process positional arguments
    num_args = len(args.args)
    num_defaults = len(args.defaults)
    num_non_defaults = num_args - num_defaults

    for i, arg in enumerate(args.args):
        param_name = arg.arg
        param_annotation = arg.annotation

        if i >= num_non_defaults:
            # Argument has default
            default_index = i - num_non_defaults
            default_node = args.defaults[default_index]
            try:
                default_value = ast.literal_eval(default_node)
            except:
                default_value = None
            optional = True
        else:
            default_value = None
            optional = False

        type_annotation = process_annotation(param_annotation)
        inferred_type = infer_type_from_default(default_value)
        param_type = type_annotation or inferred_type or "any"

        ast_args.append({
            "id": str(param_name),
            "io_type": "input",
            "default": default_value if is_serializable(default_value) else None,
            "optional": optional,
            "name": param_name,
            "type": param_type,
            **extra_input_info.get(param_name, {})
        })

    # Process vararg (*args)
    if args.vararg:
        param_name = args.vararg.arg
        param_annotation = args.vararg.annotation
        type_annotation = process_annotation(param_annotation)
        param_type = type_annotation or "any"

        ast_args.append({
            "id": str(param_name),
            "io_type": "input",
            "default": None,
            "optional": False,
            "name": "*" + param_name,
            "type": param_type,
            **extra_input_info.get(param_name, {})
        })

    # Process keyword-only arguments
    for i, kwarg in enumerate(args.kwonlyargs):
        param_name = kwarg.arg
        param_annotation = kwarg.annotation
        default_node = args.kw_defaults[i]

        if default_node is not None:
            try:
                default_value = ast.literal_eval(default_node)
            except:
                default_value = None
            optional = True
        else:
            default_value = None
            optional = False

        type_annotation = process_annotation(param_annotation)
        inferred_type = infer_type_from_default(default_value)
        param_type = type_annotation or inferred_type or "any"

        ast_args.append({
            "id": str(param_name),
            "io_type": "input",
            "default": default_value if is_serializable(default_value) else None,
            "optional": optional,
            "name": param_name,
            "type": param_type,
            **extra_input_info.get(param_name, {})
        })

    # Process kwarg (**kwargs)
    if args.kwarg:
        param_name = args.kwarg.arg
        param_annotation = args.kwarg.annotation
        type_annotation = process_annotation(param_annotation)
        param_type = type_annotation or "any"

        ast_args.append({
            "id": str(param_name),
            "io_type": "input",
            "default": None,
            "optional": False,
            "name": "**" + param_name,
            "type": param_type,
            **extra_input_info.get(param_name, {})
        })

    # Handle outputs (return type annotation)
    outputs = []
    if function_node.returns is not None:
        if isinstance(function_node.returns, ast.Tuple):
            for elt in function_node.returns.elts:
                output_type = ast.unparse(elt)
                outputs.append({
                    "id": None,
                    "type": output_type
                })
        else:
            output_type = ast.unparse(function_node.returns)
            outputs.append({
                "id": None,
                "type": output_type
            })
    else:
        outputs.append({
            "id": None,
            "type": "any"
        })

    # Create the import AST node
    import_ast_node = {
        "node_type": "ImportFrom",
        "module": module_name,
        "names": [{
            "node_type": "alias",
            "name": function_name,
            "asname": None
        }],
        "level": 0
    }

    # Create the assign AST node
    if len(outputs) == 1:
        targets = outputs
    else:
        targets = [{
            "node_type": "Tuple",
            "elts": outputs,
            "ctx": {
                "node_type": "Store"
            }
        }]

    assign_ast_node = {
        "node_type": "Assign",
        "value": {
            "node_type": "Call",
            "func": {
                "node_type": "Name",
                "id": function_name,
                "ctx": {
                    "node_type": "Load"
                }
            },
            "args": [{"node_type": "Name", "id": arg["name"], "ctx": {"node_type": "Load"}} for arg in ast_args],
            "keywords": []
        },
        "targets": targets
    }

    return {
        "type": "function",
        "node_title": nozy_node_def.get('node_title', function_name),
        "description": nozy_node_def.get('description', None),
        "name": function_name,
        "module": module_name,
        "input": ast_args,
        "output": outputs,
        "astNodes": [import_ast_node, assign_ast_node]
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