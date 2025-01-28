import React, { useState, useRef } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, files?: FileList) => void;
  onVoiceInput?: () => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, onVoiceInput, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || (fileInputRef.current?.files?.length ?? 0) > 0) {
      onSend(message, fileInputRef.current?.files ?? undefined);
      setMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      onSend(message, e.dataTransfer.files);
      setMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-colors duration-200"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-center space-x-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={() => {}}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
          disabled={isLoading}
        />
        
        {onVoiceInput && (
          <button
            type="button"
            onClick={onVoiceInput}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}