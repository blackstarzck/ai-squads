from typing import Dict, Any
import httpx
import os


class AgentBridge:
    """Bridge to communicate with LangGraph agents"""

    def __init__(self):
        self.agents_url = os.getenv("AGENTS_URL", "http://localhost:8001")

    async def process_message(
        self, project_id: str, user_message: str
    ) -> Dict[str, Any]:
        """
        Send a message to the PM agent and get a response.

        For now, this returns a mock response.
        In production, this would call the LangGraph agents service.
        """
        # TODO: Replace with actual LangGraph agent call
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.agents_url}/api/chat",
                    json={"project_id": project_id, "message": user_message},
                    timeout=60.0,
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            # Fallback to mock response if agents service is not available
            pass

        # Mock response for development
        return self._generate_mock_response(user_message)

    def _generate_mock_response(self, user_message: str) -> Dict[str, Any]:
        """Generate a mock PM response for development"""
        # Simple keyword-based mock responses
        message_lower = user_message.lower()

        if "좋아요" in message_lower or "like" in message_lower:
            return {
                "content": "좋아요 기능 추가를 이해했습니다. 🎯\n\n"
                "**분석 결과:**\n"
                "- 필요한 노드: 좋아요 버튼, 좋아요 카운트, 사용자 좋아요 상태\n"
                "- 필요한 데이터: likes 테이블 (user_id, post_id, created_at)\n"
                "- 예상 리스크: 3점 (낮음)\n\n"
                "설계를 시작할까요?",
                "agent_type": "pm",
            }
        elif "로그인" in message_lower or "login" in message_lower:
            return {
                "content": "로그인 기능에 대한 요청을 받았습니다. 🔐\n\n"
                "**분석 결과:**\n"
                "- 필요한 노드: 로그인 폼, 인증 처리, 세션 관리\n"
                "- 필요한 데이터: users 테이블, sessions 테이블\n"
                "- 예상 리스크: 7점 (높음) - 보안 관련 기능\n\n"
                "보안 검토와 함께 설계를 진행할까요?",
                "agent_type": "pm",
            }
        else:
            return {
                "content": f'요청을 받았습니다: "{user_message}"\n\n'
                "요구사항을 분석 중입니다. 잠시만 기다려주세요...\n\n"
                "추가로 알려주실 내용이 있으신가요?",
                "agent_type": "pm",
            }
