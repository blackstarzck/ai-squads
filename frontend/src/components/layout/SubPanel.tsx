"use client";

import React, { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Activity, 
  FileJson, 
  ListTodo, 
  HelpCircle,
  Layout,
  Component,
  Database,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  FileText,
  PanelsTopLeft,
  PenTool,
  X,
  Boxes,
} from 'lucide-react';
import { useCanvasStore } from '@/stores/canvasStore';
import { usePageContentStore } from '@/stores/pageContentStore';
import { useProjectStore } from '@/stores/projectStore';
import { PageContent } from '@/types';
import { getMuiComponent, getMuiCategoryMeta } from '@/lib/muiRegistry';

// 노드 타입별 아이콘
const nodeTypeIcons: Record<string, React.ElementType> = {
  page: Layout,
  component: Component,
  data: Database,
  function: FileCode,
  muiComponent: Boxes,
};

// 노드 타입별 한글 라벨
const nodeTypeLabels: Record<string, string> = {
  page: '화면',
  component: '구성요소',
  data: '데이터',
  function: '동작',
  action: '액션',
  muiComponent: 'MUI 컴포넌트',
};

// 섹션별 아이콘/라벨
const sectionMeta: Record<keyof PageContent, { icon: React.ElementType; label: string }> = {
  prd: { icon: FileText, label: 'PRD' },
  screenLayout: { icon: PanelsTopLeft, label: '화면 구성' },
  wireframe: { icon: PenTool, label: '와이어프레임' },
};

