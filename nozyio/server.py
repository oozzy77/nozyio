import asyncio
import json
import sys
import tempfile
from aiohttp import web
import os
from .code_to_graph import code_to_graph
from .ast_execution import execute_graph, graph_to_code
from .file_picker import list_files
from .scan_modules import refresh_node_def, scan_directory
from .config_utils import config, get_root_dir
from .search_codebase import search_codebase
from .websocket_manager import websocket_manager
from .job_queue_manager import on_cleanup, process_queue, run_in_executor

WEB_PATH = os.path.join(os.path.dirname(__file__), 'web/dist')

def endpoint(path, method='GET'):
    def decorator(func):
        func.route_info = {'path': path, 'methods': [method]}
        return func
    return decorator

@endpoint('/queue_status')
async def handle_queue_status(request):
    task_queue = request.app['task_queue']
    return web.json_response({
        'queue_size': task_queue.qsize(),
        'tasks_pending': not task_queue.empty()
    })

@endpoint('/get_os_sep')
async def handle_get_os_sep(request):
    return web.Response(text=os.sep)

@endpoint('/code_to_graph')
async def handle_code_to_graph(request):
    rel_path = request.rel_url.query['path']
    abs_path = os.path.join(config['package_path'], rel_path)
    return web.json_response(code_to_graph(abs_path))

@endpoint('/queue_job', method='POST')
async def handle_queue_job(request):
    body = await request.json()
    task_queue = request.app['task_queue']
    await task_queue.put(body)  # Add the task to the queue
    print('Job queued')
    return web.json_response({'status': 'queued'})

@endpoint('/run_job', method='POST')
async def handle_run_job(request):
    body = await request.json()
    # await run_in_executor(execute_graph, body)
    await asyncio.to_thread(execute_graph, body)
    return web.json_response({'status': 'ok'})

@endpoint('/list_package_children')
async def handle_scan_directories(request):
    rel_path = request.rel_url.query['path']
    blacklist = config.get('blacklist', [])
    abs_path = os.path.join(get_root_dir(), rel_path)
    children = scan_directory(abs_path)
    return web.json_response(children)

@endpoint('/preview_image')
async def handle_preview_image(request):
    path = request.rel_url.query['path']
    download = request.rel_url.query.get('download', False)
    abs_path = os.path.join(get_root_dir(), path)

    if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
        return web.Response(status=404, text="Image not found")

    with open(abs_path, 'rb') as image_file:
        image_data = image_file.read()
    if download:
        return web.Response(
        body=image_data, 
        content_type='image/jpeg',
        headers={
            'Content-Disposition': f'attachment; filename="{os.path.basename(abs_path)}"'
        })
    else:
        return web.Response(body=image_data, content_type='image/jpeg')  # Adjust content_type as needed


@endpoint('/file_picker/list_files', method='POST')
async def handle_list_files(request):
    body = await request.json()
    path = body['path']
    extensions = body.get('extensions', None)
    abs_path = os.path.join(get_root_dir(), path)
    children = list_files(abs_path, extensions)
    return web.json_response({
        'path': abs_path,
        'items': children
    })

@endpoint('/graph_to_code', method='POST')
async def handle_graph_to_code(request):
    graph = await request.json()
    code = graph_to_code(graph)
    return web.json_response(code)

@endpoint('/ws')
async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    print('WebSocket connection established')
    await websocket_manager.set_connection(ws)


    async for msg in ws:
        if msg.type == web.WSMsgType.TEXT:
            # Handle incoming messages if needed
            print(f"Received message: {msg.data}")
            await websocket_manager.send_message(f"Echo: {msg.data}")
        elif msg.type == web.WSMsgType.ERROR:
            print(f"WebSocket connection closed with exception {ws.exception()}")

    return ws

@endpoint('/search_functions')
async def handle_search_functions(request):
    query = request.rel_url.query['query']
    results = await asyncio.to_thread(search_codebase, query)
    return web.json_response(results)

@endpoint('/refresh_node_def', method='POST')
async def handle_refresh_node_def(request):
    graph = await request.json()
    new_graph = refresh_node_def(graph)
    return web.json_response(new_graph)

@endpoint('/')
async def handle_index(request):
    print('handle_index')
    if os.path.exists(os.path.join(WEB_PATH, 'index.html')):
        print('index.html exists')
        return web.FileResponse(os.path.join(WEB_PATH, 'index.html'))
    else:
        print(f'{os.path.join(WEB_PATH, "index.html")} does not exist')
        return web.Response(status=404)

# Middleware to handle CORS
@web.middleware
async def cors_middleware(request, handler):
    if request.method == 'OPTIONS':
        # Handle preflight CORS requests
        response = web.Response(status=204)
    else:
        response = await handler(request)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

async def on_startup(app):
    app['task_queue'] = asyncio.Queue()
    # Start the background task to process the queue
    app['process_queue_task'] = asyncio.create_task(process_queue(app))
    websocket_manager.loop = asyncio.get_running_loop()
    
def start_server():
    allow_cors = '--allow-cors' in sys.argv
    port = int(sys.argv[sys.argv.index('--port') + 1]) if '--port' in sys.argv else 7070
    listen = '--listen' in sys.argv
    host = '0.0.0.0' if listen else '127.0.0.1'

    if allow_cors:
        print('🧪allow cors=', allow_cors)
    app = web.Application(middlewares=[cors_middleware] if allow_cors else [])
    temp_dir = tempfile.gettempdir()
    print("System's temporary directory:", temp_dir)
    # Register routes using the endpoint decorator
    for name, func in globals().items():
        if callable(func) and hasattr(func, 'route_info'):
            route_info = func.route_info
            for method in route_info['methods']:
                app.router.add_route(method, route_info['path'], func)
    
    if os.path.exists(WEB_PATH):
        app.router.add_static('/', WEB_PATH, show_index=True)
    
    app.on_startup.append(on_startup)
    # app.on_cleanup.append(on_cleanup)
    
    # add the current directory to the python path
    sys.path.append(os.getcwd())

    # print('python search path', sys.path)
    web.run_app(app, host=host, port=port)

if __name__ == "__main__":
    print("Starting aiohttp server...")
    start_server()
