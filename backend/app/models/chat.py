from pydantic import BaseModel
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime


class ChatMessageBase(BaseModel):
    project_id: UUID
    role: Literal["user", "assistant", "system"]
    content: str
    agent_type: Optional[str] = None


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageResponse(ChatMessageBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