export const SubPanel = () => {
  const { selectedNode, nodes, edges, removeNode, setSelectedNode } = useCanvasStore();
  const { selectedItem, contents, updateItem, removeItem, setSelectedItem } = usePageContentStore();
  const { currentPageId } = useProjectStore();

  // 현재 편집 중인 항목의 실제 데이터
  const editingItem = useMemo(() => {
    if (!selectedItem) return null;
    const pageContent = contents[selectedItem.pageId];
    if (!pageContent) return null;
    return pageContent[selectedItem.section]?.find((i) => i.id === selectedItem.itemId) ?? null;
  }, [selectedItem, contents]);

  // 현재 페이지 이름
  const editingPageName = useMemo(() => {
    if (!selectedItem) return '';
    const pageNode = nodes.find((n) => n.id === selectedItem.pageId);
    return pageNode ? String(pageNode.data?.label || '이름 없음') : '이름 없음';
  }, [selectedItem, nodes]);

  // 선택된 노드와 연결된 노드들 계산
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };

    // 이 노드로 들어오는 연결 (source → 이 노드)
    const incomingEdges = edges.filter(edge => edge.target === selectedNode.id);
    const incomingNodes = incomingEdges
      .map(edge => nodes.find(node => node.id === edge.source))
      .filter((node): node is NonNullable<typeof node> => node !== undefined);

    // 이 노드에서 나가는 연결 (이 노드 → target)
    const outgoingEdges = edges.filter(edge => edge.source === selectedNode.id);
    const outgoingNodes = outgoingEdges
      .map(edge => nodes.find(node => node.id === edge.target))
      .filter((node): node is NonNullable<typeof node> => node !== undefined);

    return { incoming: incomingNodes, outgoing: outgoingNodes };
  }, [selectedNode, edges, nodes]);

  // 리스크 레벨 계산
  const riskLevel = useMemo(() => {
    const totalConnections = connectedNodes.incoming.length + connectedNodes.outgoing.length;
    if (totalConnections === 0) return { level: 'safe', label: '안전', color: 'green' };
    if (totalConnections <= 2) return { level: 'low', label: '낮음', color: 'green' };
    if (totalConnections <= 4) return { level: 'medium', label: '주의', color: 'yellow' };
    return { level: 'high', label: '위험', color: 'red' };
  }, [connectedNodes]);

  // 선택된 노드가 없을 때의 빈 상태
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <ListTodo className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        캔버스에서 요소를 클릭하면<br/>
        여기에 상세 정보가 표시돼요
      </p>
    </div>
  );

  // 선택된 노드 정보 표시
  const NodeInfo = () => {
    if (!selectedNode) return <EmptyState />;

    const nodeType = String(selectedNode.data?.nodeType || selectedNode.type || 'action');
    const IconComponent = nodeTypeIcons[nodeType] || ListTodo;
    const typeLabel = nodeTypeLabels[nodeType] || '요소';

    // MUI 컴포넌트 관련 정보
    const muiComponentType = selectedNode.data?.muiComponentType as string | undefined;
    const muiDef = muiComponentType ? getMuiComponent(muiComponentType) : undefined;
    const muiCategoryMeta = muiDef ? getMuiCategoryMeta(muiDef.category) : undefined;

    return (
      <div className="space-y-3">
        {/* 노드 헤더 */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{String(selectedNode.data?.label || '이름 없음')}</h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {typeLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {String(selectedNode.data?.description || '설명이 없습니다')}
            </p>
          </div>
        </div>

        {/* MUI 컴포넌트 상세 정보 */}
        {muiDef && muiCategoryMeta && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
              <span className="text-muted-foreground">컴포넌트</span>
              <span className="font-medium">{muiDef.label}</span>
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
              <span className="text-muted-foreground">카테고리</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: muiCategoryMeta.color }}
                />
                <span className="text-xs font-medium">{muiCategoryMeta.labelKo}</span>
              </span>
            </div>
            {muiDef.isContainer && (
              <div className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">유형</span>
                <Badge variant="outline" className="text-xs">컨테이너</Badge>
              </div>
            )}
            {/* MUI 미리보기 */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border">
              <span className="text-xs text-muted-foreground block mb-2">미리보기</span>
              <div className="flex items-center justify-center min-h-[48px]" style={{ pointerEvents: 'none' }}>
                {muiDef.renderPreview()}
              </div>
            </div>
          </div>
        )}

        {/* 노드 상세 정보 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">ID</span>
            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{selectedNode.id}</code>
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">위치</span>
            <span className="font-mono text-xs">
              X: {Math.round(selectedNode.position?.x || 0)}, Y: {Math.round(selectedNode.position?.y || 0)}
            </span>
          </div>
          {typeof selectedNode.data?.code === 'string' && selectedNode.data.code && (
            <div className="p-2 bg-muted/30 rounded">
              <span className="text-sm text-muted-foreground block mb-1">코드 미리보기</span>
              <code className="text-xs font-mono block bg-muted p-2 rounded overflow-hidden text-ellipsis">
                {selectedNode.data.code}
              </code>
            </div>
          )}
        </div>

        {/* 삭제 버튼 */}
        <div className="pt-3 border-t mt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={() => removeNode(selectedNode.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                이 요소 삭제하기
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>캔버스에서 이 요소를 삭제해요. 연결된 선도 함께 삭제돼요.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  };

  // ── 페이지 콘텐츠 편집 패널 ──
  if (selectedItem && editingItem) {
    const meta = sectionMeta[selectedItem.section];
    const SectionIcon = meta.icon;

    return (
      <TooltipProvider>
        <div className="h-full border-t bg-background flex flex-col">
          {/* 헤더 */}
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <SectionIcon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0">{editingPageName}</span>
              <span className="text-xs text-muted-foreground">/</span>
              <Badge variant="secondary" className="text-xs shrink-0">{meta.label}</Badge>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>편집 닫기</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* 편집 폼 */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* 제목 */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">제목</label>
                <Input
                  value={editingItem.label}
                  onChange={(e) =>
                    updateItem(selectedItem.pageId, selectedItem.section, selectedItem.itemId, {
                      label: e.target.value,
                    })
                  }
                  placeholder="항목 제목을 입력하세요"
                  className="h-9"
                />
              </div>

              {/* 내용 */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">내용</label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) =>
                    updateItem(selectedItem.pageId, selectedItem.section, selectedItem.itemId, {
                      description: e.target.value,
                    })
                  }
                  placeholder={
                    selectedItem.section === 'prd'
                      ? '이 화면에서 필요한 요구사항을 작성하세요...'
                      : selectedItem.section === 'screenLayout'
                        ? '화면의 레이아웃과 정보 구조를 작성하세요...'
                        : '와이어프레임에 대한 설명을 작성하세요...'
                  }
                  className="min-h-[200px] resize-none"
                />
              </div>

              {/* 삭제 */}
              <div className="pt-3 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    removeItem(selectedItem.pageId, selectedItem.section, selectedItem.itemId);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  이 항목 삭제
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full border-t bg-background flex flex-col">
        <Tabs defaultValue="summary" className="w-full h-full flex flex-col">
          <div className="px-4 border-b bg-muted/30 shrink-0">
            <TabsList className="h-10 bg-transparent p-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="summary" 
                    className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-4"
                  >
                    <ListTodo className="w-4 h-4 mr-2" />
                    요약
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>선택한 요소의 기본 정보를 확인해요</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="impact" 
                    className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-4"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    영향도
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>이 요소를 수정하면 어디에 영향을 주는지 확인해요</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="schema" 
                    className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-4"
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    구조
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>데이터 구조와 세부 설정을 확인해요</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1">
            <TabsContent value="summary" className="p-4 m-0 h-full">
              <NodeInfo />
            </TabsContent>
            
            <TabsContent value="impact" className="p-4 m-0">
              {selectedNode ? (
                <div className="space-y-4">
                  {/* 리스크 점수 - 동적 계산 */}
                  {riskLevel.color === 'green' && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">{riskLevel.label}</p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          이 요소를 수정해도 다른 곳에 영향이 적어요
                        </p>
                      </div>
                    </div>
                  )}
                  {riskLevel.color === 'yellow' && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-700 dark:text-yellow-400">{riskLevel.label}</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-500">
                          연결된 요소들이 있어요. 수정 시 확인이 필요해요
                        </p>
                      </div>
                    </div>
                  )}
                  {riskLevel.color === 'red' && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-400">{riskLevel.label}</p>
                        <p className="text-sm text-red-600 dark:text-red-500">
                          많은 요소와 연결되어 있어요. 신중하게 수정하세요
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* 들어오는 연결 (이 노드를 사용하는 요소들) */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                      이 요소로 연결됨
                      <Badge variant="secondary" className="text-xs">
                        {connectedNodes.incoming.length}
                      </Badge>
                    </h4>
                    {connectedNodes.incoming.length === 0 ? (
                      <p className="text-sm text-muted-foreground pl-6">
                        이 요소로 들어오는 연결이 없어요
                      </p>
                    ) : (
                      <div className="space-y-1 pl-6">
                        {connectedNodes.incoming.map((node) => {
                          const nodeType = String(node.data?.nodeType || 'action');
                          const IconComponent = nodeTypeIcons[nodeType] || ListTodo;
                          return (
                            <Button
                              key={node.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-8 text-sm"
                              onClick={() => setSelectedNode(node)}
                            >
                              <IconComponent className="w-4 h-4 mr-2 shrink-0" />
                              <span className="truncate">{String(node.data?.label || '이름 없음')}</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {nodeTypeLabels[nodeType] || '요소'}
                              </Badge>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 나가는 연결 (이 노드가 사용하는 요소들) */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4 text-green-500" />
                      이 요소에서 연결됨
                      <Badge variant="secondary" className="text-xs">
                        {connectedNodes.outgoing.length}
                      </Badge>
                    </h4>
                    {connectedNodes.outgoing.length === 0 ? (
                      <p className="text-sm text-muted-foreground pl-6">
                        이 요소에서 나가는 연결이 없어요
                      </p>
                    ) : (
                      <div className="space-y-1 pl-6">
                        {connectedNodes.outgoing.map((node) => {
                          const nodeType = String(node.data?.nodeType || 'action');
                          const IconComponent = nodeTypeIcons[nodeType] || ListTodo;
                          return (
                            <Button
                              key={node.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-8 text-sm"
                              onClick={() => setSelectedNode(node)}
                            >
                              <IconComponent className="w-4 h-4 mr-2 shrink-0" />
                              <span className="truncate">{String(node.data?.label || '이름 없음')}</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {nodeTypeLabels[nodeType] || '요소'}
                              </Badge>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 연결 요약 */}
                  {(connectedNodes.incoming.length > 0 || connectedNodes.outgoing.length > 0) && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        💡 연결된 요소를 클릭하면 해당 요소로 이동해요
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>
            
            <TabsContent value="schema" className="p-4 m-0">
              {selectedNode ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    데이터 구조
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>이 요소가 가진 데이터의 구조예요</p>
                      </TooltipContent>
                    </Tooltip>
                  </h4>
                  <pre className="text-xs font-mono bg-muted p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedNode.data || {}, null, 2)}
                  </pre>
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
