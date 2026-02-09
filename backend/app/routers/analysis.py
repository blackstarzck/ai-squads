from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.services.impact_analyzer import ImpactAnalyzer
from app.services.supabase_service import supabase_service
from app.models.analysis import ImpactRequest, ImpactResponse, DependencyMapResponse

router = APIRouter()
analyzer = ImpactAnalyzer()


@router.post("/impact", response_model=ImpactResponse)
async def calculate_impact(request: ImpactRequest):
    """Calculate impact score for modifying a node"""
    try:
        # Get all nodes and edges for the project
        nodes = await supabase_service.get_nodes_by_project(str(request.project_id))
        edges = await supabase_service.get_edges_by_project(str(request.project_id))

        # Build graph and calculate impact
        analyzer.build_graph(nodes, edges)
        impact = analyzer.calculate_impact_score(str(request.node_id))
        affected_nodes = analyzer.get_affected_nodes(str(request.node_id))

        return ImpactResponse(
            node_id=request.node_id,
            risk_score=impact,
            affected_nodes=affected_nodes,
            message=_get_risk_message(impact),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dependencies/{node_id}", response_model=DependencyMapResponse)
async def get_dependencies(node_id: UUID, project_id: UUID):
    """Get dependency map for a node"""
    try:
        nodes = await supabase_service.get_nodes_by_project(str(project_id))
        edges = await supabase_service.get_edges_by_project(str(project_id))

        analyzer.build_graph(nodes, edges)
        upstream = analyzer.get_upstream_nodes(str(node_id))
        downstream = analyzer.get_downstream_nodes(str(node_id))

        return DependencyMapResponse(
            node_id=node_id, upstream_nodes=upstream, downstream_nodes=downstream
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _get_risk_message(score: int) -> str:
    """Generate a human-readable risk message"""
    if score <= 2:
        return "낮은 리스크: 이 변경은 안전합니다."
    elif score <= 4:
        return "보통 리스크: 몇 가지 연결된 기능에 영향을 줄 수 있습니다."
    elif score <= 6:
        return "중간 리스크: 여러 기능에 영향을 줄 수 있으니 주의가 필요합니다."
    elif score <= 8:
        return "높은 리스크: 핵심 기능과 연결되어 있습니다. 신중하게 검토하세요."
    else:
        return "매우 높은 리스크: 시스템 전반에 영향을 줄 수 있습니다. 전문가 검토를 권장합니다."
