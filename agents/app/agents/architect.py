from app.agents.base import BaseAgent
from app.graph.state import AgentState, TaskResult, NodeOperation
from app.prompts.templates import ARCHITECT_SYSTEM_PROMPT
import json
import re


class ArchitectAgent(BaseAgent):
    """System Architecture and Design Agent

    Responsibilities:
    - Design system architecture
    - Create action flow diagrams (node structure)
    - Analyze data dependencies
    - Output node definitions and edge connections
    """

    def __init__(self):
        super().__init__(name="architect", role="System Architect")

    def get_system_prompt(self) -> str:
        return ARCHITECT_SYSTEM_PROMPT

    def _apply_response(self, state: AgentState, response: str) -> AgentState:
        """Parse Architect response and update state"""

        # Add response as message
        state = self._add_message(state, response)

        # Update current agent
        state["current_agent"] = "architect"

        # Add task result
        task_result = TaskResult(
            agent="architect", status="completed", output=response[:500], artifacts=[]
        )
        state["task_results"] = state.get("task_results", []) + [task_result]

        # Parse node operations from response
        node_ops = self._parse_node_operations(response)
        if node_ops:
            state["node_operations"] = state.get("node_operations", []) + node_ops

        # Move to next stage (coding)
        state["workflow_stage"] = "coding"

        return state

    def _parse_node_operations(self, response: str) -> list:
        """Parse node operations from architect response"""
        operations = []

        # Look for node definitions in the response
        # Pattern: 노드: [이름] or Node: [name]
        node_pattern = r"(?:노드|Node)[:\s]+([^\n,]+)"
        matches = re.findall(node_pattern, response, re.IGNORECASE)

        for i, match in enumerate(matches[:10]):  # Limit to 10 nodes
            node_label = match.strip()
            if node_label:
                # Determine node type based on keywords
                node_type = "action"
                if any(
                    word in node_label.lower()
                    for word in ["데이터", "db", "테이블", "저장"]
                ):
                    node_type = "data"
                elif any(
                    word in node_label.lower()
                    for word in ["함수", "처리", "검증", "api"]
                ):
                    node_type = "function"

                operations.append(
                    NodeOperation(
                        operation="create",
                        node_type=node_type,
                        label=node_label,
                        data={"created_by": "architect", "order": i},
                    )
                )

        return operations
