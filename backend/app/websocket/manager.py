from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""

    def __init__(self):
        # Map of project_id -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)

    def disconnect(self, websocket: WebSocket, project_id: str):
        """Remove a WebSocket connection"""
        if project_id in self.active_connections:
            if websocket in self.active_connections[project_id]:
                self.active_connections[project_id].remove(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]

    async def broadcast(self, project_id: str, data: dict):
        """Broadcast a message to all connections in a project"""
        if project_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[project_id]:
                try:
                    await connection.send_json(data)
                except:
                    dead_connections.append(connection)

            # Clean up dead connections
            for dead in dead_connections:
                self.disconnect(dead, project_id)

    async def send_personal(self, websocket: WebSocket, data: dict):
        """Send a message to a specific connection"""
        try:
            await websocket.send_json(data)
        except:
            pass

    async def broadcast_node_update(self, project_id: str, node_id: str, status: str):
        """Broadcast a node status update"""
        await self.broadcast(
            project_id, {"type": "node_update", "node_id": node_id, "status": status}
        )

    async def broadcast_agent_status(
        self, project_id: str, agent_type: str, status: str
    ):
        """Broadcast an agent status update"""
        await self.broadcast(
            project_id,
            {"type": "agent_status", "agent_type": agent_type, "status": status},
        )

    async def broadcast_chat_message(self, project_id: str, message: dict):
        """Broadcast a new chat message"""
        await self.broadcast(project_id, {"type": "chat_message", "message": message})
