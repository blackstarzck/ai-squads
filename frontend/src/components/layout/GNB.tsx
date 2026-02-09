"use client";

import React from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Share2, ShieldAlert, Menu } from 'lucide-react';

export const GNB = () => {
  const { projectName, version, riskScore } = useProjectStore();

  const getRiskColor = (score: number) => {
    if (score < 3) return 'bg-green-500';
    if (score < 7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            AI
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold leading-none">{projectName}</h1>
            <span className="text-[10px] text-muted-foreground">{version}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-md border">
          <ShieldAlert className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Risk Score:</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${getRiskColor(riskScore)}`} />
            <span className="text-xs font-bold">{riskScore}/10</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-border" />

        <Button size="sm" variant="outline" className="space-x-2">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </Button>
        <Button size="sm" className="space-x-2 bg-blue-600 hover:bg-blue-700">
          <Play className="w-4 h-4" />
          <span>Deploy</span>
        </Button>
      </div>
    </header>
  );
};
