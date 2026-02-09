from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.graph.state import AgentState, Message
from app.graph.workflow import compile_workflow

app = FastAPI(
    title="AI-Sync OpenDev Agents",
    description="LangGraph-based multi-agent orchestration system",
    version="0.1.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compile the workflow
workflow = compile_workflow()


class ChatRequest(BaseModel):
    project_id: str
    message: str
    project_context: Optional[dict] = {}


class ChatResponse(BaseModel):
    content: str
    agent_type: str
    workflow_stage: str
    risk_score: int


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-sync-agents"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message through the agent workflow"""
    try:
        # Initialize state
        initial_state: AgentState = {
            "messages": [Message(role="user", content=request.message)],
            "current_agent": "sisyphus",
            "task_queue": [],
            "task_results": [],
            "workflow_stage": "planning",
            "project_context": request.project_context,
            "risk_score": 0,
            "node_operations": [],
            "user_request": request.message,
            "final_response": None,
        }

        # Run the workflow
        final_state = workflow.invoke(initial_state)

        # Extract response
        last_message = final_state["messages"][-1] if final_state["messages"] else None

        return ChatResponse(
            content=last_message.content
            if last_message
            else "처리 중 오류가 발생했습니다.",
            agent_type=last_message.agent_type if last_message else "pm",
            workflow_stage=final_state.get("workflow_stage", "idle"),
            risk_score=final_state.get("risk_score", 0),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/workflow/run")
async def run_full_workflow(request: ChatRequest):
    """Run the full workflow and return all results"""
    try:
        initial_state: AgentState = {
            "messages": [Message(role="user", content=request.message)],
            "current_agent": "sisyphus",
            "task_queue": [],
            "task_results": [],
            "workflow_stage": "planning",
            "project_context": request.project_context,
            "risk_score": 0,
            "node_operations": [],
            "user_request": request.message,
            "final_response": None,
        }

        # Run the workflow
        final_state = workflow.invoke(initial_state)

        return {
            "messages": [msg.model_dump() for msg in final_state["messages"]],
            "workflow_stage": final_state["workflow_stage"],
            "task_results": [tr.model_dump() for tr in final_state["task_results"]],
            "node_operations": [
                op.model_dump() for op in final_state.get("node_operations", [])
            ],
            "risk_score": final_state["risk_score"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
