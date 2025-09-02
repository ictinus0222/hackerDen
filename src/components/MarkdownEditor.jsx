import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Eye,
  Edit3
} from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { cn } from '../lib/utils';
import 'highlight.js/styles/github.css';

const MarkdownEditor = ({ 
  value = '', 
  onChange, 
  onSave,
  placeholder = 'Start writing your document...',
  autoSave = true,
  autoSaveDelay = 2000,
  className 
}) => {
  const [content, setContent] = useState(value);
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Handle content changes with debounced auto-save
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }

    // Auto-save functionality
    if (autoSave && onSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        onSave(newContent);
      }, autoSaveDelay);
    }
  }, [onChange, onSave, autoSave, autoSaveDelay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    setContent(value);
  }, [value]);

  // Toolbar action handlers
  const insertText = useCallback((before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end);
    
    handleContentChange(newContent);
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [content, handleContentChange]);

  const toolbarActions = [
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertText('# ', '', 'Heading 1')
    },
    {
      icon: Heading2,
      label: 'Heading 2', 
      action: () => insertText('## ', '', 'Heading 2')
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertText('### ', '', 'Heading 3')
    },
    { type: 'separator' },
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertText('**', '**', 'bold text')
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertText('*', '*', 'italic text')
    },
    {
      icon: Strikethrough,
      label: 'Strikethrough',
      action: () => insertText('~~', '~~', 'strikethrough text')
    },
    {
      icon: Code,
      label: 'Inline Code',
      action: () => insertText('`', '`', 'code')
    },
    { type: 'separator' },
    {
      icon: Link,
      label: 'Link',
      action: () => insertText('[', '](url)', 'link text')
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertText('- ', '', 'list item')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertText('1. ', '', 'list item')
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertText('> ', '', 'quote')
    }
  ];

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col h-full border rounded-lg overflow-hidden', className)} data-testid="markdown-editor">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-1">
          {toolbarActions.map((action, index) => {
            if (action.type === 'separator') {
              return <Separator key={index} orientation="vertical" className="h-6 mx-1" />;
            }
            
            const Icon = action.icon;
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={action.action}
                    className="h-8 w-8 p-0"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {action.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 px-3"
          >
            {showPreview ? (
              <>
                <Edit3 className="h-4 w-4 mr-1" />
                Edit Only
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 min-h-0">
        {showPreview ? (
          <ResizablePanelGroup direction="horizontal">
            {/* Editor Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="p-2 text-sm text-muted-foreground border-b">
                  Editor
                </div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 w-full p-4 resize-none border-0 outline-none focus:ring-0 font-mono text-sm leading-relaxed"
                  style={{ minHeight: '100%' }}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="p-2 text-sm text-muted-foreground border-b">
                  Preview
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                      // Custom components for better styling
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-medium mb-2 mt-4 first:mt-0">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed">{children}</p>
                      ),
                      code: ({ inline, children, ...props }) => (
                        inline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className="block bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto" {...props}>
                            {children}
                          </code>
                        )
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic my-4">
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      )
                      }}
                    >
                      {content || '*Start typing to see preview...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          // Editor only mode
          <div className="h-full">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full p-4 resize-none border-0 outline-none focus:ring-0 font-mono text-sm leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default MarkdownEditor;