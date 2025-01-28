import React, { useState } from 'react';
import { FileIcon, ImageIcon, FileTextIcon, ChevronDown, ChevronUp, ExternalLink, Database, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  onReferenceClick: (reference: any) => void;
}

export function ChatMessage({ message, onReferenceClick }: ChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isBot = message.type === 'bot';
  const hasAttachments = isBot && (message.references?.length || message.images?.length || message.report);

  const handleAttachment = async (type: 'permanent' | 'session') => {
    try {
      // Create a temporary div with the message content for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div class="p-6">
          <div class="prose prose-sm max-w-none">
            ${message.content}
          </div>
          ${message.images?.map(img => `
            <div class="mt-4">
              <img src="${img.path}" alt="${img.name}" class="max-w-full rounded-lg"/>
            </div>
          `).join('') || ''}
        </div>
      `;

      // Convert the content to base64
      const base64Data = btoa(tempDiv.innerHTML);

      const response = await fetch('/api/attachment/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attachment: base64Data,
          usage_type: type,
          modification: false,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('Attachment uploaded successfully:', data.attachment_id);
      }
    } catch (error) {
      console.error('Error creating attachment:', error);
    }
  };

  return (
    <div
      className={`flex ${
        isBot ? 'justify-start' : 'justify-end'
      } mb-8 group animate-slideIn`}
    >
      <div
        className={`relative max-w-[80%] rounded-2xl p-6 ${
          isBot
            ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-xl transition-all duration-200'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 text-white ml-auto shadow-blue-500/20 hover:shadow-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-200'
        }`}
      >
        {/* Message Content with Markdown */}
        <div className={`mb-3 ${isBot ? 'prose prose-sm dark:prose-invert' : ''} max-w-none`}>
          {isBot ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="text-[15px] leading-relaxed">{message.content}</p>
          )}
        </div>

        {/* Images Grid */}
        {isBot && message.images && message.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {message.images.map((img) => (
              <div
                key={img.path}
                className="relative group/image rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => onReferenceClick(img)}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={img.path}
                    alt={img.name}
                    className="w-full h-32 object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/30 transition-all duration-200 flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover/image:opacity-100">
                  <ExternalLink className="text-white transform scale-90 group-hover/image:scale-100 transition-all duration-200" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Attachments Section */}
        {hasAttachments && (
          <div className={`mt-4 ${!isExpanded ? 'max-h-12 overflow-hidden' : ''}`}>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              {message.references?.map((ref) => (
                <button
                  key={ref.path}
                  onClick={() => onReferenceClick(ref)}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-3 w-full group/ref p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <FileIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate flex-1 text-left">{ref.name}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover/ref:opacity-100 transition-all duration-200 transform scale-90 group-hover/ref:scale-100" />
                </button>
              ))}
              
              {message.report && (
                <button
                  onClick={() => onReferenceClick(message.report)}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-full group/ref p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <FileTextIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate flex-1 text-left">{message.report.name}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover/ref:opacity-100 transition-all duration-200 transform scale-90 group-hover/ref:scale-100" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Attachment Options */}
        {isBot && (
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleAttachment('permanent')}
              className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 group/btn"
              title="Save to Database (Permanent)"
            >
              <Database className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </button>
            <button
              onClick={() => handleAttachment('session')}
              className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 group/btn"
              title="Save to Session (Temporary)"
            >
              <Clock className="w-4 h-4 text-green-500 dark:text-green-400" />
            </button>
          </div>
        )}

        {/* Expand Button */}
        {hasAttachments && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:transform hover:scale-110"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}

        {/* Timestamp */}
        <div className="absolute -bottom-6 text-xs text-gray-400 dark:text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}