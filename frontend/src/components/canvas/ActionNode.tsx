"use client";

import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pencil, Layout, Database } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvasStore';
import DataSelector from '@/components/canvas/DataSelector';
import { DB_SCHEMA } from '@/lib/dbSchema';

// 노드 타입별 스타일 설정
const nodeTypeStyles: Record<string, {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  borderColor: string;
  selectedBorder: string;
  badgeStyle: string;
  handleColor: string;
  headerBg: string;
}> = {
  page: {
    icon: Layout,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    label: '화면',
    borderColor: 'border-blue-200 dark:border-blue-800',
    selectedBorder: 'border-blue-500 ring-2 ring-blue-200',
    badgeStyle: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    handleColor: 'bg-blue-500',
    headerBg: 'bg-blue-50/50 dark:bg-blue-950/30',
  },
  data: {
    icon: Database,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    label: '데이터',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    selectedBorder: 'border-emerald-500 ring-2 ring-emerald-200',
    badgeStyle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    handleColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
  },
};

const ActionNode = ({ data, selected, id }: NodeProps) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [labelValue, setLabelValue] = useState(String(data.label || ''));
  const [descValue, setDescValue] = useState(String(data.description || ''));
  const labelInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const { updateNode } = useCanvasStore();

  const nodeType = String(data.nodeType || 'page');
  const styles = nodeTypeStyles[nodeType] || nodeTypeStyles.page;
  const IconComponent = styles.icon;

  // 데이터 연결 상태
  const selectedTable = String(data.selectedTable || '');
  const selectedColumn = String(data.selectedColumn || '');

  const handleTableChange = (tableName: string) => {
    updateNode(id, {
      selectedTable: tableName,
      selectedColumn: '',
    });
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

  return (
    <Card className={`w-64 shadow-md border-2 transition-all ${
      selected ? styles.selectedBorder : styles.borderColor
    }`}>
      {/* 헤더 - 노드 타입별 배경색 */}
      <CardHeader className={`p-3 pb-2 rounded-t-lg ${styles.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* 아이콘 - 배경 원 */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styles.iconBg}`}>
              <IconComponent className={`w-4 h-4 ${styles.iconColor}`} />
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
          <Badge className={`text-[10px] h-5 shrink-0 ml-2 border-0 ${styles.badgeStyle}`}>
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
        
        {/* 데이터 연결 */}
        <DataSelector
          selectedTable={selectedTable}
          selectedColumn={selectedColumn}
          onTableChange={handleTableChange}
          onColumnChange={handleColumnChange}
          className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
        />

        {!isEditingLabel && !isEditingDesc && (
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            💡 더블클릭하여 편집
          </p>
        )}
      </CardContent>
      
      {/* 4방향 Handle - 입력(target) */}
      <Handle type="target" position={Position.Top} id="top" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
      <Handle type="target" position={Position.Left} id="left" className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all" />
      
      {/* 4방향 Handle - 출력(source) */}
      <Handle type="source" position={Position.Bottom} id="bottom" className={`w-2.5 h-2.5 ${styles.handleColor} hover:scale-125 transition-all`} />
      <Handle type="source" position={Position.Right} id="right" className={`w-2.5 h-2.5 ${styles.handleColor} hover:scale-125 transition-all`} />
    </Card>
  );
};

export default memo(ActionNode);
