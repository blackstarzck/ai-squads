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
  Database,
  Component,
  Settings,
  FolderOpen,
  Plus,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  FileText,
  PanelsTopLeft,
  PenTool,
  Sparkles,
  FolderPlus,
  MousePointerClick,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/canvasStore';
import { useProjectStore } from '@/stores/projectStore';
import { usePageContentStore } from '@/stores/pageContentStore';
import { PageContent } from '@/types';
import { getAllMuiCategories, getMuiComponentsByCategory } from '@/lib/muiRegistry';
import type { MuiComponentCategory } from '@/types';
import { setDndPayload, type DndNodePayload } from '@/lib/dndNode';

// ─── 타입 ────────────────────────────────────────────────
type NavChild = { id: string; label: string; description: string };

type NavItem = {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  helpText: string;
  nodeType: string;
  children?: NavChild[];
};

// ─── 화면 요소 카테고리 (캔버스 노드 연동) ─────────────────
const navCategories: Omit<NavItem, 'children'>[] = [
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

// ─── 페이지별 섹션 정의 ─────────────────────────────────
const pageSections: {
  key: keyof PageContent;
  icon: React.ElementType;
  title: string;
  helpText: string;
  newItemLabel: string;
}[] = [
    {
      key: 'prd',
      icon: FileText,
      title: 'PRD',
      helpText: '이 화면의 요구사항을 작성하고 관리해요. 화면이 어떤 기능을 가져야 하는지 정리하는 곳이에요.',
      newItemLabel: '새 요구사항',
    },
    {
      key: 'screenLayout',
      icon: PanelsTopLeft,
      title: '화면 구성',
      helpText: '이 화면의 레이아웃과 정보 구조(IA)를 설계해요. 어떤 영역이 필요하고 어디에 배치할지 정리해요.',
      newItemLabel: '새 화면 구성',
    },
    {
      key: 'wireframe',
      icon: PenTool,
      title: '와이어프레임',
      helpText: '이 화면의 대략적인 레이아웃을 스케치해요. 디자인 전에 어디에 무엇을 배치할지 빠르게 잡아볼 수 있어요.',
      newItemLabel: '새 와이어프레임',
    },
  ];

// ─── 컴포넌트 ────────────────────────────────────────────
export const LNB = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['components']));
  const { addNode, nodes, setSelectedNode } = useCanvasStore();
  const { currentProjectId, currentPageId, projects, addProject } = useProjectStore();
  const { contents, addItem, setSelectedItem, selectedItem } = usePageContentStore();

  // 현재 선택된 페이지의 콘텐츠
  const currentPageContent = currentPageId ? contents[currentPageId] : null;

  // ── 화면 요소: 새 노드 추가 ──
  const addNewNode = (nodeType: 'component' | 'data') => {
    const typeLabels = {
      component: '새 구성요소',
      data: '데이터 선택',
    };

    const flowTypeMap: Record<string, 'function' | 'data'> = {
      component: 'function',
      data: 'data',
    };

    const existingNodesOfType = nodes.filter(n => n.data?.nodeType === nodeType);
    const baseX = { component: 400, data: 700 }[nodeType];
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
    setSelectedNode(newNode);
  };

  // ── MUI 컴포넌트 노드 추가 ──
  const addMuiNode = (muiComponentType: string) => {
    const def = getMuiComponentsByCategory(
      getAllMuiCategories().find(c =>
        getMuiComponentsByCategory(c.id).some(comp => comp.key === muiComponentType)
      )?.id || 'layout'
    ).find(c => c.key === muiComponentType);

    if (!def) return;

    const existingMuiNodes = nodes.filter(n => n.data?.nodeType === 'muiComponent');
    const offsetX = 250 + (existingMuiNodes.length % 3) * 320;
    const offsetY = 100 + Math.floor(existingMuiNodes.length / 3) * 250;

    const newNode = {
      id: `mui-${muiComponentType.toLowerCase()}-${Date.now()}`,
      type: 'mui' as const,
      position: { x: offsetX, y: offsetY },
      data: {
        label: def.labelKo || def.label,
        nodeType: 'muiComponent',
        muiComponentType: muiComponentType,
        muiCategory: def.category,
      },
      ...(def.isContainer ? { width: 400, height: 300 } : {}),
    };

    addNode(newNode);
    setSelectedNode(newNode);
  };

  // ── 화면 요소: 캔버스 노드 → navItems 변환 ──
  const navItems = useMemo<NavItem[]>(() => {
    return navCategories.map(category => {
      const categoryNodes = nodes.filter(
        node => node.data?.nodeType === category.nodeType
      );

      const children = categoryNodes.map(node => ({
        id: node.id,
        label: String(node.data?.label || '이름 없음'),
        description: String(node.data?.description || ''),
      }));

      return { ...category, children };
    });
  }, [nodes]);

  // ── 공통: 섹션 토글 ──
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── 공통: 항목 클릭 ──
  const handleItemClick = (id: string) => {
    setActiveItem(id);

    const matchingNode = nodes.find(
      node => node.id === id || node.data?.lnbId === id
    );
    if (matchingNode) setSelectedNode(matchingNode);
  };

  // ── 페이지별 섹션: 항목 추가 ──
  const addPageSectionItem = (sectionKey: keyof PageContent) => {
    if (!currentPageId) return;
    const sectionDef = pageSections.find((s) => s.key === sectionKey);
    if (!sectionDef) return;
    addItem(currentPageId, sectionKey, {
      id: `${sectionKey}-${Date.now()}`,
      label: sectionDef.newItemLabel,
      description: '',
    });
  };

  // ─── 렌더 헬퍼: 접을 수 있는 리스트 섹션 ──────────────
  const renderCollapsibleSection = (
    id: string,
    Icon: React.ElementType,
    label: string,
    helpText: string,
    children: NavChild[],
    onAdd: () => void,
    sectionKey?: keyof PageContent,
    dragPayload?: DndNodePayload,
  ) => (
    <div key={id}>
      <div className="flex items-center group">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 justify-start font-normal",
                expandedItems.has(id) && "bg-muted"
              )}
              onClick={() => toggleExpand(id)}
            >
              {expandedItems.has(id) ? (
                <ChevronDown className="mr-1 h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="mr-1 h-4 w-4 shrink-0" />
              )}
              <Icon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
              <span className="ml-auto text-xs text-muted-foreground mr-1">
                {children.length}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">{helpText}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                dragPayload && "cursor-grab active:cursor-grabbing"
              )}
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              draggable={!!dragPayload}
              onDragStart={(e) => { if (dragPayload) setDndPayload(e, dragPayload); }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>새 {label} 추가</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {expandedItems.has(id) && (
        <div className="ml-6 mt-1 space-y-1">
          {children.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 px-2 italic">
              아직 {label}이(가) 없어요
            </p>
          ) : (
            children.map((child) => (
              <Tooltip key={child.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start font-normal text-sm h-8",
                      (sectionKey && currentPageId
                        ? selectedItem?.pageId === currentPageId &&
                        selectedItem?.section === sectionKey &&
                        selectedItem?.itemId === child.id
                        : activeItem === child.id)
                      && "bg-primary/10 text-primary"
                    )}
                    onClick={() => {
                      if (sectionKey && currentPageId) {
                        setSelectedItem({ pageId: currentPageId, section: sectionKey, itemId: child.id });
                      } else {
                        handleItemClick(child.id);
                      }
                    }}
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
  );

  // ─── 빈 상태: 프로젝트 미선택 ──────────────────────────
  const handleCreateFromEmpty = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: '새 프로젝트',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProject(newProject);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-sm font-semibold mb-1.5">프로젝트를 선택해주세요</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-5">
        왼쪽에서 프로젝트를 선택하면<br />
        여기에 화면 요소, PRD, 화면 구성 등이 표시돼요.
      </p>
      {projects.length === 0 && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleCreateFromEmpty}
        >
          <FolderPlus className="h-4 w-4" />
          첫 프로젝트 만들기
        </Button>
      )}
    </div>
  );

  // ─── 페이지 미선택 안내 ────────────────────────────────
  const PageNotSelectedHint = () => (
    <div className="px-4 py-6 text-center">
      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
        <MousePointerClick className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        화면 목록에서 화면을 선택하면<br />
        PRD, 화면 구성, 와이어프레임이 표시돼요.
      </p>
    </div>
  );

  // ─── 렌더 ──────────────────────────────────────────────
  return (
    <TooltipProvider delayDuration={300}>
      <aside className="w-64 border-r bg-muted/10 flex flex-col h-full">
        {!currentProjectId ? (
          <EmptyState />
        ) : (
          <>
            <ScrollArea className="flex-1">
              {/* ── 1. 화면 요소 (프로젝트 레벨) ── */}
              <div className="px-3 py-4">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                    화면 설계
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium">화면 설계 사용법</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        각 카테고리의 + 버튼을 눌러 새 요소를 추가하세요.
                        항목을 클릭하면 캔버스에서 해당 요소를 확인할 수 있어요.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const dragPayloads: Record<string, DndNodePayload> = {
                      component: { nodeType: 'component', flowType: 'function', label: '새 구성요소' },
                      data: { nodeType: 'data', flowType: 'data', label: '데이터 선택' },
                    };
                    return renderCollapsibleSection(
                      item.id,
                      item.icon,
                      item.label,
                      item.helpText,
                      item.children || [],
                      () => addNewNode(item.nodeType as 'component' | 'data'),
                      undefined,
                      dragPayloads[item.nodeType],
                    );
                  })}
                </div>

                {/* MUI 컴포넌트 카테고리 */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                      MUI 컴포넌트
                    </p>
                  </div>
                  <div className="space-y-1">
                    {getAllMuiCategories().map((cat) => {
                      const components = getMuiComponentsByCategory(cat.id);
                      const isExpanded = expandedItems.has(`mui-${cat.id}`);
                      return (
                        <div key={`mui-${cat.id}`}>
                          <div className="flex items-center group">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 justify-start font-normal"
                              onClick={() => toggleExpand(`mui-${cat.id}`)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="mr-1 h-4 w-4 shrink-0" />
                              ) : (
                                <ChevronRight className="mr-1 h-4 w-4 shrink-0" />
                              )}
                              <span
                                className="w-2 h-2 rounded-full mr-2 shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="truncate">{cat.labelKo}</span>
                              <span className="ml-auto text-xs text-muted-foreground mr-1">
                                {components.length}
                              </span>
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="ml-6 mt-1 space-y-0.5">
                              {components.map((comp) => (
                                <Tooltip key={comp.key}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start font-normal text-sm h-7 group cursor-grab active:cursor-grabbing"
                                      onClick={() => addMuiNode(comp.key)}
                                      draggable
                                      onDragStart={(e) => setDndPayload(e, {
                                        nodeType: 'muiComponent',
                                        flowType: 'mui',
                                        label: comp.labelKo || comp.label,
                                        muiComponentType: comp.key,
                                        muiCategory: cat.id,
                                        isContainer: comp.isContainer,
                                        ...(comp.isContainer ? { width: 400, height: 300 } : {}),
                                      })}
                                    >
                                      <comp.icon style={{ width: 14, height: 14, color: cat.color, marginRight: 8, flexShrink: 0 }} />
                                      <span className="truncate">{comp.labelKo}</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    <p className="font-medium">{comp.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                      드래그하여 캔버스에 추가 (클릭도 가능)
                                      {comp.isContainer ? ' · 컨테이너' : ''}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator className="my-1" />

              {/* ── 2. 페이지별 섹션 (PRD / 화면 구성 / 와이어프레임) ── */}
              {!currentPageId ? (
                <PageNotSelectedHint />
              ) : (
                <>
                  {/* 설계 문서 섹션 헤딩 */}
                  <div className="px-3 pt-3 pb-1">
                    <p className="px-1 text-xs text-muted-foreground font-medium tracking-wide uppercase">
                      설계 문서
                    </p>
                  </div>

                  {pageSections.map((section, idx) => {
                    const items = currentPageContent?.[section.key] ?? [];
                    return (
                      <React.Fragment key={section.key}>
                        <div className="px-3 py-2">
                          <div className="space-y-1">
                            {renderCollapsibleSection(
                              section.key,
                              section.icon,
                              section.title,
                              section.helpText,
                              items,
                              () => addPageSectionItem(section.key),
                              section.key,
                            )}
                          </div>
                        </div>
                        {idx < pageSections.length - 1 && <Separator className="my-1" />}
                      </React.Fragment>
                    );
                  })}
                </>
              )}

              <Separator className="my-1" />

              {/* ── 3. 프로젝트 (제일 아래) ── */}
              <div className="px-3 py-3">
                <h3 className="mb-2 px-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
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
                  <p className="font-medium">시작 가이드</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    1. 화면 목록에서 화면을 추가하세요<br />
                    2. 화면을 선택하면 PRD, 화면 구성을 작성할 수 있어요<br />
                    3. 오른쪽 채팅으로 AI에게 요청<br />
                    4. AI가 코드를 만들어줘요!
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </aside>
    </TooltipProvider>
  );
};
