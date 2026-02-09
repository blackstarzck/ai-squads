from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class ImpactRequest(BaseModel):
    project_id: UUID
    node_id: UUID


class ImpactResponse(BaseModel):
    node_id: UUID
    risk_score: int
    affected_nodes: List[str]
    message: str


class DependencyMapResponse(BaseModel):
    node_id: UUID
    upstream_nodes: List[str]
    downstream_nodes: List[str]
