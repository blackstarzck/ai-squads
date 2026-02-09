from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    risk_score: Optional[int] = None


class ProjectResponse(ProjectBase):
    id: UUID
    version: str
    risk_score: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
