"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, FileText, Trash2, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/canvasStore';
import { useProjectStore } from '@/stores/projectStore';
import { usePageContentStore } from '@/stores/pageContentStore';
import { setDndPayload } from '@/lib/dndNode';

export const PageListPanel = () => {
  const { nodes, addNode, removeNode, updateNode, setSelectedNode } = useCanvasStore();
  const { currentProjectId, currentPageId, setCurrentPage } = useProjectStore();
  const { removePage: removePageContent } = usePageContentStore();

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // 캔버스 노드 중 page 타입만 필터
  const pageNodes = useMemo(
    () => nodes.filter((n) => n.data?.nodeType === 'page'),
    [nodes],
  );

  // 새 페이지 추가 (기존 LNB의 addNewNode('page') 로직)
  const handleAddPage = () => {
    const offsetY = pageNodes.length * 150 + 100;
    const newNode = {
      id: `page-${Date.now()}`,
      type: 'action' as const,
      position: { x: 100, y: offsetY },
      data: {
        label: '새 화면',
        nodeType: 'page',
      },
    };
    addNode(newNode);
    setSelectedNode(newNode);
    setCurrentPage(newNode.id);
  };

  // 페이지 삭제
  const handleRemovePage = (id: string) => {
    removeNode(id);
    removePageContent(id);
    if (currentPageId === id) {
      setCurrentPage(null);
    }
    if (editingPageId === id) {
      setEditingPageId(null);
    }
  };

  // 이름 편집 시작 (더블클릭)
  const startEditing = (pageId: string, currentLabel: string) => {
    setEditValue(currentLabel);
    setEditingPageId(pageId);
  };

  // 이름 편집 확정
  const commitEditing = () => {
    if (editingPageId && editValue.trim()) {
      updateNode(editingPageId, { label: editValue.trim() });
    }
    setEditingPageId(null);
  };

  // 편집 모드 진입 시 input 자동 포커스
  useEffect(() => {
    if (editingPageId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingPageId]);

  // 프로젝트 미선택 시 패널 숨김
  if (!currentProjectId) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="w-[200px] border-r bg-muted/10 flex flex-col h-full shrink-0">
        {/* Header */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              화면 목록
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 cursor-grab active:cursor-grabbing"
                  onClick={handleAddPage}
                  draggable
                  onDragStart={(e) => setDndPayload(e, { nodeType: 'page', flowType: 'action', label: '새 화면' })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>새 화면 추가 (드래그하여 원하는 위치에 배치)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Separator />
        </div>

        {/* Page list */}
        <ScrollArea className="flex-1">
          <div className="px-2 py-1 space-y-0.5">
            {pageNodes.length === 0 ? (
              <div className="px-2 py-8 text-center">
                <Layout className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  아직 화면이 없어요
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs mt-1 h-auto p-0 cursor-grab active:cursor-grabbing"
                  onClick={handleAddPage}
                  draggable
                  onDragStart={(e) => setDndPayload(e, { nodeType: 'page', flowType: 'action', label: '새 화면' })}
                >
                  첫 화면 추가하기
                </Button>
              </div>
            ) : (
              pageNodes.map((page) => {
                const isActive = currentPageId === page.id;
                const isEditing = editingPageId === page.id;
                const label = String(page.data?.label || '이름 없음');

                return (
                  <div key={page.id} className="group relative">
                    <button
                      className={cn(
                        "w-full text-left rounded-md px-2.5 py-2 transition-colors",
                        "hover:bg-muted/60",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80",
                      )}
                      onClick={() => {
                        if (!isEditing) {
                          setCurrentPage(page.id);
                          setSelectedNode(page);
                        }
                      }}
                      onDoubleClick={() => startEditing(page.id, label)}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full" />
                      )}

                      <div className="flex items-center gap-2">
                        <FileText
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEditing}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEditing();
                              if (e.key === 'Escape') setEditingPageId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-medium bg-background border rounded px-1.5 py-0.5 w-full outline-none focus:ring-2 focus:ring-ring"
                          />
                        ) : (
                          <span className="text-sm font-medium truncate">
                            {label}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Delete button on hover (편집 모드에서는 숨김) */}
                    {!isEditing && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePage(page.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>삭제</p>
                      </TooltipContent>
                    </Tooltip>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer - 페이지 수 표시 */}
        <div className="shrink-0 border-t px-3 py-2">
          <p className="text-[10px] text-muted-foreground">
            총 {pageNodes.length}개 화면
          </p>
        </div>
      </aside>
    </TooltipProvider>
  );
};
