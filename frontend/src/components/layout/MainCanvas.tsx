"use client";

import React, { useCallback, useEffect, useState, type MouseEvent } from 'react';
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
import ActionEdge from '@/components/canvas/ActionEdge';
import { AgentStatusBar } from '@/components/canvas/AgentStatusBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { calculateGridPosition, calculateContainerSize } from '@/lib/gridLayout';
import { 
  Layout, 
  Component, 
  Database, 
  Sparkles,
  MousePointerClick
} from 'lucide-react';

const nodeTypes = {
  action: ActionNode,
  function: FunctionNode,
  data: DataNode,
};

const edgeTypes = {
  action: ActionEdge,
};

// 빈 캔버스 안내 컴포넌트
const EmptyCanvasGuide = ({ onAddNode }: { onAddNode: (type: string) => void }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <Card className="max-w-lg pointer-events-auto shadow-lg border-2 border-dashed border-primary/30 bg-background/95 backdrop-blur">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">서비스 만들기 시작!</h2>
            <p className="text-muted-foreground">
              아래 버튼을 눌러 첫 번째 요소를 추가하거나,<br/>
              오른쪽 채팅창에서 AI에게 요청해보세요.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onAddNode('page')}
            >
              <Layout className="w-6 h-6 text-blue-500" />
              <span className="font-medium">화면 추가</span>
              <span className="text-xs text-muted-foreground">홈, 로그인 등</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onAddNode('component')}
            >
              <Component className="w-6 h-6 text-purple-500" />
              <span className="font-medium">구성요소 추가</span>
              <span className="text-xs text-muted-foreground">버튼, 카드 등</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onAddNode('data')}
            >
              <Database className="w-6 h-6 text-green-500" />
              <span className="font-medium">데이터 추가</span>
              <span className="text-xs text-muted-foreground">회원, 상품 등</span>
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MousePointerClick className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">이렇게 해보세요</p>
                <ol className="text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center">1</span>
                    요소를 추가하고 배치하세요
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center">2</span>
                    노드를 연결하면 동작을 추가할 수 있어요
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center">3</span>
                    AI에게 기능을 요청해보세요
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
    setSelectedNode,
    setHighlightedNode,
    setNodeParent,
    resizeNode,
  } = useCanvasStore();
  
  const { getIntersectingNodes } = useReactFlow();

  const [showGuide, setShowGuide] = useState(true);

  // 노드가 추가되면 가이드 숨기기
  useEffect(() => {
    if (nodes.length > 0) {
      setShowGuide(false);
    }
  }, [nodes.length]);

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
    setShowGuide(false);
  }, [addNode]);

  // 노드 클릭 시 선택
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  // 드래그 중 교차 노드 감지 및 하이라이트
  const handleNodeDrag = useCallback((_: MouseEvent, node: Node) => {
    // 부모가 될 수 있는 노드 타입만 대상 (component)
    const intersections = getIntersectingNodes(node).filter(
      (n) => n.data?.nodeType === 'component' && n.id !== node.id
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
    // 부모가 될 수 있는 노드 찾기 (component 타입만)
    const intersections = getIntersectingNodes(node).filter(
      (n) => n.data?.nodeType === 'component' && n.id !== node.id
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
      {/* 빈 캔버스 가이드 */}
      {showGuide && nodes.length === 0 && (
        <EmptyCanvasGuide onAddNode={handleAddNode} />
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        selectNodesOnDrag={false}
        className="bg-slate-50 dark:bg-slate-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => {
            // 노드의 실제 타입(nodeType)에 따른 테두리 색상
            const nodeType = n.data?.nodeType;
            if (nodeType === 'page') return '#3b82f6';      // blue-500
            if (nodeType === 'data') return '#10b981';      // emerald-500
            if (nodeType === 'component') return '#8b5cf6'; // violet-500
            return '#eee';
          }}
          nodeColor={(n) => {
            // 노드의 실제 타입(nodeType)에 따른 배경 색상
            const nodeType = n.data?.nodeType;
            if (nodeType === 'page') return '#dbeafe';      // blue-100
            if (nodeType === 'data') return '#d1fae5';      // emerald-100
            if (nodeType === 'component') return '#ede9fe'; // violet-100
            return '#fff';
          }}
        />
      </ReactFlow>
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
