from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.services.supabase_service import supabase_service
from app.services.agent_bridge import AgentBridge
from app.models.chat import ChatMessageCreate, ChatMessageResponse

router = APIRouter()
agent_bridge = AgentBridge()


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(message: ChatMessageCreate):
    """Send a message to the PM agent and get a response"""
    try:
        # Save user message
        await supabase_service.create_chat_message(message)

        # Get response from agent
        response = await agent_bridge.process_message(
            project_id=str(message.project_id), user_message=message.content
        )

        # Save agent response
        agent_message = ChatMessageCreate(
            project_id=message.project_id,
            role="assistant",
            content=response["content"],
            agent_type=response.get("agent_type", "pm"),
        )
        saved_response = await supabase_service.create_chat_message(agent_message)

        return saved_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{project_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(project_id: UUID, limit: int = 50):
    """Get chat history for a project"""
    try:
        result = await supabase_service.get_chat_history(str(project_id), limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
