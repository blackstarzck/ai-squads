"use client";

import React from 'react';
import { GNB } from '@/components/layout/GNB';
import { LNB } from '@/components/layout/LNB';
import { MainCanvas } from '@/components/layout/MainCanvas';
import { ChatPanel } from '@/components/layout/ChatPanel';
import { SubPanel } from '@/components/layout/SubPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function WorkspacePage() {
  return (
    <div className="flex flex-col h-full w-full">
      <GNB />
      
      <div className="flex flex-1 overflow-hidden pt-14">
        <LNB />
        
        <main className="flex-1 h-full overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={20}>
                  <MainCanvas />
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={30} minSize={10}>
                  <SubPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30} minSize={15}>
              <ChatPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
}
