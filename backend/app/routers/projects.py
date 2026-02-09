from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID

from app.services.supabase_service import supabase_service
from app.models.project import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter()


@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    """Create a new project"""
    try:
        result = await supabase_service.create_project(project)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[ProjectResponse])
async def list_projects():
    """List all projects"""
    try:
        result = await supabase_service.list_projects()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID):
    """Get a project by ID"""
    try:
        result = await supabase_service.get_project(str(project_id))
        if not result:
            raise HTTPException(status_code=404, detail="Project not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: UUID, project: ProjectUpdate):
    """Update a project"""
    try:
        result = await supabase_service.update_project(str(project_id), project)
        if not result:
            raise HTTPException(status_code=404, detail="Project not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{project_id}")
async def delete_project(project_id: UUID):
    """Delete a project"""
    try:
        await supabase_service.delete_project(str(project_id))
        return {"message": "Project deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/nodes")
async def get_project_nodes(project_id: UUID):
    """Get all nodes for a project"""
    try:
        result = await supabase_service.get_nodes_by_project(str(project_id))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/edges")
async def get_project_edges(project_id: UUID):
    """Get all edges for a project"""
    try:
        result = await supabase_service.get_edges_by_project(str(project_id))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
