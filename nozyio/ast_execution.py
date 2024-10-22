import importlib
import os
import tempfile
import traceback
from nozyio.config_utils import config
import sys
from nozyio.code_to_graph import json_dict_to_code
from nozyio.utils import get_temp_dir, is_serializable
from nozyio.websocket_manager import websocket_manager
from PIL import Image

def get_handle_uid(io_type, node_id, handle_id):
    return 'node_' + node_id + '_' + io_type + '_' + handle_id

def traverse_ast_tree_and_replace(ast_node, handle_connection_map, node_id, values):
    if not isinstance(ast_node, dict):
        return ast_node
    io_type = ast_node.get('io_type')
    if io_type == 'output':
        var_id = get_handle_uid('output', node_id, ast_node.get('id'))
        return {
            "node_type": "Name",
            "id": var_id,
            "ctx": {
                "node_type": "Store"
            }
        }
    elif io_type == 'input':
        var_id = get_handle_uid('input', node_id, ast_node.get('id'))
        if var_id in handle_connection_map:
            return {
                "node_type": "Name",
                "id": handle_connection_map[var_id],
                "ctx": {
                    "node_type": "Load"
                }
            }
        elif var_id in values and values[var_id] is not None:
            return {
                "node_type": "Constant",
                "value": values[var_id],
                "kind": None
            }
        elif ast_node.get('optional'):
            print('🔥 ast_node.get("optional")', ast_node.get('optional'))
            return {
                "node_type": "Constant",
                "value": None,
                "kind": None
            }
        else:
            return {
                "node_type": "Constant",
                "value": None,
                "kind": None
            }
            # raise Exception(f'❌No value provided for required input "{ast_node.get("name") or ast_node.get("id") }" in node #{node_id}. Please provide a value for this input.')

    # Iterate over all fields in the node
    for key, value in ast_node.items():
        if isinstance(value, dict):
            if replace_value := traverse_ast_tree_and_replace(value, handle_connection_map, node_id, values):
                ast_node[key] = replace_value
        elif isinstance(value, list):
            # If the field is a list, check each item
            for index, item in enumerate(value):
                if isinstance(item, dict):
                    if replace_value := traverse_ast_tree_and_replace(item, handle_connection_map, node_id, values):
                        value[index] = replace_value
    
    return ast_node

def send_job_status(message: dict):
    websocket_manager.send_message_sync({
        'type': 'job_status',
        'data': message
    })

def graph_to_code(graph: dict):
    order, handle_connection_map = get_execution_order(graph)
    ast_nodes_aggr = []
    for node in order:
        ast_nodes = transform_ast_nodes(node, handle_connection_map, graph.get('values', {}))
        ast_nodes_aggr.extend(ast_nodes)
    code = json_dict_to_code({
        "node_type": "Module",
        "body": ast_nodes_aggr,
        "type_ignores": []
    })
    print('💻', code)
    return code

def get_execution_order(graph: dict):
    handle_connection_map = {}
    node_connection_map = {}
    nodes_dict = {}
    nodes = graph['nodes']
    for node in nodes:
        nodes_dict[node['id']] = node
    for edge in graph['edges']:
        # fill in handle connection map
        out_var_id = get_handle_uid('output', edge['source'], edge['sourceHandle'])
        in_var_id = get_handle_uid('input', edge['target'], edge['targetHandle'])
        handle_connection_map[out_var_id] = out_var_id
        handle_connection_map[in_var_id] = out_var_id
        # fill in node connection map
        if edge['target'] not in node_connection_map:
            node_connection_map[edge['target']] = []
        node_connection_map[edge['target']].append(nodes_dict[edge['source']])

    order = topological_sort(nodes, node_connection_map, set())
    return order, handle_connection_map

