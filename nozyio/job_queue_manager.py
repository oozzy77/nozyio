import asyncio
from nozyio.ast_execution import execute_graph
import concurrent.futures
from concurrent.futures import ProcessPoolExecutor

executor = concurrent.futures.ThreadPoolExecutor(max_workers=6)  # Adjust the number of workers as needed

async def run_in_executor(func, *args):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, func, *args)

async def process_queue(app):
    task_queue = app['task_queue']
    while True:
        task = await task_queue.get()
        try:
            await run_in_executor(execute_graph, task)
        finally:
            task_queue.task_done()


async def on_cleanup(app):
    # Cancel the process_queue task
    process_queue_task = app.get('process_queue_task')
    if process_queue_task:
        process_queue_task.cancel()
        try:
            await process_queue_task
        except asyncio.CancelledError:
            pass
