from app.agents.base import BaseAgent
from app.graph.state import AgentState, TaskResult
from app.prompts.templates import CODER_SYSTEM_PROMPT


class CoderAgent(BaseAgent):
    """Code Generation Agent

    Responsibilities:
    - Generate code based on design
    - Create function implementations
    - Update node data with implementation details
    """

    def __init__(self):
        super().__init__(name="coder", role="Software Developer")

    def get_system_prompt(self) -> str:
        return CODER_SYSTEM_PROMPT

    def _apply_response(self, state: AgentState, response: str) -> AgentState:
        """Parse Coder response and update state"""

        # Add response as message
        state = self._add_message(state, response)

        # Update current agent
        state["current_agent"] = "coder"

        # Extract code artifacts from response
        code_artifacts = self._extract_code_blocks(response)

        # Add task result
        task_result = TaskResult(
            agent="coder",
            status="completed",
            output=response[:500],
            artifacts=code_artifacts,
        )
        state["task_results"] = state.get("task_results", []) + [task_result]

        # Move to QA stage
        state["workflow_stage"] = "qa"

        return state

    def _extract_code_blocks(self, response: str) -> list:
        """Extract code blocks from response"""
        import re

        artifacts = []

        # Find code blocks (```language ... ```)
        code_pattern = r"```(\w+)?\n(.*?)```"
        matches = re.findall(code_pattern, response, re.DOTALL)

        for i, (language, code) in enumerate(matches):
            artifacts.append(
                {
                    "type": "code",
                    "language": language or "text",
                    "content": code.strip(),
                    "index": i,
                }
            )

        return artifacts