def execute_graph(graph: dict, local_vars = {}):
    order, handle_connection_map = get_execution_order(graph)
    job_nodes = {}
    graph['job_status'] = {'status': 'RUNNING', 'nodes': job_nodes}
    try:
        node_outputs = []
        for node in order:
            job_nodes[node['id']] = {'status': 'RUNNING', 'results': []}
            send_job_status(graph['job_status'])
            execute_node_ast(node, handle_connection_map, local_vars, graph.get('values', {}))
            # after execution, get the outputs
            outputs = node.get('data', {}).get('output', [])
            node_outputs = []
            for output in outputs:
                var_id = get_handle_uid('output', node['id'], output.get('id'))
                res = local_vars.get(var_id, None)
                print(f'👉{var_id}=', res)

                # Check if res is a PIL Image
                if isinstance(res, Image.Image):
                    temp_dir = get_temp_dir()
                    with tempfile.NamedTemporaryFile(dir=temp_dir, delete=False, suffix='.png') as temp_file:
                        res.save(temp_file.name)
                        temp_path = temp_file.name
                    job_nodes[node['id']]['results'].append(temp_path)
                else:
                    try:
                        job_nodes[node['id']]['results'].append(res if is_serializable(res) else f'<{type(res).__name__}>')
                    except:
                        job_nodes[node['id']]['results'].append('<object>')
                node_outputs.append(res)
            job_nodes[node['id']]['status'] = 'SUCCESS'
            send_job_status(graph['job_status'])
        graph['job_status']['status'] = 'SUCCESS'
        return tuple(node_outputs)
    except Exception as e:
        print('❌ error executing job', e)
        print(traceback.format_exc())
        job_nodes[node['id']]['status'] = 'FAIL'
        # job_nodes[node['id']]['error'] = str(e) + '\n' + traceback.format_exc()
        job_nodes[node['id']]['error'] = str(e)
        graph['job_status']['status'] = 'FAIL'
        send_job_status(graph['job_status'])

def topological_sort(nodes, node_connection_map:dict, visited:set):
    def dfs(node, node_connection_map:dict, visited:set, order:list):
        if node['id'] in visited:
            return
        visited.add(node['id'])
        for source_node in node_connection_map.get(node['id'], []):
            dfs(source_node, node_connection_map, visited, order)
        order.append(node)
    order = []
    for node in nodes:
        dfs(node, node_connection_map, visited, order)
    return order

def transform_ast_nodes(node, handle_connection_map, values) -> list:
    node_data = node.get('data', {})
    if not node_data.get('module') or not node_data.get('name'):
        return
    ast_nodes = node.get('data', {}).get('astNodes', [])
    for ast_node in ast_nodes:
        # traverse ast tree and replace the input_change_map with the actual value
        traverse_ast_tree_and_replace(ast_node, handle_connection_map, node['id'], values)
    return ast_nodes

# compile to AST to code string literal to execute node
def execute_node_ast(node, handle_connection_map, local_vars, values):
    ast_nodes = transform_ast_nodes(node, handle_connection_map, values)

    code = json_dict_to_code({
        "node_type": "Module",
        "body": ast_nodes,
        "type_ignores": []
    })
    print('⏩Executing⏩ \n', code)
    exec(code,  globals(), local_vars)
        
    return local_vars

# native way to call function, no compile to AST exec()
def execute_node(node, handle_connection_map, local_vars, values):
    module = node.get('data', {}).get('module')
    name = node.get('data', {}).get('name')
    if not module or not name:
        return local_vars
    module = importlib.import_module(module)
    func = getattr(module, name)
    inputs = node.get('data', {}).get('input', [])
    args = []
    for input in inputs:
        varid = get_handle_uid('input', node['id'], input.get('id'))
        if varid in handle_connection_map:
            source_varid = handle_connection_map[varid]
            args.append(local_vars[source_varid])
        elif varid in values:
            args.append(values[varid])
        else:
            args.append(None)
        print('👉', varid, args[-1])
    outputs = node.get('data', {}).get('output', [])
    outputs_uid = [get_handle_uid('output', node['id'], output.get('id')) for output in outputs]
    res = func(*args)
    if not isinstance(res, tuple):
        res = (res,)  # Convert single value to tuple
    for index, varid in enumerate(outputs_uid):
        local_vars[varid] = res[index]


if __name__ == '__main__':
    sys.path.append(config['package_path'])
    test_graph = {}
    execute_graph(test_graph)
