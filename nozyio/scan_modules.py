import math
import os
import importlib
import inspect
import fnmatch
import time
import json
import traceback
from .config_utils import config, get_root_dir
from .scan_modules_ast import get_function_details_by_ast, parse_python_file
from .utils import is_serializable

def matches_blacklist(filepath, blacklist):
    """Check if the file path matches any pattern in the blacklist."""
    for pattern in blacklist:
        if fnmatch.fnmatch(filepath, pattern):
            return True
    return False


def infer_type_from_default(default_value):
    """Infer the type of a parameter from its default value if it's a primitive type."""
    if isinstance(default_value, bool):
        return 'bool'
    elif isinstance(default_value, int):
        return 'int'
    elif isinstance(default_value, str):
        return 'str'
    elif isinstance(default_value, float):
        return 'float'
    else:
        return None

def get_function_return_type(obj):
    if getattr(obj, 'NOZY_NODE_DEF', None):
        outputs = obj.NOZY_NODE_DEF.get('output', obj.NOZY_NODE_DEF.get('outputs', None))
        if outputs:
            node_outputs = [
                {
                    "id": str(index),
                    "io_type": "output",
                    "type": output if isinstance(output, str) else None,
                    **(output if isinstance(output, dict) else {})
                }
                for index, output in enumerate(outputs)
            ]
            return node_outputs

    signature = inspect.signature(obj)
    anno_type = getattr(signature.return_annotation, '__name__', str(signature.return_annotation)) if signature.return_annotation != inspect.Signature.empty else "any"
    return [{
        "id": "0",
        "io_type": "output",
        "type": anno_type
    }]

from typing import Literal
def extract_function_details(obj, module_name):
    if inspect.isfunction(obj):
        # Get function signature
        signature = inspect.signature(obj)
        ast_args = []
        nozy_node_def = getattr(obj, 'NOZY_NODE_DEF', {})
        if not isinstance(nozy_node_def, dict):
            nozy_node_def = {}
        extra_input_info = nozy_node_def.get('input', nozy_node_def.get('inputs', {}))
        if not isinstance(extra_input_info, dict):
            extra_input_info = {}
        
        # Collect information about parameters
        for index, (param_name, param) in enumerate(signature.parameters.items()):
            default = param.default if is_serializable(param.default) else None
            type = infer_type_from_default(default)
            if param.annotation != inspect.Parameter.empty:
                type = getattr(param.annotation, '__name__', str(param.annotation))
            if hasattr(param.annotation, '__origin__') and param.annotation.__origin__ is Literal:
                type = list(param.annotation.__args__)
            
            ast_args.append({
                "id": str(param_name), 
                "io_type": "input",
                "default": default,
                "optional": param.default is not inspect.Parameter.empty,
                "name": param_name,
                "type": type if type else "any",
                **extra_input_info.get(param_name, {})
            }) 
        outputs = get_function_return_type(obj)
        
        # Create the import AST node
        import_ast_node = {
            "node_type": "ImportFrom",
            "module": module_name,
            "names": [{
                "node_type": "alias",
                "name": obj.__name__,
                "asname": None
            }],
            "level": 0
        }
        
        # Create the assign AST node
        assign_ast_node = {
            "node_type": "Assign",
            "value": {
                "node_type": "Call",
                "func": {
                    "node_type": "Name",
                    "id": obj.__name__,
                    "ctx": {
                        "node_type": "Load"
                    }
                },
                "args": ast_args,
                "keywords": []
            },
            "targets": outputs if len(outputs) == 1 else [{
                "node_type": "Tuple",
                "elts": outputs,
                "ctx": {
                    "node_type": "Store"
                }
            }]
        } 
        
        return {
            "type": "function",
            "node_title": nozy_node_def.get('node_title', obj.__name__),
            "description": nozy_node_def.get('description', None),
            "name": obj.__name__,
            "module": module_name,
            "input": ast_args,
            "output": outputs,
            "astNodes": [import_ast_node, assign_ast_node]
        }
def extract_class_details(cls_obj, module_name):
    """Extract detailed information about a class, including its methods."""
    class_name = cls_obj.__name__

    # List methods of the class
    methods = []
    for name, method in inspect.getmembers(cls_obj, predicate=inspect.isfunction):
        # Only include methods defined in the class itself
        if method.__qualname__.startswith(cls_obj.__name__):
            method_info = extract_function_details(method, module_name)
            methods.append(method_info)
    
    return {
        "type": "class",
        "name": class_name,
        "module": module_name,
        "methods": methods
    }

