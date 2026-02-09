'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvasStore';
import { cn } from '@/lib/utils';
import { DB_SCHEMA } from '@/lib/dbSchema';

const DataNode = ({ data, selected, id }: NodeProps) => {
  const { updateNode } = useCanvasStore();

  const selectedTable = String(data.selectedTable || '');
  const selectedColumn = String(data.selectedColumn || '');
  const tableInfo = selectedTable ? DB_SCHEMA[selectedTable] : null;

  const handleTableChange = (tableName: string) => {
    updateNode(id, { 
      selectedTable: tableName, 
      selectedColumn: '',
      label: DB_SCHEMA[tableName]?.label || tableName,
    });
  };

  const handleColumnChange = (columnName: string) => {
    updateNode(id, { selectedColumn: columnName });
  };

  return (
    <div
      className={cn(
        'w-72 rounded-xl border-2 bg-white dark:bg-slate-900 shadow-md transition-all p-3',
        selected
          ? 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800'
          : 'border-emerald-200 dark:border-emerald-800'
      )}
    >
      {/* 상단: 아이콘 + 뱃지 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50">
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          {selectedTable && selectedColumn && (
            <code className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
              {selectedTable}.{selectedColumn}
            </code>
          )}
        </div>
        <Badge className="text-[10px] h-5 border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          데이터
        </Badge>
      </div>

      {/* Select 컴포넌트들 - 가로 배치 */}
      <div className="flex items-center gap-2">
        {/* 테이블 Select */}
        <Select value={selectedTable} onValueChange={handleTableChange}>
          <SelectTrigger 
            className="h-8 text-xs flex-1 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue placeholder="테이블" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DB_SCHEMA).map(([key, value]) => (
              <SelectItem key={key} value={key} className="text-xs">
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 컬럼 Select */}
        <Select 
          value={selectedColumn} 
          onValueChange={handleColumnChange}
          disabled={!selectedTable}
        >
          <SelectTrigger 
            className={cn(
              "h-8 text-xs flex-1 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500",
              !selectedTable && "opacity-50"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue placeholder="컬럼" />
          </SelectTrigger>
          <SelectContent>
            {tableInfo?.columns.map((col) => (
              <SelectItem key={col.name} value={col.name} className="text-xs">
                {col.name}
                <span className="text-muted-foreground ml-1.5">({col.type})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4방향 Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-2.5 h-2.5 bg-muted-foreground/70 hover:bg-muted-foreground hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-2.5 h-2.5 bg-emerald-500 hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-2.5 h-2.5 bg-emerald-500 hover:scale-125 transition-all"
      />
    </div>
  );
};

export default memo(DataNode);
