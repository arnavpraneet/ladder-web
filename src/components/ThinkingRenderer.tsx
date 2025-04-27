'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react';

interface ThinkingRendererProps {
  content: string;
  isStreaming?: boolean;
}

export default function ThinkingRenderer({ content, isStreaming = false }: ThinkingRendererProps) {
  const [isThinkingVisible, setIsThinkingVisible] = useState(true);
  const [thinkingPart, setThinkingPart] = useState<string | null>(null);
  const [answerPart, setAnswerPart] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(isStreaming);

  // Process the content to separate thinking and answer parts
  useEffect(() => {
    const thinkEndIndex = content.indexOf('</think>');
    
    if (thinkEndIndex !== -1) {
      // We have a thinking section
      const thinking = content.substring(0, thinkEndIndex).trim();
      const answer = content.substring(thinkEndIndex + 8).trim(); // 8 is the length of '</think>'
      
      setThinkingPart(thinking);
      setAnswerPart(answer);
      setIsThinkingVisible(false); // Auto-collapse once thinking is complete
      setIsProcessing(false);
    } else if (content.includes('<think>')) {
      // Thinking is in progress, but not yet complete
      const thinkStartIndex = content.indexOf('<think>');
      const thinking = content.substring(thinkStartIndex + 7).trim(); // 7 is the length of '<think>'
      
      setThinkingPart(thinking);
      setAnswerPart(null);
      setIsThinkingVisible(true);
      setIsProcessing(true);
    } else {
      // No thinking tags, treat entire content as answer
      if (isStreaming) {
        // If we're streaming without <think> tag, show everything as thinking
        setThinkingPart(content);
        setAnswerPart(null);
      } else {
        // Otherwise, it's a complete answer
        setThinkingPart(null);
        setAnswerPart(content);
      }
      setIsProcessing(isStreaming);
    }
  }, [content, isStreaming]);

  // Toggle the visibility of the thinking section
  const toggleThinking = () => {
    setIsThinkingVisible(!isThinkingVisible);
  };

  if (isProcessing && thinkingPart) {
    // Still processing, show thinking part
    return (
      <div>
        <div className="flex items-center gap-2 mb-2 text-primary/70">
          <BrainCircuit size={16} className="animate-pulse" />
          <span className="text-sm font-medium">Thinking...</span>
        </div>
        <div className="bg-muted/10 rounded-md p-3 border border-primary/20 mb-2">
          <MarkdownRenderer content={thinkingPart} />
        </div>
      </div>
    );
  }

  // If streaming but no think tags are present, show content as is
  if (isStreaming && !thinkingPart && !answerPart) {
    return (
      <div className="whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  return (
    <div>
      {thinkingPart && (
        <div className="mb-3">
          <button
            onClick={toggleThinking}
            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm mb-1"
          >
            <BrainCircuit size={16} />
            <span>
              {isThinkingVisible ? 'Hide reasoning' : 'View reasoning'}
            </span>
            {isThinkingVisible ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>

          {isThinkingVisible && (
            <div className="bg-muted/10 rounded-md p-3 border border-primary/20 mb-2">
              <MarkdownRenderer content={thinkingPart} />
            </div>
          )}
        </div>
      )}

      {answerPart && <MarkdownRenderer content={answerPart} />}
    </div>
  );
} 