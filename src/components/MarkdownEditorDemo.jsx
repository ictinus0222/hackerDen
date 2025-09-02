import React, { useState } from 'react';
import MarkdownEditor from './MarkdownEditor';

const MarkdownEditorDemo = () => {
  const [content, setContent] = useState(`# Welcome to the Markdown Editor

This is a **collaborative markdown editor** with the following features:

## Features
- Real-time preview
- Syntax highlighting
- Resizable panels
- Auto-save functionality
- Rich toolbar with common formatting options

### Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists
- Bullet point 1
- Bullet point 2
  - Nested item
- Bullet point 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

### Blockquote
> This is a blockquote example
> It can span multiple lines

### Links and Emphasis
Check out [this link](https://example.com) and some *italic text* or **bold text**.

You can also use ~~strikethrough~~ text and \`inline code\`.
`);

  const handleSave = (newContent) => {
    console.log('Auto-saving content:', newContent.length, 'characters');
    // In a real implementation, this would save to the backend
  };

  return (
    <div className="h-screen p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Markdown Editor Demo</h1>
        <p className="text-muted-foreground">
          Test the markdown editor component with real-time preview and auto-save.
        </p>
      </div>
      
      <div className="h-[calc(100vh-120px)]">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          onSave={handleSave}
          placeholder="Start writing your markdown document..."
          autoSave={true}
          autoSaveDelay={1000}
        />
      </div>
    </div>
  );
};

export default MarkdownEditorDemo;