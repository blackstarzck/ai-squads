from app.agents.base import BaseAgent
from app.graph.state import AgentState, Message, TaskResult
from app.prompts.templates import SISYPHUS_SYSTEM_PROMPT
import json
import re


class SisyphusAgent(BaseAgent):
    """PM Orchestrator Agent - Sisyphus

    Responsibilities:
    - Analyze user requirements
    - Break down tasks for other agents
    - Route work to appropriate agents
    - Monitor progress and quality gates
    - Report status in user-friendly language
    """

    def __init__(self):
        super().__init__(name="pm", role="Project Manager")

    def get_system_prompt(self) -> str:
        return SISYPHUS_SYSTEM_PROMPT

    def _apply_response(self, state: AgentState, response: str) -> AgentState:
        """Parse Sisyphus response and update state"""

        # Add response as message
        state = self._add_message(state, response)

        # Parse the response to determine next action
        next_stage = self._parse_next_stage(response)

        # Update workflow stage
        if next_stage:
            state["workflow_stage"] = next_stage

        # Update current agent
        state["current_agent"] = "sisyphus"

        # If stage is complete, set final response
        if next_stage == "complete":
            state["final_response"] = response

        # Parse any task assignments
        tasks = self._parse_tasks(response)
        if tasks:
            state["task_queue"] = state.get("task_queue", []) + tasks

        return state

    def _parse_next_stage(self, response: str) -> str:
        """Parse the response to determine next workflow stage"""
        response_lower = response.lower()

        # Look for stage indicators in response
        if any(
            word in response_lower
            for word in ["설계를 시작", "architect", "설계 단계", "설계로 넘어"]
        ):
            return "design"
        elif any(
            word in response_lower
            for word in ["코딩을 시작", "coder", "개발 단계", "코딩으로"]
        ):
            return "coding"
        elif any(
            word in response_lower
            for word in ["qa를 시작", "테스트", "검증 단계", "qa로"]
        ):
            return "qa"
        elif any(word in response_lower for word in ["완료", "complete", "배포 준비"]):
            return "complete"
        elif any(
            word in response_lower for word in ["추가 정보", "질문", "확인이 필요"]
        ):
            return "idle"  # Wait for more user input

        return "idle"

    def _parse_tasks(self, response: str) -> list:
        """Parse tasks from response"""
        tasks = []

        # Simple task extraction - look for bullet points or numbered items
        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if (
                line.startswith("- ")
                or line.startswith("* ")
                or re.match(r"^\d+\.", line)
            ):
                task_content = re.sub(r"^[-*\d.]+\s*", "", line)
                if task_content and len(task_content) > 5:
                    tasks.append(
                        {
                            "description": task_content,
                            "status": "pending",
                            "assigned_to": None,
                        }
                    )

        return tasks[:5]  # Limit to 5 tasks
