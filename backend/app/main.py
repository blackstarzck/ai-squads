from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import projects, nodes, analysis, chat
from app.websocket.manager import ConnectionManager

manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("AI-Sync OpenDev Backend starting...")
    yield
    # Shutdown
    print("AI-Sync OpenDev Backend shutting down...")


app = FastAPI(
    title="AI-Sync OpenDev API",
    description="Backend API for AI-Sync OpenDev Visual IDE",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(nodes.router, prefix="/api/nodes", tags=["nodes"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-sync-opendev"}


@app.websocket("/ws/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await manager.connect(websocket, project_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast to all connections in the same project
            await manager.broadcast(project_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)
