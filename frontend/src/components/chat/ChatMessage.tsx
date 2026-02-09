"use client";

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAi = message.role === 'ai';

  return (
    <div className={cn("flex w-full mb-4", isAi ? "justify-start" : "justify-end")}>
      <div className={cn("flex max-w-[80%] gap-2", isAi ? "flex-row" : "flex-row-reverse")}>
        <Avatar className="w-8 h-8 border">
          <AvatarFallback className={isAi ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}>
            {isAi ? <Bot size={16} /> : <User size={16} />}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn(
          "p-3 rounded-lg text-sm",
          isAi 
            ? "bg-secondary text-secondary-foreground rounded-tl-none" 
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <span className="text-[10px] opacity-50 mt-1 block">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
