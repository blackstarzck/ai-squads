"use client";

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bot } from 'lucide-react';

export const ChatPanel = () => {
  const { messages, isTyping, addMessage, setTyping } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSend = async (content: string) => {
    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    });

    // Simulate AI response
    setTyping(true);
    setTimeout(() => {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `I received your request: "${content}". \n\nI'm analyzing the requirements and updating the project plan.`,
        timestamp: new Date(),
      });
      setTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full border-l bg-background/50 backdrop-blur-sm">
      <div className="h-14 flex items-center px-4 border-b bg-muted/30">
        <Bot className="w-5 h-5 mr-2 text-blue-500" />
        <h2 className="font-semibold text-sm">PM Agent (Sisyphus)</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex items-center space-x-2 text-muted-foreground text-xs p-2">
              <Bot className="w-3 h-3 animate-bounce" />
              <span>Sisyphus is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
};
