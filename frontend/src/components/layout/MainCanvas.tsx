"use client";

import React, { useCallback, useEffect, useState, useRef, type MouseEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '@/stores/canvasStore';
import ActionNode from '@/components/canvas/ActionNode';
import FunctionNode from '@/components/canvas/FunctionNode';
import DataNode from '@/components/canvas/DataNode';
import MuiComponentNode from '@/components/canvas/MuiComponentNode';
import ActionEdge from '@/components/canvas/ActionEdge';
import { SelectionToolbar } from '@/components/canvas/SelectionToolbar';
import { AgentStatusBar } from '@/components/canvas/AgentStatusBar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { calculateGridPosition, calculateContainerSize } from '@/lib/gridLayout';
import { getMuiCategoryMeta } from '@/lib/muiRegistry';
import { partitionNodesByEmpty } from '@/lib/nodeUtils';
import { getDndPayload } from '@/lib/dndNode';

const nodeTypes = {
  action: ActionNode,
  function: FunctionNode,
  data: DataNode,
  mui: MuiComponentNode,
};

const edgeTypes = {
  action: ActionEdge,
};

// 메인 플로우 컴포넌트 (useReactFlow 사용을 위해 분리)
const Flow = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    addNode,
    removeNodes,
    setSelectedNode,
    setHighlightedNode,
    setNodeParent,
    resizeNode,
    copyNodes,
    pasteNodes,
  } = useCanvasStore();
  
  const { getIntersectingNodes, screenToFlowPosition } = useReactFlow();

  const [showKeyDeleteDialog, setShowKeyDeleteDialog] = useState(false);
  const pendingDeleteIds = useRef<string[]>([]);

  // Delete / Backspace 키 핸들러 — 빈 노드만이면 즉시 삭제, 데이터 노드 포함 시 확인 다이얼로그
  // Ctrl+C / Ctrl+V 복사 붙여넣기 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // input, textarea 등 편집 중일 때는 무시
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl+C / Cmd+C: 복사
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selected = nodes.filter((n) => n.selected);
        if (selected.length === 0) return;
        e.preventDefault();
        copyNodes();
        return;
      }

      // Ctrl+V / Cmd+V: 붙여넣기
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteNodes();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = nodes.filter((n) => n.selected);
        if (selected.length === 0) return;

        e.preventDefault();
        e.stopPropagation();

        const { dataNodes } = partitionNodesByEmpty(selected, edges);
        if (dataNodes.length === 0) {
          // 모두 빈 노드 → 즉시 삭제 (다이얼로그 스킵)
          removeNodes(selected.map((n) => n.id));
        } else {
          // 데이터 있는 노드 포함 → 확인 다이얼로그
          pendingDeleteIds.current = selected.map((n) => n.id);
          setShowKeyDeleteDialog(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [nodes, edges, removeNodes, copyNodes, pasteNodes]);

  // 키보드 삭제 확인 시 실행
  const handleConfirmKeyDelete = useCallback(() => {
    if (pendingDeleteIds.current.length > 0) {
      removeNodes(pendingDeleteIds.current);
      pendingDeleteIds.current = [];
    }
    setShowKeyDeleteDialog(false);
  }, [removeNodes]);

  // 새 노드 추가 핸들러 (동작 제외 - 동작은 엣지에서 추가)
  const handleAddNode = useCallback((type: string) => {
    const nodeTypeMap: Record<string, { nodeType: string; label: string; flowType: 'action' | 'function' | 'data'; width?: number; height?: number }> = {
      page: { nodeType: 'page', label: '새 화면', flowType: 'action' },
      component: { nodeType: 'component', label: '새 구성요소', flowType: 'function', width: 300, height: 200 },
      data: { nodeType: 'data', label: '데이터 선택', flowType: 'data' },
    };

    const config = nodeTypeMap[type] || nodeTypeMap.page;
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: config.flowType,
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: { 
        label: config.label, 
        nodeType: config.nodeType,
      },
      // 컨테이너 노드는 기본 크기 설정
      ...(config.width && { width: config.width }),
      ...(config.height && { height: config.height }),
    };

    addNode(newNode);
  }, [addNode]);

  // ── 사이드 패널에서 캔버스로 DnD: dragOver ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // ── 사이드 패널에서 캔버스로 DnD: drop ──
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const payload = getDndPayload(e);
    if (!payload) return;

    const center = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const nodeW = payload.width ?? 200;
    const nodeH = payload.height ?? 80;
    const position = { x: center.x - nodeW / 2, y: center.y - nodeH / 2 };

    const newNode: Node = {
      id: `${payload.nodeType}-${Date.now()}`,
      type: payload.flowType,
      position,
      data: {
        label: payload.label,
        nodeType: payload.nodeType,
        ...(payload.muiComponentType ? { muiComponentType: payload.muiComponentType } : {}),
        ...(payload.muiCategory ? { muiCategory: payload.muiCategory } : {}),
      },
      ...(payload.width ? { width: payload.width } : {}),
      ...(payload.height ? { height: payload.height } : {}),
    };

    addNode(newNode);
    setSelectedNode(newNode);
  }, [addNode, setSelectedNode, screenToFlowPosition]);

  // 노드 클릭 시 선택
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  // 드래그 중 교차 노드 감지 및 하이라이트
  const handleNodeDrag = useCallback((_: MouseEvent, node: Node) => {
    // 모든 노드가 부모가 될 수 있음
    const intersections = getIntersectingNodes(node).filter(
      (n) => n.id !== node.id
    );
    
    if (intersections.length > 0) {
      // 가장 첫 번째 교차 노드를 하이라이트
      setHighlightedNode(intersections[0].id);
    } else {
      setHighlightedNode(null);
    }
  }, [getIntersectingNodes, setHighlightedNode]);

  // 드래그 종료 시 부모-자식 관계 설정
  const handleNodeDragStop = useCallback((_: MouseEvent, node: Node) => {
    // 모든 노드가 부모가 될 수 있음
    const intersections = getIntersectingNodes(node).filter(
      (n) => n.id !== node.id
    );
    
    // 하이라이트 해제
    setHighlightedNode(null);
    
    if (intersections.length > 0) {
      const parentNode = intersections[0];
      
      // 이미 같은 부모를 가지고 있으면 그리드 스냅만 적용
      if (node.parentId === parentNode.id) {
        // 같은 부모 내에서 이동 - 그리드 스냅 적용
        const siblingNodes = nodes.filter(
          (n) => n.parentId === parentNode.id && n.id !== node.id
        );
        
        // 새 자식 수에 맞게 컨테이너 리사이즈
        const newChildCount = siblingNodes.length + 1;
        const { width: newWidth, height: newHeight } = calculateContainerSize(newChildCount);
        
        const gridPosition = calculateGridPosition(
          node.position,
          siblingNodes,
          newWidth,
          newHeight,
          node.id
        );
        
        setNodeParent(node.id, parentNode.id, gridPosition);
        resizeNode(parentNode.id, newWidth, newHeight);
        return;
      }
      
      // 자기 자신을 부모로 설정하려는 경우 무시
      if (node.id === parentNode.id) {
        return;
      }
      
      // 새로운 부모에 드롭 - 빈 그리드 슬롯 찾기
      const siblingNodes = nodes.filter(
        (n) => n.parentId === parentNode.id
      );
      
      // 새 자식 수에 맞게 컨테이너 리사이즈 (기존 자식 + 새로 추가되는 노드)
      const newChildCount = siblingNodes.length + 1;
      const { width: newWidth, height: newHeight } = calculateContainerSize(newChildCount);
      
      // 드롭 위치의 상대 좌표 계산
      const relativeDropPosition = {
        x: node.position.x - parentNode.position.x,
        y: node.position.y - parentNode.position.y,
      };
      
      // 그리드 위치 계산 (겹치지 않는 가장 가까운 슬롯)
      const gridPosition = calculateGridPosition(
        relativeDropPosition,
        siblingNodes,
        newWidth,
        newHeight,
        node.id
      );
      
      setNodeParent(node.id, parentNode.id, gridPosition);
      resizeNode(parentNode.id, newWidth, newHeight);
    } else if (node.parentId) {
      // 부모 영역 밖으로 드롭된 경우 - 부모 관계 해제
      // 현재 노드의 부모 노드 찾기
      const parentNode = nodes.find((n) => n.id === node.parentId);
      
      if (parentNode) {
        // 절대 좌표로 변환: 부모 좌표 + 상대 좌표
        const absolutePosition = {
          x: parentNode.position.x + node.position.x,
          y: parentNode.position.y + node.position.y,
        };
        
        // 부모에서 제거 후 남은 자식 수에 맞게 리사이즈
        const remainingChildren = nodes.filter(
          (n) => n.parentId === parentNode.id && n.id !== node.id
        );
        const { width: newWidth, height: newHeight } = calculateContainerSize(remainingChildren.length);
        
        setNodeParent(node.id, null, absolutePosition);
        resizeNode(parentNode.id, newWidth, newHeight);
      }
    }
  }, [getIntersectingNodes, setHighlightedNode, setNodeParent, resizeNode, nodes]);

  // 기본 엣지 옵션 - 모든 새 엣지는 action 타입으로 생성
  const defaultEdgeOptions = {
    type: 'action',
    data: { actions: [] },
  };

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        selectionOnDrag
        fitView
        selectNodesOnDrag={false}
        className="bg-slate-50 dark:bg-slate-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => {
            const nodeType = n.data?.nodeType;
            if (nodeType === 'page') return '#3b82f6';      // blue-500
            if (nodeType === 'data') return '#10b981';      // emerald-500
            if (nodeType === 'component') return '#8b5cf6'; // violet-500
            if (nodeType === 'muiComponent') {
              const meta = getMuiCategoryMeta(n.data?.muiCategory as any);
              return meta?.color || '#64748b';
            }
            return '#eee';
          }}
          nodeColor={(n) => {
            const nodeType = n.data?.nodeType;
            if (nodeType === 'page') return '#dbeafe';      // blue-100
            if (nodeType === 'data') return '#d1fae5';      // emerald-100
            if (nodeType === 'component') return '#ede9fe'; // violet-100
            if (nodeType === 'muiComponent') {
              const meta = getMuiCategoryMeta(n.data?.muiCategory as any);
              return meta?.bgColor || '#f8fafc';
            }
            return '#fff';
          }}
        />
      </ReactFlow>

      {/* 다중 선택 시 하단 플로팅 툴바 */}
      <SelectionToolbar />

      {/* 키보드 Delete 키 확인 다이얼로그 */}
      <AlertDialog open={showKeyDeleteDialog} onOpenChange={setShowKeyDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDeleteIds.current.length}개 노드를 삭제할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              선택된 노드와 연결된 모든 엣지(연결선)가 함께 삭제됩니다.
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmKeyDelete}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const MainCanvas = () => {
  return (
    <div className="w-full h-full relative bg-slate-50 dark:bg-slate-950">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <AgentStatusBar />
      </div>
      
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
};
