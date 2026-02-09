"use client";

import React from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const stages = [
  { id: 'planning', label: 'Planning' },
  { id: 'designing', label: 'Designing' },
  { id: 'coding', label: 'Coding' },
  { id: 'qa', label: 'QA' },
] as const;

export const AgentStatusBar = () => {
  const { agentStatus } = useProjectStore();

  const getStatusIcon = (stageId: string) => {
    const currentIndex = stages.findIndex((s) => s.id === agentStatus);
    const stageIndex = stages.findIndex((s) => s.id === stageId);

    if (stageIndex < currentIndex) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (stageIndex === currentIndex && agentStatus !== 'idle') {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm p-2 rounded-full border shadow-sm">
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center">
          <div className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
            agentStatus === stage.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          )}>
            {getStatusIcon(stage.id)}
            <span>{stage.label}</span>
          </div>
          {index < stages.length - 1 && (
            <div className="w-4 h-[1px] bg-border mx-1" />
          )}
        </div>
      ))}
    </div>
  );
};
