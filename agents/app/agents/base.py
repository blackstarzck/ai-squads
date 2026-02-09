from abc import ABC, abstractmethod
from typing import Dict, Any
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from app.graph.state import AgentState, Message
from app.config import get_llm


class BaseAgent(ABC):
    """Base class for all agents"""

    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.llm = get_llm()

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the system prompt for this agent"""
        pass

    def process(self, state: AgentState) -> AgentState:
        """Process the current state and return updated state"""
        # Build messages for LLM
        messages = self._build_messages(state)

        # Get response from LLM
        response = self.llm.invoke(messages)

        # Parse and apply response
        return self._apply_response(state, response.content)

    def _build_messages(self, state: AgentState) -> list:
        """Build message list for LLM from state"""
        messages = [SystemMessage(content=self.get_system_prompt())]

        # Add conversation history
        for msg in state.get("messages", []):
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))

        # Add current request context
        context = self._build_context(state)
        if context:
            messages.append(HumanMessage(content=context))

        return messages

    def _build_context(self, state: AgentState) -> str:
        """Build context string from state"""
        parts = []

        if state.get("user_request"):
            parts.append(f"사용자 요청: {state['user_request']}")

        if state.get("task_results"):
            parts.append("\n이전 작업 결과:")
            for result in state["task_results"]:
                parts.append(f"- {result.agent}: {result.status}")
                if result.output:
                    parts.append(f"  출력: {result.output[:200]}...")

        return "\n".join(parts)

    @abstractmethod
    def _apply_response(self, state: AgentState, response: str) -> AgentState:
        """Apply LLM response to state"""
        pass

    def _add_message(self, state: AgentState, content: str) -> AgentState:
        """Add a message from this agent to state"""
        new_message = Message(role="assistant", content=content, agent_type=self.name)
        state["messages"] = state.get("messages", []) + [new_message]
        return state
