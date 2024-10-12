import asyncio
from aiohttp.web import WebSocketResponse
from typing import Dict

class WebSocketManager:
    def __init__(self):
        self.connections: Dict[str, WebSocketResponse] = {}  # Dictionary to store user_id: websocket pairs

    async def set_connection(self, ws, user_id='default'):
        self.connections[user_id] = ws

    async def send_message(self, message, user_id='default'):
        ws = self.connections.get(user_id)
        if ws is None or ws.closed:
            print(f"WebSocket for user {user_id} is not connected or is closed.")
            return
        await ws.send_json(message)
        # print(f"Sent message to user {user_id}: {message}")

    def send_message_sync(self, message, user_id='default'):
        future = asyncio.run_coroutine_threadsafe(
            self.send_message(message, user_id),
            self.loop  # Use the stored loop
        )

# Create a global instance of the WebSocketManager
websocket_manager = WebSocketManager()