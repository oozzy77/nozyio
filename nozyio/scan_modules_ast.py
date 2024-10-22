import ast
import importlib
import json
import os
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

import ast
import json
from typing import Literal

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

def process_annotation(annotation, import_aliases):
    if annotation is not None:
        if (isinstance(annotation, ast.Subscript) and
            isinstance(annotation.value, ast.Name) and
            annotation.value.id == 'Union'):
            # Extract the types inside Union
            if isinstance(annotation.slice, ast.Tuple):
                # Multiple types
                types = []
                for elt in annotation.slice.elts:
                    type_name = ast.unparse(elt)
                    # Resolve alias to real class name and extract class name
                    resolved_name = import_aliases.get(type_name, type_name)
                    types.append(resolved_name.split('.')[-1])
                # return types
                return 'Union'
            else:
                # Single type
                type_name = ast.unparse(annotation.slice)
                resolved_name = import_aliases.get(type_name, type_name)
                return [resolved_name.split('.')[-1]]
        # Check if the annotation is a Literal
        elif (isinstance(annotation, ast.Subscript) and
            isinstance(annotation.value, ast.Name) and
            annotation.value.id == 'Literal'):
            # Extract the values inside Literal
            if isinstance(annotation.slice, ast.Tuple):
                # Multiple values
                literal_values = []
                for elt in annotation.slice.elts:
                    try:
                        value = ast.literal_eval(elt)
                        literal_values.append(value)
                    except:
                        pass  # Cannot evaluate
                return literal_values
            else:
                # Single value
                try:
                    value = ast.literal_eval(annotation.slice)
                    return [value]
                except:
                    pass  # Cannot evaluate
        else:
            # For other annotations, unparse to get the string representation
            annotation_str = ast.unparse(annotation)
            # Check if the annotation is an alias and map it to the real class name
            full_name = import_aliases.get(annotation_str, annotation_str)
            # Extract only the class name
            return full_name.split('.')[-1]
    return None

def extract_function_info_from_ast(function_node, module_name, nozy_node_def = {}, import_aliases = {}):
    # Get the function name
    function_name = function_node.name

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

        type_annotation = process_annotation(param_annotation, import_aliases)
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
        type_annotation = process_annotation(param_annotation, import_aliases)
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

        type_annotation = process_annotation(param_annotation, import_aliases)
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
        type_annotation = process_annotation(param_annotation, import_aliases)
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
        return_annotation = process_annotation(function_node.returns, import_aliases)
        if isinstance(return_annotation, list):
            # Multiple output types
            for index, output_type in enumerate(return_annotation):
                outputs.append({
                    "id": index,
                    "io_type": "output",
                    "type": output_type
                })
        else:
            outputs.append({
                "id": "0",
                "io_type": "output",
                "type": return_annotation
            })
    else:
        outputs.append({
            "id": "0",
            "io_type": "output",
            "type": "any"
        })
    extra_output_info = nozy_node_def.get('output', nozy_node_def.get('outputs', None))
    if extra_output_info is not None:
        for index,extra_output in enumerate(extra_output_info):
            extra_output['id'] = str(index)
            extra_output['io_type'] = 'output'
        outputs = extra_output_info

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
            "args": ast_args,
            "keywords": []
        },
        "targets": targets
    }

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

def build_import_aliases(tree):
    import_aliases = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            module = node.module
            for alias in node.names:
                import_aliases[alias.asname or alias.name] = f"{module}.{alias.name}"
        elif isinstance(node, ast.Import):
            for alias in node.names:
                import_aliases[alias.asname or alias.name] = alias.name
    return import_aliases

def parse_python_file_dict(file_path, module_name) -> dict[str, dict]:
    """Parse a Python file and extract function information."""
    with open(file_path, "r") as file:
        source_code = file.read()

    tree = ast.parse(source_code)
    functions = {}
    nozy_node_defs = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            # is NOZY_NODE_DEF assign
            for target in node.targets:
                if isinstance(target, ast.Attribute) and target.attr == 'NOZY_NODE_DEF':
                    if isinstance(target.value, ast.Name):
                        function_name = target.value.id
                        try:
                            nozy_node_def = ast.literal_eval(node.value)
                            if isinstance(nozy_node_def, dict):
                                nozy_node_defs[function_name] = nozy_node_def
                        except:
                            pass
    import_aliases = build_import_aliases(tree)
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            # Extract function information
            func_info = extract_function_info_from_ast(node, module_name, nozy_node_defs.get(node.name, {}), import_aliases)
            functions[node.name] = func_info

    return functions

def parse_python_file(file_path, module_name) -> list[dict]:
    details_dict = parse_python_file_dict(file_path, module_name)
    return list(details_dict.values())

def get_function_details_by_ast(module_name, function_name):
    # Find the module specification
    spec = importlib.util.find_spec(module_name)
    if spec is None:
        raise ImportError(f"Module {module_name} not found")
    module_path = spec.origin
    if module_path is None:
        raise ImportError(f"Module {module_name} does not have a file path")
    
    file_path = os.path.abspath(module_path)
    funcitons = parse_python_file_dict(file_path, module_name)
    return funcitons.get(function_name, None)

if __name__ == "__main__":
    # Example usage
    file_path = "path/to/your/module.py"
    module_name = "module"
    functions_info = parse_python_file(file_path, module_name)
    for func in functions_info:
        print(func)