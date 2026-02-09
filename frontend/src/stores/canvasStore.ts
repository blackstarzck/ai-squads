import { create } from 'zustand';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from '@xyflow/react';
import { CanvasState } from '@/types';
import { useProjectStore } from './projectStore';

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  highlightedNodeId: null,
  projectCanvasData: {},
  clipboard: null,
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (node: Node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
  updateNode: (id: string, data: any) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  removeNode: (id: string) => {
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const selectedNode = get().selectedNode;
    
    set({
      nodes: currentNodes.filter((node) => node.id !== id),
      // 해당 노드와 연결된 엣지도 함께 제거
      edges: currentEdges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      // 삭제된 노드가 선택된 노드였다면 선택 해제
      selectedNode: selectedNode?.id === id ? null : selectedNode,
    });
  },
  removeNodes: (ids: string[]) => {
    const idSet = new Set(ids);
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const selectedNode = get().selectedNode;

    // 자식 노드도 함께 삭제 대상에 포함
    const collectChildren = (parentIds: Set<string>): Set<string> => {
      const children = currentNodes
        .filter((n) => n.parentId && parentIds.has(n.parentId))
        .map((n) => n.id);
      if (children.length === 0) return parentIds;
      children.forEach((c) => parentIds.add(c));
      return collectChildren(parentIds);
    };
    const allIds = collectChildren(new Set(idSet));

    set({
      nodes: currentNodes.filter((node) => !allIds.has(node.id)),
      edges: currentEdges.filter(
        (edge) => !allIds.has(edge.source) && !allIds.has(edge.target)
      ),
      selectedNode: selectedNode && allIds.has(selectedNode.id) ? null : selectedNode,
    });
  },
  setSelectedNode: (node: Node | null) => {
    set({ selectedNode: node });
  },
  setHighlightedNode: (id: string | null) => {
    set({ highlightedNodeId: id });
  },
  setNodeParent: (childId: string, parentId: string | null, relativePosition: { x: number; y: number }) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === childId) {
          if (parentId) {
            return {
              ...node,
              parentId,
              extent: 'parent' as const,
              position: relativePosition,
            };
          } else {
            const { parentId: _, extent: __, ...rest } = node;
            return {
              ...rest,
              position: relativePosition,
            };
          }
        }
        return node;
      }),
    });
  },
  resizeNode: (id: string, width: number, height: number) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, width, height } : node
      ),
    });
  },
  copyNodes: () => {
    const { nodes, edges } = get();
    const selected = nodes.filter((n) => n.selected);
    if (selected.length === 0) return;

    const selectedIds = new Set(selected.map((n) => n.id));

    // 자식 노드도 함께 복사 대상에 포함
    const collectChildren = (parentIds: Set<string>): Set<string> => {
      const children = nodes
        .filter((n) => n.parentId && parentIds.has(n.parentId) && !parentIds.has(n.id))
        .map((n) => n.id);
      if (children.length === 0) return parentIds;
      children.forEach((c) => parentIds.add(c));
      return collectChildren(parentIds);
    };
    const allIds = collectChildren(new Set(selectedIds));

    const copiedNodes = nodes.filter((n) => allIds.has(n.id)).map((n) => ({ ...n }));

    // 복사 대상 노드 사이를 연결하는 엣지만 포함
    const copiedEdges = edges
      .filter((e) => allIds.has(e.source) && allIds.has(e.target))
      .map((e) => ({ ...e }));

    set({ clipboard: { nodes: copiedNodes, edges: copiedEdges } });
  },
  pasteNodes: () => {
    const { clipboard, nodes, edges } = get();
    if (!clipboard || clipboard.nodes.length === 0) return;

    const OFFSET = 50;
    const now = Date.now();

    // 원본 ID → 새 ID 매핑
    const idMap = new Map<string, string>();
    clipboard.nodes.forEach((n, i) => {
      idMap.set(n.id, `${n.id}-copy-${now}-${i}`);
    });

    // 새 노드 생성 (위치 오프셋, 새 ID, parentId 매핑)
    const newNodes: Node[] = clipboard.nodes.map((n) => {
      const newNode: Node = {
        ...n,
        id: idMap.get(n.id)!,
        position: { x: n.position.x + OFFSET, y: n.position.y + OFFSET },
        selected: true,
      };
      // 부모가 복사 대상에 포함되어 있으면 parentId도 새 ID로 매핑
      if (n.parentId && idMap.has(n.parentId)) {
        newNode.parentId = idMap.get(n.parentId)!;
      } else {
        // 부모가 복사 대상에 없으면 parentId 제거 (독립 노드로)
        delete newNode.parentId;
        delete (newNode as any).extent;
      }
      return newNode;
    });

    // 새 엣지 생성 (source/target을 새 ID로 매핑)
    const newEdges: Edge[] = clipboard.edges.map((e, i) => ({
      ...e,
      id: `${e.id}-copy-${now}-${i}`,
      source: idMap.get(e.source) || e.source,
      target: idMap.get(e.target) || e.target,
    }));

    // 기존 노드의 선택 해제 후 새 노드 추가
    const deselectedNodes = nodes.map((n) => ({ ...n, selected: false }));

    set({
      nodes: [...deselectedNodes, ...newNodes],
      edges: [...edges, ...newEdges],
    });
  },
  switchProject: (fromId: string | null, toId: string | null) => {
    const state = get();
    const newProjectData = { ...state.projectCanvasData };

    // 현재 프로젝트 데이터 저장
    if (fromId) {
      newProjectData[fromId] = { nodes: state.nodes, edges: state.edges };
    }

    // 대상 프로젝트 데이터 로드 (없으면 빈 캔버스)
    const loaded = toId
      ? newProjectData[toId] ?? { nodes: [], edges: [] }
      : { nodes: [], edges: [] };

    set({
      projectCanvasData: newProjectData,
      nodes: loaded.nodes,
      edges: loaded.edges,
      selectedNode: null,
      highlightedNodeId: null,
    });
  },
  removeProjectData: (projectId: string) => {
    const { [projectId]: _, ...rest } = get().projectCanvasData;
    set({ projectCanvasData: rest });
  },
}));

// ── projectStore.currentProjectId 변경 자동 구독 ──
// 프로젝트 전환 시 canvasStore.switchProject 를 자동 호출
let prevProjectId: string | null = null;

useProjectStore.subscribe((state) => {
  const newId = state.currentProjectId;
  if (newId !== prevProjectId) {
    useCanvasStore.getState().switchProject(prevProjectId, newId);
    prevProjectId = newId;
  }
});

// ── 프로젝트 삭제 시 캔버스 데이터 정리 ──
let prevProjectIds: string[] = useProjectStore.getState().projects.map((p) => p.id);

useProjectStore.subscribe((state) => {
  const currentIds = state.projects.map((p) => p.id);
  const removed = prevProjectIds.filter((id) => !currentIds.includes(id));
  removed.forEach((id) => useCanvasStore.getState().removeProjectData(id));
  prevProjectIds = currentIds;
});
