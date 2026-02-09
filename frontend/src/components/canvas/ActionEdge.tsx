'use client';

import React, { memo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, FileCode, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionData {
  id: string;
  label: string;
}

interface ActionEdgeData {
  actions?: ActionData[];
}

const ActionEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) => {
  const { setEdges, deleteElements } = useReactFlow();
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [newActionLabel, setNewActionLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const actions: ActionData[] = (data as ActionEdgeData)?.actions || [];

  // 동작 추가
  const handleAddAction = () => {
    if (!newActionLabel.trim()) return;

    const newAction: ActionData = {
      id: `action-${Date.now()}`,
      label: newActionLabel.trim(),
    };

    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          const currentActions = (edge.data as ActionEdgeData)?.actions || [];
          return {
            ...edge,
            data: {
              ...edge.data,
              actions: [...currentActions, newAction],
            },
          };
        }
        return edge;
      })
    );

    setNewActionLabel('');
    setIsAdding(false);
  };

  // 동작 삭제
  const handleRemoveAction = (actionId: string) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          const currentActions = (edge.data as ActionEdgeData)?.actions || [];
          return {
            ...edge,
            data: {
              ...edge.data,
              actions: currentActions.filter((a) => a.id !== actionId),
            },
          };
        }
        return edge;
      })
    );
  };

  // 동작 편집 시작
  const startEditing = (action: ActionData) => {
    setEditingId(action.id);
    setEditLabel(action.label);
  };

  // 동작 편집 저장
  const handleEditSave = () => {
    if (!editLabel.trim() || !editingId) return;

    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          const currentActions = (edge.data as ActionEdgeData)?.actions || [];
          return {
            ...edge,
            data: {
              ...edge.data,
              actions: currentActions.map((a) =>
                a.id === editingId ? { ...a, label: editLabel.trim() } : a
              ),
            },
          };
        }
        return edge;
      })
    );

    setEditingId(null);
    setEditLabel('');
  };

  // 엣지 삭제
  const handleDeleteEdge = () => {
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#f59e0b' : '#94a3b8',
          strokeWidth: selected ? 2 : 1.5,
        }}
        interactionWidth={20}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 동작이 없을 때 - hover 시에만 추가 버튼 표시 */}
          {actions.length === 0 && !isAdding && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-7 px-2 bg-background shadow-sm border-amber-300 hover:border-amber-400 hover:bg-amber-50 transition-opacity',
                selected && 'border-amber-400 bg-amber-50',
                !isHovered && !selected && 'opacity-0'
              )}
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-3 h-3 mr-1 text-amber-600" />
              <span className="text-xs text-amber-700">동작 추가</span>
            </Button>
          )}

          {/* 동작 추가 입력창 */}
          {isAdding && (
            <div className="flex items-center gap-1 bg-background p-1.5 rounded-lg shadow-lg border border-amber-300">
              <FileCode className="w-4 h-4 text-amber-600 ml-1" />
              <Input
                autoFocus
                value={newActionLabel}
                onChange={(e) => setNewActionLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddAction();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewActionLabel('');
                  }
                }}
                placeholder="동작 이름 입력"
                className="h-6 w-32 text-xs px-2"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-amber-100"
                onClick={handleAddAction}
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-red-100"
                onClick={() => {
                  setIsAdding(false);
                  setNewActionLabel('');
                }}
              >
                <X className="w-3.5 h-3.5 text-red-500" />
              </Button>
            </div>
          )}

          {/* 동작 목록 */}
          {actions.length > 0 && !isAdding && (
            <div className="flex flex-col items-center gap-1">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="group flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 shadow-sm hover:border-amber-400 transition-all"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  
                  {editingId === action.id ? (
                    <Input
                      autoFocus
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditLabel('');
                        }
                      }}
                      onBlur={handleEditSave}
                      className="h-5 w-24 text-xs px-1"
                    />
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-transparent text-amber-800 text-xs font-normal cursor-pointer hover:bg-amber-100 px-1"
                      onDoubleClick={() => startEditing(action)}
                    >
                      {action.label}
                    </Badge>
                  )}

                  {/* 편집/삭제 버튼 */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-amber-200"
                      onClick={() => startEditing(action)}
                    >
                      <Pencil className="w-3 h-3 text-amber-700" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-red-100"
                      onClick={() => handleRemoveAction(action.id)}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* 추가 버튼 (동작이 이미 있을 때) */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-amber-600 hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                동작 추가
              </Button>
            </div>
          )}

          {/* 엣지 삭제 버튼 (선택 시에만 표시) */}
          {selected && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-8 -right-8 h-6 w-6 rounded-full shadow-md"
              onClick={handleDeleteEdge}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(ActionEdge);
