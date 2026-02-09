"use client";

import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';

// I need to check if Textarea is installed. I only installed Input. 
// I'll use a standard textarea with tailwind classes or just Input if it's single line.
// Ideally a chat input is multiline. I'll use a div wrapper around a textarea.

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="relative flex items-end gap-2">
        <textarea
          className="flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          placeholder="Ask Sisyphus to help you build..."
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          style={{ maxHeight: '120px' }}
        />
        <Button 
          size="icon" 
          onClick={handleSend} 
          disabled={!content.trim() || disabled}
          className="mb-[2px]"
        >
          <SendHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
