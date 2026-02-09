"use client";

import React, { useState, useCallback } from 'react';
import { useNodes, useEdges } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trash2, X, CheckSquare, Copy, ClipboardPaste } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvasStore';
import { partitionNodesByEmpty } from '@/lib/nodeUtils';

export const SelectionToolbar = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const allNodes = useNodes();
  const allEdges = useEdges();
  const { removeNodes, copyNodes, pasteNodes, clipboard } = useCanvasStore();

  // React Flow의 selected 속성으로 선택된 노드 필터링
  const selectedNodes = allNodes.filter((n) => n.selected);
  const selectedCount = selectedNodes.length;

  // 선택된 노드의 자식까지 포함한 총 삭제 대상 수 계산
  const countWithChildren = useCallback(() => {
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    const collectChildren = (parentIds: Set<string>): number => {
      const children = allNodes.filter(
        (n) => n.parentId && parentIds.has(n.parentId) && !selectedIds.has(n.id)
      );
      if (children.length === 0) return selectedIds.size;
      children.forEach((c) => selectedIds.add(c.id));
      return collectChildren(selectedIds);
    };
    return collectChildren(selectedIds);
  }, [selectedNodes, allNodes]);

  const handleDelete = useCallback(() => {
    const ids = selectedNodes.map((n) => n.id);
    removeNodes(ids);
    setShowDeleteDialog(false);
  }, [selectedNodes, removeNodes]);

  // 선택된 노드가 없으면 렌더링하지 않음
  if (selectedCount === 0) return null;

  const totalDeleteCount = countWithChildren();
  const hasChildren = totalDeleteCount > selectedCount;

  return (
    <TooltipProvider>
      {/* 하단 중앙 고정 플로팅 툴바 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur border shadow-lg rounded-full px-4 py-2">
          {/* 선택 카운트 */}
          <Badge variant="secondary" className="text-xs font-medium">
            {selectedCount}개 선택됨
          </Badge>

          <div className="w-px h-5 bg-border" />

          {/* 전체 선택 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  // React Flow의 onNodesChange를 통해 모든 노드 선택
                  const changes = allNodes.map((n) => ({
                    type: 'select' as const,
                    id: n.id,
                    selected: true,
                  }));
                  useCanvasStore.getState().onNodesChange(changes);
                }}
              >
                <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                전체 선택
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>캔버스의 모든 노드를 선택해요</p>
            </TooltipContent>
          </Tooltip>

          {/* 선택 해제 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  const changes = allNodes.map((n) => ({
                    type: 'select' as const,
                    id: n.id,
                    selected: false,
                  }));
                  useCanvasStore.getState().onNodesChange(changes);
                  useCanvasStore.getState().setSelectedNode(null);
                }}
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                선택 해제
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>선택을 모두 해제해요</p>
            </TooltipContent>
          </Tooltip>

          {/* 복사 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => copyNodes()}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                복사
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>선택된 노드를 복사해요 (Ctrl+C)</p>
            </TooltipContent>
          </Tooltip>

          {/* 붙여넣기 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={!clipboard}
                onClick={() => pasteNodes()}
              >
                <ClipboardPaste className="w-3.5 h-3.5 mr-1.5" />
                붙여넣기
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>복사된 노드를 붙여넣어요 (Ctrl+V)</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border" />

          {/* 삭제 버튼 — 빈 노드만 선택 시 즉시 삭제, 데이터 노드 포함 시 확인 다이얼로그 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  const { dataNodes } = partitionNodesByEmpty(selectedNodes, allEdges);
                  if (dataNodes.length === 0) {
                    // 모두 빈 노드 → 즉시 삭제
                    handleDelete();
                  } else {
                    // 데이터가 있는 노드 포함 → 확인 다이얼로그
                    setShowDeleteDialog(true);
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                삭제
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>선택된 노드를 삭제해요 (Delete 키)<br/>빈 노드는 확인 없이 바로 삭제돼요</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCount}개 노드를 삭제할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              선택된 노드와 연결된 모든 엣지(연결선)가 함께 삭제됩니다.
              {hasChildren && (
                <>
                  <br />
                  <span className="font-medium text-destructive">
                    하위 노드 {totalDeleteCount - selectedCount}개도 함께
                    삭제됩니다. (총 {totalDeleteCount}개)
                  </span>
                </>
              )}
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {totalDeleteCount}개 삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};
