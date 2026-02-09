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

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  highlightedNodeId: null,
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
            // 부모 설정: parentId, extent, 상대 좌표 적용
            return {
              ...node,
              parentId,
              extent: 'parent' as const,
              position: relativePosition,
            };
          } else {
            // 부모 해제: parentId, extent 제거
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
}));
