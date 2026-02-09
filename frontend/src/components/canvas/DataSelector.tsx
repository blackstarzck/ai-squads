'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database } from 'lucide-react';
import { DB_SCHEMA } from '@/lib/dbSchema';
import { cn } from '@/lib/utils';

interface DataSelectorProps {
  /** 현재 선택된 테이블 키 */
  selectedTable: string;
  /** 현재 선택된 컬럼 이름 */
  selectedColumn: string;
  /** 테이블 변경 핸들러 */
  onTableChange: (tableName: string) => void;
  /** 컬럼 변경 핸들러 */
  onColumnChange: (columnName: string) => void;
  /** 추가 className */
  className?: string;
}

/**
 * 모든 노드에서 재사용 가능한 DB 테이블/컬럼 선택 컴포넌트.
 * DataNode에 하드코딩되어 있던 Select UI를 공용으로 분리.
 */
const DataSelector = ({
  selectedTable,
  selectedColumn,
  onTableChange,
  onColumnChange,
  className,
}: DataSelectorProps) => {
  const tableInfo = selectedTable ? DB_SCHEMA[selectedTable] : null;

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* 헤더 */}
      <div className="flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-[10px] font-medium text-muted-foreground">데이터 연결</span>
        {selectedTable && selectedColumn && (
          <code className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1 py-0.5 rounded ml-auto">
            {selectedTable}.{selectedColumn}
          </code>
        )}
      </div>

      {/* Select 컴포넌트 - 가로 배치 */}
      <div className="flex items-center gap-2">
        {/* 테이블 Select */}
        <Select value={selectedTable} onValueChange={onTableChange}>
          <SelectTrigger
            className="h-7 text-xs flex-1 border-slate-200 dark:border-slate-700 focus:ring-emerald-500"
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
          onValueChange={onColumnChange}
          disabled={!selectedTable}
        >
          <SelectTrigger
            className={cn(
              'h-7 text-xs flex-1 border-slate-200 dark:border-slate-700 focus:ring-emerald-500',
              !selectedTable && 'opacity-50',
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
    </div>
  );
};

export default DataSelector;
