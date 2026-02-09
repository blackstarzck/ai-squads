from typing import TypedDict, List, Optional, Literal, Annotated
from pydantic import BaseModel
import operator


class Message(BaseModel):
    """A message in the conversation"""

    role: Literal["user", "assistant", "system"]
    content: str
    agent_type: Optional[str] = None


class TaskResult(BaseModel):
    """Result from an agent's task execution"""

    agent: str
    status: Literal["pending", "in_progress", "completed", "failed"]
    output: Optional[str] = None
    artifacts: List[dict] = []


class NodeOperation(BaseModel):
    """Operation to perform on canvas nodes"""

    operation: Literal["create", "update", "delete"]
    node_type: Optional[str] = None
    node_id: Optional[str] = None
    label: Optional[str] = None
    data: dict = {}


class AgentState(TypedDict):
    """State shared between all agents in the workflow"""

    # Conversation history
    messages: Annotated[List[Message], operator.add]

    # Current active agent
    current_agent: str

    # Task management
    task_queue: List[dict]
    task_results: List[TaskResult]

    # Workflow stage
    workflow_stage: Literal["idle", "planning", "design", "coding", "qa", "complete"]

    # Project context
    project_context: dict

    # Risk assessment
    risk_score: int

    # Node operations to perform
    node_operations: List[NodeOperation]

    # User's original request
    user_request: str

    # Final response to user
    final_response: Optional[str]
