'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fallback for server-side rendering or errors
  if (!isClient || error) {
    return (
      <div className="whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  try {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Style headings
            h1: ({ node, ...props }) => (
              <h1 className="text-lg font-bold mt-4 mb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-md font-bold mt-3 mb-2" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-semibold mt-3 mb-1" {...props} />
            ),
            // Style lists
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 my-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-5 my-2" {...props} />
            ),
            // Style code blocks
            code: ({ node, inline, className, children, ...props }: CodeProps) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vs}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md text-sm my-2 p-0"
                  showLineNumbers={true}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-muted/50 rounded-sm px-1 py-0.5 text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            // Style links
            a: ({ node, ...props }) => (
              <a 
                className="text-primary hover:underline" 
                target="_blank" 
                rel="noopener noreferrer" 
                {...props}
              />
            ),
            // Style blockquotes
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-primary/30 pl-3 py-1 my-2 italic bg-muted/20 rounded-sm" {...props} />
            ),
            // Style tables
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border-collapse border border-muted" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-muted/30" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="border border-muted px-3 py-2 text-left font-semibold" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="border border-muted px-3 py-2" {...props} />
            ),
            // Style paragraphs
            p: ({ node, ...props }) => (
              <p className="my-2" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  } catch (err) {
    console.error('Error rendering markdown:', err);
    setError(err instanceof Error ? err : new Error(String(err)));
    
    // Fallback to plain text
    return (
      <div className="whitespace-pre-wrap">
        {content}
      </div>
    );
  }
} 