'use client';

import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useNodes } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pencil, Grid3X3 } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvasStore';
import { cn } from '@/lib/utils';
import { getGridSlots } from '@/lib/gridLayout';
import { getMuiComponent, getMuiCategoryMeta } from '@/lib/muiRegistry';
import DataSelector from '@/components/canvas/DataSelector';

const MuiComponentNode = ({ data, selected, id, width, height }: NodeProps) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [labelValue, setLabelValue] = useState(String(data.label || ''));
  const [descValue, setDescValue] = useState(String(data.description || ''));
  const labelInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const { updateNode, highlightedNodeId } = useCanvasStore();

  // MUI 레지스트리에서 컴포넌트 정보 조회
  const muiComponentType = String(data.muiComponentType || '');
  const componentDef = useMemo(() => getMuiComponent(muiComponentType), [muiComponentType]);
  const categoryMeta = useMemo(
    () => componentDef ? getMuiCategoryMeta(componentDef.category) : undefined,
    [componentDef]
  );

  // 컨테이너 여부
  const isContainer = componentDef?.isContainer ?? false;

  // 자식 노드 수 계산 (컨테이너일 때)
  const allNodes = useNodes();
  const childCount = useMemo(() => {
    if (!isContainer) return 0;
    return allNodes.filter(n => n.parentId === id).length;
  }, [allNodes, id, isContainer]);

  // 하이라이트 상태
  const isHighlighted = highlightedNodeId === id;

  // 그리드 슬롯 (컨테이너 모드)
  const gridSlots = useMemo(() => {
    if (!isContainer) return [];
    return getGridSlots(width || 400, height || 300);
  }, [isContainer, width, height]);

  // 카테고리 색상 (인라인 스타일)
  const color = categoryMeta?.color || '#64748b';
  const bgColor = categoryMeta?.bgColor || '#f8fafc';

  // 데이터 연결 상태
  const selectedTable = String(data.selectedTable || '');
  const selectedColumn = String(data.selectedColumn || '');

  const handleTableChange = (tableName: string) => {
    updateNode(id, { selectedTable: tableName, selectedColumn: '' });
  };

  const handleColumnChange = (columnName: string) => {
    updateNode(id, { selectedColumn: columnName });
  };

  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  useEffect(() => {
    if (isEditingDesc && descInputRef.current) {
      descInputRef.current.focus();
      descInputRef.current.select();
    }
  }, [isEditingDesc]);

  const handleLabelSave = () => {
    if (labelValue.trim()) {
      updateNode(id, { label: labelValue.trim() });
    } else {
      setLabelValue(String(data.label || ''));
    }
    setIsEditingLabel(false);
  };

  const handleDescSave = () => {
    updateNode(id, { description: descValue.trim() || '' });
    setIsEditingDesc(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, saveHandler: () => void) => {
    if (e.key === 'Enter') {
      saveHandler();
    } else if (e.key === 'Escape') {
      setLabelValue(String(data.label || ''));
      setDescValue(String(data.description || ''));
      setIsEditingLabel(false);
      setIsEditingDesc(false);
    }
  };

  // MUI 아이콘 렌더링
  const IconComponent = componentDef?.icon;

  // MUI 프리뷰 렌더링 (pointerEvents: none)
  const preview = useMemo(() => {
    if (!componentDef) return null;
    try {
      return componentDef.renderPreview();
    } catch {
      return null;
    }
  }, [componentDef]);

  // ─── 컨테이너 모드 ───
  if (isContainer) {
    return (
      <>
        <NodeResizer
          isVisible={selected}
          minWidth={300}
          minHeight={200}
          handleStyle={{ width: 8, height: 8, borderRadius: 4 }}
          lineStyle={{ borderWidth: 1 }}
        />

        <div
          className={cn(
            'w-full h-full min-w-[300px] min-h-[200px] rounded-xl border-2 shadow-md transition-all flex flex-col',
          )}
          style={{
            borderColor: isHighlighted ? color : selected ? color : `${color}40`,
            backgroundColor: bgColor,
            ...(isHighlighted ? { boxShadow: `0 0 0 4px ${color}30`, borderStyle: 'dashed' } : {}),
            ...(selected && !isHighlighted ? { boxShadow: `0 0 0 2px ${color}30` } : {}),
          }}
        >
          {/* 헤더 */}
          <div
            className="p-3 rounded-t-lg shrink-0"
            style={{ backgroundColor: `${color}10` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {/* MUI 아이콘 */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {IconComponent && (
                    <IconComponent style={{ width: 16, height: 16, color }} />
                  )}
                </div>
                {isEditingLabel ? (
                  <Input
                    ref={labelInputRef}
                    value={labelValue}
                    onChange={(e) => setLabelValue(e.target.value)}
                    onBlur={handleLabelSave}
                    onKeyDown={(e) => handleKeyDown(e, handleLabelSave)}
                    className="h-6 text-sm font-bold px-1 py-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <CardTitle
                    className="text-sm font-bold truncate cursor-pointer hover:text-primary group flex items-center gap-1"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setIsEditingLabel(true);
                    }}
                  >
                    {data.label as string}
                    <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                  </CardTitle>
                )}
              </div>
              <Badge
                className="text-[10px] h-5 shrink-0 ml-2 border-0"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {categoryMeta?.labelKo || componentDef?.category || 'MUI'}
              </Badge>
            </div>

            {/* 설명 */}
            {isEditingDesc ? (
              <Input
                ref={descInputRef}
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                onBlur={handleDescSave}
                onKeyDown={(e) => handleKeyDown(e, handleDescSave)}
                className="h-6 text-xs px-1 py-0 mt-2"
                placeholder="설명을 입력하세요"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p
                className="text-xs text-muted-foreground cursor-pointer hover:text-foreground mt-2 truncate group flex items-center gap-1"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingDesc(true);
                }}
              >
                <span className="truncate">{data.description as string || '더블클릭하여 설명 추가'}</span>
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
              </p>
            )}

            {/* 데이터 연결 (컨테이너 모드) */}
            <DataSelector
              selectedTable={selectedTable}
              selectedColumn={selectedColumn}
              onTableChange={handleTableChange}
              onColumnChange={handleColumnChange}
              className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
            />
          </div>

          {/* MUI 프리뷰 + 컨테이너 영역 */}
          <div className="flex-1 p-2 relative">
            {/* MUI 컴포넌트 프리뷰 (시각적 전용) */}
            {preview && (
              <div
                className="mb-2"
                style={{ pointerEvents: 'none', opacity: 0.8 }}
              >
                {preview}
              </div>
            )}

            {/* 빈 컨테이너 안내 또는 자식 수 표시 */}
            {childCount === 0 ? (
              <div
                className="absolute inset-2 top-auto bottom-2 flex items-center justify-center rounded-lg pointer-events-none"
                style={{ border: `2px dashed ${color}30`, minHeight: 60 }}
              >
                <div className="text-center">
                  <Grid3X3 className="w-5 h-5 mx-auto mb-1" style={{ color: `${color}40` }} />
                  <p className="text-xs text-muted-foreground/50">
                    노드를 여기에 드롭하세요
                  </p>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-2 right-2 pointer-events-none">
                <Badge
                  variant="secondary"
                  className="text-[10px]"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {childCount}개 항목
                </Badge>
              </div>
            )}
          </div>

          {/* 4방향 Handle */}
          <Handle type="target" position={Position.Top} id="top" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
          <Handle type="target" position={Position.Left} id="left" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
          <Handle type="source" position={Position.Bottom} id="bottom" className="w-2.5 h-2.5 hover:scale-125 transition-all" style={{ backgroundColor: color }} />
          <Handle type="source" position={Position.Right} id="right" className="w-2.5 h-2.5 hover:scale-125 transition-all" style={{ backgroundColor: color }} />
        </div>
      </>
    );
  }

  // ─── 리프 모드 ───
  return (
    <Card
      className={cn('w-72 shadow-md border-2 transition-all')}
      style={{
        borderColor: isHighlighted ? color : selected ? color : `${color}40`,
        ...(selected ? { boxShadow: `0 0 0 2px ${color}30` } : {}),
      }}
    >
      {/* 헤더 */}
      <CardHeader
        className="p-3 pb-2 rounded-t-lg"
        style={{ backgroundColor: `${color}08` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              {IconComponent && (
                <IconComponent style={{ width: 16, height: 16, color }} />
              )}
            </div>
            {isEditingLabel ? (
              <Input
                ref={labelInputRef}
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelSave}
                onKeyDown={(e) => handleKeyDown(e, handleLabelSave)}
                className="h-6 text-sm font-bold px-1 py-0"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <CardTitle
                className="text-sm font-bold truncate cursor-pointer hover:text-primary group flex items-center gap-1"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingLabel(true);
                }}
              >
                {data.label as string}
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
              </CardTitle>
            )}
          </div>
          <Badge
            className="text-[10px] h-5 shrink-0 ml-2 border-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {categoryMeta?.labelKo || componentDef?.category || 'MUI'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-2">
        {/* MUI 컴포넌트 프리뷰 (시각적 전용) */}
        {preview && (
          <div
            className="mb-2 p-2 rounded-md flex items-center justify-center"
            style={{ pointerEvents: 'none', backgroundColor: `${color}05`, border: `1px solid ${color}15` }}
          >
            {preview}
          </div>
        )}

        {/* 설명 */}
        {isEditingDesc ? (
          <Input
            ref={descInputRef}
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            onBlur={handleDescSave}
            onKeyDown={(e) => handleKeyDown(e, handleDescSave)}
            className="h-6 text-xs px-1 py-0"
            placeholder="설명을 입력하세요"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/50 rounded px-1 py-0.5 -mx-1 transition-colors group flex items-center gap-1"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingDesc(true);
            }}
          >
            <span className="truncate">{data.description as string || '더블클릭하여 설명 추가'}</span>
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
          </p>
        )}

        {/* 데이터 연결 (리프 모드) */}
        <DataSelector
          selectedTable={selectedTable}
          selectedColumn={selectedColumn}
          onTableChange={handleTableChange}
          onColumnChange={handleColumnChange}
          className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
        />

        {!isEditingLabel && !isEditingDesc && (
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            더블클릭하여 편집
          </p>
        )}
      </CardContent>

      {/* 4방향 Handle */}
      <Handle type="target" position={Position.Top} id="top" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
      <Handle type="target" position={Position.Left} id="left" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2.5 h-2.5 hover:scale-125 transition-all" style={{ backgroundColor: color }} />
      <Handle type="source" position={Position.Right} id="right" className="w-2.5 h-2.5 hover:scale-125 transition-all" style={{ backgroundColor: color }} />
    </Card>
  );
};

export default memo(MuiComponentNode);
