from app.agents.base import BaseAgent
from app.graph.state import AgentState, TaskResult
from app.prompts.templates import QA_SYSTEM_PROMPT


class QAAgent(BaseAgent):
    """Quality Assurance Agent

    Responsibilities:
    - Validate implementations
    - Check for logical errors
    - Test edge cases
    - Report bugs and issues
    """

    def __init__(self):
        super().__init__(name="qa", role="QA Engineer")

    def get_system_prompt(self) -> str:
        return QA_SYSTEM_PROMPT

    def _apply_response(self, state: AgentState, response: str) -> AgentState:
        """Parse QA response and update state"""

        # Add response as message
        state = self._add_message(state, response)

        # Update current agent
        state["current_agent"] = "qa"

        # Analyze QA results
        has_issues = self._check_for_issues(response)

        # Add task result
        task_result = TaskResult(
            agent="qa",
            status="completed" if not has_issues else "failed",
            output=response[:500],
            artifacts=self._extract_issues(response),
        )
        state["task_results"] = state.get("task_results", []) + [task_result]

        # Determine next stage based on QA results
        if has_issues:
            # Go back to coding for fixes
            state["workflow_stage"] = "coding"
        else:
            # QA passed, complete the workflow
            state["workflow_stage"] = "complete"

        return state

    def _check_for_issues(self, response: str) -> bool:
        """Check if QA found any issues"""
        response_lower = response.lower()

        # Look for issue indicators
        issue_keywords = [
            "버그",
            "오류",
            "에러",
            "문제",
            "수정 필요",
            "bug",
            "error",
            "issue",
            "fix",
        ]
        pass_keywords = [
            "통과",
            "성공",
            "완료",
            "문제 없",
            "pass",
            "success",
            "approved",
        ]

        has_issues = any(keyword in response_lower for keyword in issue_keywords)
        is_passed = any(keyword in response_lower for keyword in pass_keywords)

        # If explicitly passed, no issues
        if is_passed and not has_issues:
            return False

        return has_issues

    def _extract_issues(self, response: str) -> list:
        """Extract issues from QA response"""
        import re

        issues = []
        lines = response.split("\n")

        for line in lines:
            line = line.strip()
            # Look for issue patterns
            if any(
                keyword in line.lower()
                for keyword in ["버그:", "오류:", "issue:", "bug:", "문제:"]
            ):
                issues.append(
                    {"type": "issue", "description": line, "severity": "medium"}
                )

        return issues
