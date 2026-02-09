# AI-Sync OpenDev

> **비개발자가 AI 에이전트를 지휘해 서비스를 개발하고 유지보수할 수 있는 비주얼 IDE 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.4+-blue)](https://langchain-ai.github.io/langgraph/)
[![Python](https://img.shields.io/badge/Python-3.10--3.14-yellow)](https://python.org/)

---

## 목차

1. [프로젝트 소개](#프로젝트-소개)
2. [주요 기능](#주요-기능)
3. [시스템 요구사항](#시스템-요구사항)
4. [환경 설정](#환경-설정)
5. [프로젝트 실행](#프로젝트-실행)
6. [프로젝트 구조](#프로젝트-구조)
7. [API 엔드포인트](#api-엔드포인트)
8. [에이전트 구성](#에이전트-구성)
9. [트러블슈팅](#트러블슈팅)

---

## 프로젝트 소개

AI-Sync OpenDev는 코딩 지식이 없는 비개발자가 **AI 에이전트 군단**을 지휘해 직접 서비스를 개발하고 유지보수할 수 있는 플랫폼입니다.

### 핵심 목표

| 목표 | 설명 |
|------|------|
| **멀티 에이전트 오케스트레이션** | PM 에이전트(Sisyphus)가 기획/설계/개발/QA 에이전트를 지휘 |
| **시각적 설계** | 사용자 액션 중심의 흐름도로 시스템 구조를 직관적으로 파악 |
| **영향도 분석** | 기능 수정 시 리스크 점수(1-10)를 산출하여 안전한 확장 지원 |
| **맥락 기반 버전 관리** | 의사결정 배경과 AI 논의 맥락을 기록하여 장기 유지보수 지원 |

---

## 주요 기능

### 1. 비주얼 캔버스 (React Flow)
- 사용자 액션 중심의 흐름도 시각화
- 드래그 앤 드롭으로 노드 추가/연결
- 에이전트 작업 상태 실시간 하이라이트

### 2. PM 에이전트 채팅 (Sisyphus)
- 자연어로 기능 요청
- AI가 요구사항 분석 및 작업 분해
- 에이전트 간 업무 릴레이 브리핑

### 3. 영향도 분석 (NetworkX)
- 기능 수정 시 리스크 점수(1-10) 산출
- 데이터 의존성 그래프 시각화
- 영향받는 노드 사전 경고

### 4. 맥락 기반 버전 관리
- 변경 배경, AI 논의 맥락 기록
- 의사결정 히스토리 보존
- 타임라인 복구 지점 관리

---

## 시스템 요구사항

### 필수 소프트웨어

| 소프트웨어 | 권장 버전 | 비고 |
|-----------|----------|------|
| **Node.js** | 22.x (LTS) | 18.x 이상 필수 |
| **pnpm** | 10.x | `npm install -g pnpm` |
| **Python** | 3.10 ~ 3.14 | 3.10 미만 또는 3.15 이상 미지원 |

### 현재 개발 환경 (테스트 완료)

```
Node.js: v22.16.0
pnpm: v10.28.2
Python: 3.14.3
```

---

## 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd ai-squads
```

### 2. 환경 변수 설정

루트 디렉토리에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# AI/LLM
GROQ_API_KEY=your_groq_api_key

# LangChain (선택사항 - 트레이싱용)
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=ai-sync-opendev
LANGCHAIN_TRACING_V2=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Service URLs
AGENTS_URL=http://localhost:8001
BACKEND_URL=http://localhost:8000
```

> **API 키 발급**
> - Groq API: https://console.groq.com/
> - Supabase: https://supabase.com/dashboard

### 3. Supabase 스키마 설정

Supabase SQL Editor에서 `backend/schema.sql` 파일을 실행하세요.

### 4. 패키지 설치

```bash
# Frontend
cd frontend
pnpm install

# Backend
cd ../backend
pip install -r requirements.txt

# Agents
cd ../agents
pip install -r requirements.txt
```

---

## 프로젝트 실행

### 전체 서비스 시작

**3개의 터미널**을 열어 각각 실행하세요:

```bash
# Terminal 1: Frontend (Next.js)
cd frontend
pnpm dev
```

```bash
# Terminal 2: Backend (FastAPI)
cd backend
py run.py
# 또는: python run.py
```

```bash
# Terminal 3: Agents (LangGraph)
cd agents
py run.py
# 또는: python run.py
```

### 서비스 포트

| 서비스 | 포트 | URL |
|--------|------|-----|
| Frontend | 3000 | http://localhost:3000/workspace |
| Backend | 8000 | http://localhost:8000 |
| Agents | 8001 | http://localhost:8001 |

### 헬스 체크

```bash
# Backend
curl http://localhost:8000/health

# Agents
curl http://localhost:8001/health
```

---

## 프로젝트 구조

```
ai-squads/
├── frontend/          # Next.js 16 + React Flow + Shadcn UI
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React 컴포넌트
│   │   ├── stores/        # Zustand 상태 관리
│   │   └── types/         # TypeScript 타입 정의
│   └── package.json
│
├── backend/           # FastAPI + Supabase + NetworkX
│   ├── app/
│   │   ├── routers/       # API 라우터
│   │   └── services/      # 비즈니스 로직
│   ├── requirements.txt
│   └── run.py
│
├── agents/            # LangGraph + Groq (Llama 3.3 70B)
│   ├── app/
│   │   ├── config.py      # LLM 설정
│   │   └── graphs/        # LangGraph 워크플로우
│   ├── requirements.txt
│   └── run.py
│
├── docs/              # 문서
│   ├── ai-squad-prd.md       # 제품 요구사항 문서
│   ├── ai-squad-stack.md     # 기술 스택 문서
│   └── ai-squad-design.md    # 디자인 문서
│
└── .env.local         # 환경 변수 (git에 포함되지 않음)
```

---

## API 엔드포인트

### Backend (http://localhost:8000)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/health` | 헬스 체크 |
| POST | `/api/projects` | 프로젝트 생성 |
| GET | `/api/projects` | 프로젝트 목록 |
| POST | `/api/nodes` | 노드 생성 |
| POST | `/api/analysis/impact` | 영향도 분석 |
| POST | `/api/chat/message` | 채팅 메시지 |
| WS | `/ws/{project_id}` | 실시간 업데이트 |

### Agents (http://localhost:8001)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/health` | 헬스 체크 |
| POST | `/api/chat` | 에이전트 채팅 |
| POST | `/api/workflow/run` | 전체 워크플로우 실행 |

---

## 에이전트 구성

| 에이전트 | 역할 |
|----------|------|
| **Sisyphus (PM)** | 요구사항 분석, 작업 분배, 품질 관리 |
| **Architect** | 시스템 설계, 노드 구조 정의 |
| **Coder** | 코드 생성, 구현 |
| **QA** | 검증, 테스트, 버그 리포트 |

---

## 트러블슈팅

### Python 버전 관련 문제

> **중요**: Python 버전과 라이브러리 버전이 맞지 않으면 에러가 발생할 수 있습니다.

#### 지원 Python 버전
- **최소**: Python 3.10
- **최대**: Python 3.14
- **권장**: Python 3.11 ~ 3.12

#### Backend 의존성 (requirements.txt)

```txt
fastapi>=0.115.0
uvicorn>=0.32.0
supabase>=2.10.0
networkx>=3.4
python-dotenv>=1.0.0
pydantic>=2.10.0
websockets>=14.0
httpx>=0.28.0
```

#### Agents 의존성 (requirements.txt)

```txt
langgraph>=0.4.0
langchain>=0.3.20
langchain-groq>=0.3.0
langchain-community>=0.3.20
python-dotenv>=1.0.0
pydantic>=2.10.0
fastapi>=0.115.0
uvicorn>=0.32.0
httpx>=0.28.0
```

### 자주 발생하는 에러

#### 1. `ModuleNotFoundError: No module named 'xxx'`

```bash
# 가상환경 생성 및 활성화 권장
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 의존성 재설치
pip install -r requirements.txt
```

#### 2. `pydantic` 관련 에러

```bash
# Pydantic v2 필요
pip install "pydantic>=2.10.0"
```

#### 3. `langchain` 버전 충돌

```bash
# 모든 langchain 패키지 버전 통일
pip install "langchain>=0.3.20" "langchain-groq>=0.3.0" "langchain-community>=0.3.20"
```

#### 4. Groq API 에러

- `llama-3.1-70b-versatile` 모델은 deprecated됨
- `llama-3.3-70b-versatile` 사용 권장
- `agents/app/config.py`에서 모델명 확인

#### 5. ReactFlow Controls 아이콘이 안 보임

CSS 스타일 문제입니다. `frontend/src/app/globals.css`에 ReactFlow 스타일이 포함되어 있는지 확인하세요.

---

## 라이선스

MIT License

---

## 기여

이슈나 PR은 환영합니다!
