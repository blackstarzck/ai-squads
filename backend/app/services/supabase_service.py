from supabase import create_client, Client
from typing import List, Optional, Dict, Any
import asyncio

from app.config import settings
from app.models.project import ProjectCreate, ProjectUpdate
from app.models.node import NodeCreate, NodeUpdate, EdgeCreate
from app.models.chat import ChatMessageCreate


class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY
        )

    # Project operations
    async def create_project(self, project: ProjectCreate) -> Dict[str, Any]:
        result = (
            self.client.table("projects")
            .insert({"name": project.name, "description": project.description})
            .execute()
        )
        return result.data[0] if result.data else None

    async def list_projects(self) -> List[Dict[str, Any]]:
        result = (
            self.client.table("projects")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return result.data

    async def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        result = (
            self.client.table("projects").select("*").eq("id", project_id).execute()
        )
        return result.data[0] if result.data else None

    async def update_project(
        self, project_id: str, project: ProjectUpdate
    ) -> Optional[Dict[str, Any]]:
        update_data = {k: v for k, v in project.model_dump().items() if v is not None}
        if not update_data:
            return await self.get_project(project_id)
        result = (
            self.client.table("projects")
            .update(update_data)
            .eq("id", project_id)
            .execute()
        )
        return result.data[0] if result.data else None

    async def delete_project(self, project_id: str) -> None:
        self.client.table("projects").delete().eq("id", project_id).execute()

    # Node operations
    async def create_node(self, node: NodeCreate) -> Dict[str, Any]:
        result = (
            self.client.table("nodes")
            .insert(
                {
                    "project_id": str(node.project_id),
                    "type": node.type.value,
                    "label": node.label,
                    "position_x": node.position_x,
                    "position_y": node.position_y,
                    "data": node.data,
                }
            )
            .execute()
        )
        return result.data[0] if result.data else None

    async def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        result = self.client.table("nodes").select("*").eq("id", node_id).execute()
        return result.data[0] if result.data else None

    async def get_nodes_by_project(self, project_id: str) -> List[Dict[str, Any]]:
        result = (
            self.client.table("nodes")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )
        return result.data

    async def update_node(
        self, node_id: str, node: NodeUpdate
    ) -> Optional[Dict[str, Any]]:
        update_data = {}
        if node.label is not None:
            update_data["label"] = node.label
        if node.position_x is not None:
            update_data["position_x"] = node.position_x
        if node.position_y is not None:
            update_data["position_y"] = node.position_y
        if node.data is not None:
            update_data["data"] = node.data
        if node.status is not None:
            update_data["status"] = node.status.value

        if not update_data:
            return await self.get_node(node_id)

        result = (
            self.client.table("nodes").update(update_data).eq("id", node_id).execute()
        )
        return result.data[0] if result.data else None

    async def delete_node(self, node_id: str) -> None:
        self.client.table("nodes").delete().eq("id", node_id).execute()

    # Edge operations
    async def create_edge(self, edge: EdgeCreate) -> Dict[str, Any]:
        result = (
            self.client.table("edges")
            .insert(
                {
                    "project_id": str(edge.project_id),
                    "source_id": str(edge.source_id),
                    "target_id": str(edge.target_id),
                    "label": edge.label,
                }
            )
            .execute()
        )
        return result.data[0] if result.data else None

    async def get_edges_by_project(self, project_id: str) -> List[Dict[str, Any]]:
        result = (
            self.client.table("edges")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )
        return result.data

    async def delete_edge(self, edge_id: str) -> None:
        self.client.table("edges").delete().eq("id", edge_id).execute()

    # Chat operations
    async def create_chat_message(self, message: ChatMessageCreate) -> Dict[str, Any]:
        result = (
            self.client.table("chat_messages")
            .insert(
                {
                    "project_id": str(message.project_id),
                    "role": message.role,
                    "content": message.content,
                    "agent_type": message.agent_type,
                }
            )
            .execute()
        )
        return result.data[0] if result.data else None

    async def get_chat_history(
        self, project_id: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        result = (
            self.client.table("chat_messages")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=False)
            .limit(limit)
            .execute()
        )
        return result.data


# Singleton instance
supabase_service = SupabaseService()
