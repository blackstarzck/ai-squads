from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.services.supabase_service import supabase_service
from app.models.node import (
    NodeCreate,
    NodeUpdate,
    NodeResponse,
    EdgeCreate,
    EdgeResponse,
)

router = APIRouter()


@router.post("/", response_model=NodeResponse)
async def create_node(node: NodeCreate):
    """Create a new node"""
    try:
        result = await supabase_service.create_node(node)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{node_id}", response_model=NodeResponse)
async def get_node(node_id: UUID):
    """Get a node by ID"""
    try:
        result = await supabase_service.get_node(str(node_id))
        if not result:
            raise HTTPException(status_code=404, detail="Node not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{node_id}", response_model=NodeResponse)
async def update_node(node_id: UUID, node: NodeUpdate):
    """Update a node"""
    try:
        result = await supabase_service.update_node(str(node_id), node)
        if not result:
            raise HTTPException(status_code=404, detail="Node not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{node_id}")
async def delete_node(node_id: UUID):
    """Delete a node"""
    try:
        await supabase_service.delete_node(str(node_id))
        return {"message": "Node deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/edges", response_model=EdgeResponse)
async def create_edge(edge: EdgeCreate):
    """Create a new edge between nodes"""
    try:
        result = await supabase_service.create_edge(edge)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/edges/{edge_id}")
async def delete_edge(edge_id: UUID):
    """Delete an edge"""
    try:
        await supabase_service.delete_edge(str(edge_id))
        return {"message": "Edge deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