package_path = config['package_path']
def list_functions_classes(py_file_path):
    if not os.path.isabs(py_file_path):
        raise ValueError(f"Please provide an absolute path, '{py_file_path}' is not absolute.")
    print('py_file_path', py_file_path, 'package_path', package_path)
    if os.path.commonpath([py_file_path, package_path]) == package_path:
        package_rel_path = os.path.relpath(py_file_path, package_path)
    else:
        root_dir = get_root_dir()
        package_rel_path = os.path.relpath(py_file_path, root_dir)
    # Get the module name by replacing path separators with dots and removing the file extension
    module_name = package_rel_path.replace(os.sep, '.').rsplit('.', 1)[0]
    print('👾 module_name', module_name)
    # use ast to parse the module without actual importing
    details = parse_python_file(py_file_path, module_name)
    #  use importlib to parse the module
    # details = parse_module_by_import(module_name)
    return details

def parse_module_by_import(module_name):
    module = importlib.import_module(module_name)

    details = []
    for name, obj in inspect.getmembers(module):
        try: 
            if inspect.isfunction(obj) and obj.__module__ == module.__name__:
                # Handle functions
                print(f'😁 find function {name}')
                func_info = extract_function_details(obj, module.__name__)
                details.append(func_info)
            # elif inspect.isclass(obj) and obj.__module__ == module.__name__:
            #     # Handle classes
            #     class_info = extract_class_details(obj, module.__name__)
            #     details.append(class_info)
        except Exception as e:
            print(f'❌ error scanning {name}: {e}')
            print(traceback.format_exc())
            continue
    return details

def get_function_details_by_import(module_name, function_name):
    module = importlib.import_module(module_name)
    obj = getattr(module, function_name)
    return extract_function_details(obj, module_name)

def refresh_node_def(graph: dict):
    nodes = graph.get('nodes')
    for node in nodes:
        try:
            module_name = node.get('data', {}).get('module')
            name = node.get('data', {}).get('name')
            if module_name and name:
                node_def = get_function_details_by_ast(module_name, name)
                if isinstance(node_def, dict):
                    node['data'] = node_def
                else:
                    node['data']['import_error'] = 'function not found'
        except Exception as e:
            print(f'❌ error refreshing node def for {module_name} {name}: {e}')
            print(traceback.format_exc())
            node['data']['import_error'] = str(e)
    return graph

def scan_directory(directory, ignore=None):
    if ignore is None:
        ignore = config.get('ignore', [])
    print('🗂️ finding python files in', directory)
    if not os.path.isdir(directory):
        raise ValueError(f"Please provide an absolute path, '{directory}' is not absolute.")
    
    children = []
    root_dir = get_root_dir()
    # Use os.listdir to avoid recursion
    for file in os.listdir(directory):
        full_path = os.path.join(directory, file)
        if file.startswith('.') or file in ignore:
            continue
        if file.endswith('.py'):
            print(f'📄 find python file {file}')
            try:
                functions = list_functions_classes(full_path)
                children.append({
                    "type": "file",
                    "name": file,
                    "path": os.path.relpath(full_path, root_dir),
                    "functions": functions
                })
            except Exception as e:
                print(f'❌ error scanning {file}: {e}')
                print(traceback.format_exc())
                continue
     
        if os.path.isdir(full_path):
            children.append({
                "type": "folder",
                "path": os.path.relpath(full_path, root_dir),
                "name": file,
            })
    
    return children

project_root = os.path.dirname(os.path.dirname(__file__))
def scan_directories(directories, ignore=None):
    if ignore is None:
        ignore = config['ignore']

    all_modules_info = {}
    for path in directories:
        # path can be relative or absolute
        abs_path = os.path.join(project_root, path)
        print(f"🗂️ Scanning directory: {abs_path}")
        modules_info = scan_directory(abs_path, ignore=ignore)
        all_modules_info.update(modules_info)
    return all_modules_info

if __name__ == "__main__":
    print("Scanning modules...")
    base_directories = ["web"] 
    blacklist = ["*/install.py"]  # Add more patterns as needed
    start_time = time.time()
    modules_info = scan_directories(base_directories, blacklist=blacklist)
    print(json.dumps(modules_info, indent=2))
    # print(f"Scanning complete in {time.time() - start_time:.2f} seconds")
