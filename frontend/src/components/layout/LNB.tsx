"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Layout, 
  Database, 
  Component, 
  Settings, 
  FolderOpen, 
  Plus,
  ChevronRight,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/canvasStore';

type NavItem = {
  id: string;
  icon: React.ElementType;
  label: string;
  /** 비개발자를 위한 쉬운 설명 */
  description: string;
  /** 더 자세한 도움말 */
  helpText: string;
  nodeType: string; // 캔버스 노드 타입과 매칭
  children?: { id: string; label: string; description: string }[];
};

// 카테고리별 기본 정보 (children은 동적으로 생성)
// 동작(function)은 엣지 위에서 추가하므로 사이드바에서 제거
const navCategories: Omit<NavItem, 'children'>[] = [
  { 
    id: 'pages',
    icon: Layout, 
    label: '화면',
    description: '서비스의 각 페이지를 관리해요',
    helpText: '홈, 로그인, 마이페이지 등 사용자가 보게 될 화면들이에요. 클릭하면 해당 화면의 흐름도를 볼 수 있어요.',
    nodeType: 'page',
  },
  { 
    id: 'components',
    icon: Component, 
    label: '구성요소',
    description: '버튼, 카드 등 재사용 가능한 부품들',
    helpText: '여러 화면에서 반복적으로 사용되는 UI 부품이에요. 한 번 만들어두면 어디서든 재사용할 수 있어요.',
    nodeType: 'component',
  },
  { 
    id: 'data',
    icon: Database, 
    label: '데이터',
    description: '저장하고 관리할 정보들',
    helpText: '회원 정보, 상품 목록 등 서비스에서 저장하고 불러올 데이터의 구조예요. 엑셀 표의 열(column)을 정의한다고 생각하세요.',
    nodeType: 'data',
  },
];

export const LNB = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['pages']));
  const { addNode, nodes, setSelectedNode } = useCanvasStore();

  // 새 노드 추가 함수 (동작은 엣지에서 추가하므로 제외)
  const addNewNode = (nodeType: 'page' | 'component' | 'data') => {
    const typeLabels = {
      page: '새 화면',
      component: '새 구성요소',
      data: '데이터 선택',
    };

    // nodeType에 따른 ReactFlow node type 매핑
    // page → ActionNode 사용
    // component → FunctionNode 사용
    // data → DataNode 사용
    const flowTypeMap: Record<string, 'action' | 'function' | 'data'> = {
      page: 'action',
      component: 'function',
      data: 'data',
    };

    // 캔버스에서 적절한 위치 계산 (기존 노드들 기반)
    const existingNodesOfType = nodes.filter(n => n.data?.nodeType === nodeType);
    const baseX = { page: 100, component: 400, data: 700 }[nodeType];
    const offsetY = existingNodesOfType.length * 150 + 100;

    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: flowTypeMap[nodeType],
      position: { x: baseX, y: offsetY },
      data: {
        label: typeLabels[nodeType],
        nodeType: nodeType,
      },
    };

    addNode(newNode);
    // 추가 후 바로 선택
    setSelectedNode(newNode);
  };

  // 캔버스 노드를 기반으로 navItems 동적 생성
  const navItems = useMemo<NavItem[]>(() => {
    return navCategories.map(category => {
      // 해당 nodeType과 일치하는 캔버스 노드들을 children으로 변환
      const categoryNodes = nodes.filter(
        node => node.data?.nodeType === category.nodeType
      );
      
      const children = categoryNodes.map(node => ({
        id: node.id,
        label: String(node.data?.label || '이름 없음'),
        description: String(node.data?.description || ''),
      }));

      return {
        ...category,
        children,
      };
    });
  }, [nodes]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    
    // 캔버스에서 해당 ID와 매칭되는 노드 찾기
    // LNB의 child.id와 노드의 data.lnbId 또는 id가 일치하는 노드를 찾음
    const matchingNode = nodes.find(
      node => node.id === id || node.data?.lnbId === id
    );
    
    if (matchingNode) {
      setSelectedNode(matchingNode);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="w-64 border-r bg-muted/10 flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="px-3 py-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                탐색기
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-medium">탐색기 사용법</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    각 카테고리의 + 버튼을 눌러 새 요소를 추가하세요.
                    항목을 클릭하면 캔버스에서 해당 요소를 확인할 수 있어요.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="space-y-1">
              {navItems.map((item) => (
                <div key={item.id}>
                  {/* 카테고리 헤더 - + 버튼 포함 */}
                  <div className="flex items-center group">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex-1 justify-start font-normal",
                            expandedItems.has(item.id) && "bg-muted"
                          )}
                          onClick={() => toggleExpand(item.id)}
                        >
                          {expandedItems.has(item.id) ? (
                            <ChevronDown className="mr-1 h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="mr-1 h-4 w-4 shrink-0" />
                          )}
                          <item.icon className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          <span className="ml-auto text-xs text-muted-foreground mr-1">
                            {item.children?.length || 0}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.helpText}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    
                    {/* 카테고리별 추가 버튼 */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            addNewNode(item.nodeType as 'page' | 'component' | 'data');
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>새 {item.label} 추가</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* 하위 항목들 */}
                  {expandedItems.has(item.id) && item.children && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 px-2 italic">
                          아직 {item.label}이(가) 없어요
                        </p>
                      ) : (
                        item.children.map((child) => (
                          <Tooltip key={child.id}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-full justify-start font-normal text-sm h-8",
                                  activeItem === child.id && "bg-primary/10 text-primary"
                                )}
                                onClick={() => handleItemClick(child.id)}
                              >
                                {child.label}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{child.description || '클릭하여 선택'}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              프로젝트
            </h3>
            <div className="space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "w-full justify-start font-normal",
                      activeItem === 'assets' && "bg-primary/10 text-primary"
                    )}
                    onClick={() => handleItemClick('assets')}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    파일 보관함
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-medium">파일 보관함</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    이미지, 아이콘 등 서비스에서 사용할 파일들을 업로드하고 관리해요.
                  </p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "w-full justify-start font-normal",
                      activeItem === 'settings' && "bg-primary/10 text-primary"
                    )}
                    onClick={() => handleItemClick('settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-medium">프로젝트 설정</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    프로젝트 이름, AI 에이전트 설정, 배포 옵션 등을 관리해요.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </ScrollArea>
        
        {/* 하단 도움말 */}
        <div className="p-3 border-t bg-muted/5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                <HelpCircle className="mr-2 h-4 w-4" />
                도움이 필요하신가요?
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-medium">💡 시작 가이드</p>
              <p className="text-sm text-muted-foreground mt-1">
                1. 카테고리 옆 + 버튼으로 요소 추가<br/>
                2. 캔버스에서 흐름 연결<br/>
                3. 오른쪽 채팅으로 AI에게 요청<br/>
                4. AI가 코드를 만들어줘요!
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};
