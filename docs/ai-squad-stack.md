### **1. AI 및 오케스트레이션 (Core AI Layer)**
에이전트 간의 업무 릴레이와 PM(Sisyphus)의 지휘를 담당하는 핵심 계층입니다.

* **Framework**: **LangGraph**
**역할**: 에이전트 간 상태(State) 공유, 업무 인수인계(Hand-over) 루프 및 조건부 제어 구현.

* **LLM**: **Groq (Llama 3.1 / 70B)**
**역할**: 초고속 추론 성능을 바탕으로 사용자와 PM 에이전트 간 실시간 채팅 및 즉각적인 리스크 스코어 산출 수행.

* **Orchestration Logic**: **Sisyphus PM Engine**
**역할**: 요구사항 분석 및 기획/설계/개발/QA 에이전트에게 태스크 분배.



### **2. 프론트엔드 및 시각화 (Visual IDE Layer)**

비개발자가 시스템 흐름을 직관적으로 파악하고 제어하는 인터페이스 계층입니다.

* **Framework**: **Next.js (App Router)**
**역할**: 프로젝트 대시보드 및 실시간 워크스페이스 대시보드 구현.

* **Visual Canvas**: **React Flow**
**역할**: 사용자 액션 중심의 흐름도 시각화, 노드 하이라이트 애니메이션 및 드래그 앤 드롭 설계.

* **State Management**: **Zustand**
**역할**: 캔버스 상태, 에이전트 작업 진행률(Step Bar), 실시간 채팅 상태 동기화.

* **Styling**: **Tailwind CSS + Shadcn UI**
**역할**: 반응형 레이아웃 및 분할 뷰(Split-view) 인터페이스 구현.


### **3. 데이터 분석 및 저장 (Analysis & Storage Layer)**

데이터의 영향도를 분석하고 모든 의사결정 맥락을 보존하는 계층입니다.

* **Backend & DB**: **Supabase (PostgreSQL)**
**역할**: 프로젝트 메타데이터, 사용자 정보, DB 스키마 명세 저장.

* **Context & Vector Store**: **Supabase Vector (pgvector)**
**역할**: 버전별 의사결정 로그, AI 논의 맥락을 벡터화하여 저장 및 유사 맥락 검색 기능 제공.

* **Impact Analysis Engine**: **Python (FastAPI)**
**역할**: NetworkX 등을 활용한 데이터 의존성 그래프 분석 및 1~10점 사이의 리스크 스코어 계산.

* **Real-time Sync**: **Supabase Realtime**
**역할**: 에이전트의 작업 결과물이 DB에 반영될 때 클라이언트 캔버스에 즉각적으로 반영.