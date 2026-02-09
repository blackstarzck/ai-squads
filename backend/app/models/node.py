from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from enum import Enum


class NodeType(str, Enum):
    ACTION = "action"
    FUNCTION = "function"
    DATA = "data"


class NodeStatus(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    COMPLETED = "completed"
    ERROR = "error"


class NodeBase(BaseModel):
    project_id: UUID
    type: NodeType
    label: str
    position_x: float = 0
    position_y: float = 0
    data: Dict[str, Any] = {}


class NodeCreate(NodeBase):
    pass


class NodeUpdate(BaseModel):
    label: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    data: Optional[Dict[str, Any]] = None
    status: Optional[NodeStatus] = None


class NodeResponse(NodeBase):
    id: UUID
    status: NodeStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EdgeBase(BaseModel):
    project_id: UUID
    source_id: UUID
    target_id: UUID
    label: Optional[str] = None


class EdgeCreate(EdgeBase):
    pass


class EdgeResponse(EdgeBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
