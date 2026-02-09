'use client';

import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useNodes } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pencil, Component, FileCode, Grid3X3 } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvasStore';
import { cn } from '@/lib/utils';
import { getGridSlots } from '@/lib/gridLayout';

// 노드 타입별 스타일 설정
const nodeTypeStyles: Record<string, {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  borderColor: string;
  selectedBorder: string;
  highlightBorder: string;
  badgeStyle: string;
  handleColor: string;
  headerBg: string;
  containerBg: string;
}> = {
  component: {
    icon: Component,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    label: '구성요소',
    borderColor: 'border-violet-200 dark:border-violet-800',
    selectedBorder: 'border-violet-500 ring-2 ring-violet-200',
    highlightBorder: 'border-violet-400 ring-4 ring-violet-300/50 border-dashed',
    badgeStyle: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    handleColor: 'bg-violet-500',
    headerBg: 'bg-violet-50/50 dark:bg-violet-950/30',
    containerBg: 'bg-violet-50/30 dark:bg-violet-950/20',
  },
  function: {
    icon: FileCode,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    label: '동작',
    borderColor: 'border-amber-200 dark:border-amber-800',
    selectedBorder: 'border-amber-500 ring-2 ring-amber-200',
    highlightBorder: 'border-amber-400 ring-4 ring-amber-300/50 border-dashed',
    badgeStyle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    handleColor: 'bg-amber-500',
    headerBg: 'bg-amber-50/50 dark:bg-amber-950/30',
    containerBg: 'bg-amber-50/30 dark:bg-amber-950/20',
  },
};

const FunctionNode = ({ data, selected, id, width, height }: NodeProps) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [labelValue, setLabelValue] = useState(String(data.label || ''));
  const [descValue, setDescValue] = useState(String(data.description || ''));
  const labelInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const { updateNode, highlightedNodeId } = useCanvasStore();
  
  // 모든 노드에서 자식 노드 수 계산
  const allNodes = useNodes();
  const childCount = useMemo(() => {
    return allNodes.filter(n => n.parentId === id).length;
  }, [allNodes, id]);

  const nodeType = String(data.nodeType || 'function');
  const styles = nodeTypeStyles[nodeType] || nodeTypeStyles.function;
  const IconComponent = styles.icon;
  
  // 이 노드가 하이라이트 대상인지 확인
  const isHighlighted = highlightedNodeId === id;
  
  // 자식 노드를 가질 수 있는 컨테이너 모드인지 (component 타입만)
  const isContainer = nodeType === 'component';
  
  // 그리드 슬롯 계산 (컨테이너 모드일 때만)
  const gridSlots = useMemo(() => {
    if (!isContainer) return [];
    const containerWidth = width || 300;
    const containerHeight = height || 200;
    return getGridSlots(containerWidth, containerHeight);
  }, [isContainer, width, height]);

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

  // 컨테이너 모드: 리사이즈 가능하고 자식 노드를 담을 수 있음
  if (isContainer) {
    return (
      <>
        {/* 노드 리사이저 - 선택 시 크기 조절 가능 */}
        <NodeResizer
          isVisible={selected}
          minWidth={280}
          minHeight={180}
          handleStyle={{
            width: 8,
            height: 8,
            borderRadius: 4,
          }}
          lineStyle={{
            borderWidth: 1,
          }}
        />
        
        <div
          className={cn(
            'w-full h-full min-w-[280px] min-h-[180px] rounded-xl border-2 shadow-md transition-all flex flex-col',
            isHighlighted
              ? styles.highlightBorder
              : selected
                ? styles.selectedBorder
                : styles.borderColor,
            styles.containerBg
          )}
        >
          {/* 헤더 - 상단에 고정 */}
          <div className={cn('p-3 rounded-t-lg shrink-0', styles.headerBg)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', styles.iconBg)}>
                  <IconComponent className={cn('w-4 h-4', styles.iconColor)} />
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
              <Badge className={cn('text-[10px] h-5 shrink-0 ml-2 border-0', styles.badgeStyle)}>
                {styles.label}
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
          </div>
          
          {/* 컨테이너 영역 - 자식 노드들이 들어갈 공간 */}
          <div className="flex-1 p-2 relative">
            {/* 빈 컨테이너 안내 또는 자식 수 표시 */}
            {childCount === 0 ? (
              <div className="absolute inset-2 flex items-center justify-center border-2 border-dashed border-violet-200/50 dark:border-violet-800/50 rounded-lg pointer-events-none">
                <div className="text-center">
                  <Grid3X3 className="w-6 h-6 mx-auto mb-1 text-violet-300/50" />
                  <p className="text-xs text-muted-foreground/50">
                    데이터 노드를 여기에 드롭하세요
                  </p>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-2 right-2 pointer-events-none">
                <Badge variant="secondary" className="text-[10px] bg-violet-100/80 text-violet-600">
                  {childCount}개 항목
                </Badge>
              </div>
            )}
          </div>
          
          {/* 4방향 Handle - 입력(target) */}
          <Handle type="target" position={Position.Top} id="top" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
          <Handle type="target" position={Position.Left} id="left" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
          
          {/* 4방향 Handle - 출력(source) */}
          <Handle type="source" position={Position.Bottom} id="bottom" className={cn('w-2.5 h-2.5 hover:scale-125 transition-all', styles.handleColor)} />
          <Handle type="source" position={Position.Right} id="right" className={cn('w-2.5 h-2.5 hover:scale-125 transition-all', styles.handleColor)} />
        </div>
      </>
    );
  }

  // 일반 모드 (function 타입 등)
  return (
    <Card className={cn(
      'w-64 shadow-md border-2 transition-all',
      isHighlighted
        ? styles.highlightBorder
        : selected
          ? styles.selectedBorder
          : styles.borderColor
    )}>
      {/* 헤더 - 노드 타입별 배경색 */}
      <CardHeader className={cn('p-3 pb-2 rounded-t-lg', styles.headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* 아이콘 - 배경 원 */}
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', styles.iconBg)}>
              <IconComponent className={cn('w-4 h-4', styles.iconColor)} />
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
          <Badge className={cn('text-[10px] h-5 shrink-0 ml-2 border-0', styles.badgeStyle)}>
            {styles.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-2">
        {isEditingDesc ? (
          <Input
            ref={descInputRef}
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            onBlur={handleDescSave}
            onKeyDown={(e) => handleKeyDown(e, handleDescSave)}
            className="h-6 text-xs px-1 py-0 mb-2"
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
        
        {/* 코드 미리보기 (있는 경우) */}
        {typeof data.code === 'string' && data.code && (
          <div className={cn('text-xs font-mono p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap mt-2', styles.iconBg)}>
            {data.code}
          </div>
        )}
        
        {!isEditingLabel && !isEditingDesc && typeof data.code !== 'string' && (
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            더블클릭하여 편집
          </p>
        )}
      </CardContent>
      
      {/* 4방향 Handle - 입력(target) */}
      <Handle type="target" position={Position.Top} id="top" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
      <Handle type="target" position={Position.Left} id="left" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
      
      {/* 4방향 Handle - 출력(source) */}
      <Handle type="source" position={Position.Bottom} id="bottom" className={cn('w-2.5 h-2.5 hover:scale-125 transition-all', styles.handleColor)} />
      <Handle type="source" position={Position.Right} id="right" className={cn('w-2.5 h-2.5 hover:scale-125 transition-all', styles.handleColor)} />
    </Card>
  );
};

export default memo(FunctionNode);
