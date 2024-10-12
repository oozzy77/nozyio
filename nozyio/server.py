import asyncio
import json
import sys
from aiohttp import web
import os
from nozyio.code_to_graph import code_to_graph
from nozyio.ast_execution import execute_graph, graph_to_code
from nozyio.scan_modules import refresh_node_def, scan_directory
from nozyio.config_utils import config, get_root_dir
from nozyio.websocket_manager import websocket_manager
from nozyio.job_queue_manager import on_cleanup, process_queue, run_in_executor

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
    await run_in_executor(execute_graph, body)
    return web.json_response({'status': 'ok'})

@endpoint('/list_package_children')
async def handle_scan_directories(request):
    rel_path = request.rel_url.query['path']
    blacklist = config.get('blacklist', [])
    abs_path = os.path.join(get_root_dir(), rel_path)
    children = scan_directory(abs_path)
    return web.json_response(children)

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

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                # Handle incoming messages if needed
                print(f"Received message: {msg.data}")
                await websocket_manager.send_message(f"Echo: {msg.data}")
            elif msg.type == web.WSMsgType.ERROR:
                print(f"WebSocket connection closed with exception {ws.exception()}")

    finally:
        print('WebSocket connection closed')

    return ws

@endpoint('/refresh_node_def', method='POST')
async def handle_refresh_node_def(request):
    graph = await request.json()
    new_graph = refresh_node_def(graph)
    return web.json_response(new_graph)

@endpoint('/')
async def handle_index(request):
    return web.FileResponse(os.path.join(WEB_PATH, 'index.html'))

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
    if allow_cors:
        print('🧪allow cors=', allow_cors)
    app = web.Application(middlewares=[cors_middleware] if allow_cors else [])
    
    # Register routes using the endpoint decorator
    for name, func in globals().items():
        if callable(func) and hasattr(func, 'route_info'):
            route_info = func.route_info
            for method in route_info['methods']:
                app.router.add_route(method, route_info['path'], func)
    
    if os.path.exists(WEB_PATH):
        app.router.add_static('/', WEB_PATH, show_index=True)
    
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)

    # Check for --listen argument
    if '--listen' in sys.argv:
        host = '0.0.0.0'
    else:
        host = '127.0.0.1'

    web.run_app(app, host=host, port=7070)

if __name__ == "__main__":
    print("Starting aiohttp server...")
    start_server()
