# MarkdownEditor Component

## Overview

The `MarkdownEditor` component is a feature-rich, collaborative markdown editor built for the HackerDen collaborative documents system. It provides real-time preview, syntax highlighting, a comprehensive toolbar, and auto-save functionality.

## Features

### Core Features
- **Split-pane Layout**: Resizable editor and preview panels using `react-resizable-panels`
- **Real-time Preview**: Live markdown rendering with GitHub Flavored Markdown support
- **Syntax Highlighting**: Code blocks highlighted using `highlight.js`
- **Rich Toolbar**: Common formatting buttons for headers, bold, italic, links, lists, etc.
- **Auto-save**: Debounced auto-save functionality with configurable delay
- **Toggle Views**: Switch between split view and editor-only mode

### Technical Features
- **Responsive Design**: Mobile-friendly layout with proper touch support
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Customizable**: Configurable placeholder text, auto-save settings, and styling
- **Performance**: Optimized rendering with proper React patterns

## Installation

The component requires the following dependencies:

```bash
npm install react-markdown remark-gfm rehype-highlight highlight.js
```

## Usage

### Basic Usage

```jsx
import MarkdownEditor from './components/MarkdownEditor';

function MyComponent() {
  const [content, setContent] = useState('# Hello World');

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  );
}
```

### Advanced Usage with Auto-save

```jsx
import MarkdownEditor from './components/MarkdownEditor';

function DocumentEditor() {
  const [content, setContent] = useState('');

  const handleSave = async (newContent) => {
    try {
      await documentService.updateDocument(documentId, { content: newContent });
      console.log('Document saved successfully');
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  return (
    <div className="h-screen">
      <MarkdownEditor
        value={content}
        onChange={setContent}
        onSave={handleSave}
        autoSave={true}
        autoSaveDelay={2000}
        placeholder="Start writing your document..."
        className="h-full"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The current markdown content |
| `onChange` | `function` | `undefined` | Callback fired when content changes |
| `onSave` | `function` | `undefined` | Callback fired for auto-save (receives content) |
| `placeholder` | `string` | `'Start writing your document...'` | Placeholder text for empty editor |
| `autoSave` | `boolean` | `true` | Enable/disable auto-save functionality |
| `autoSaveDelay` | `number` | `2000` | Auto-save delay in milliseconds |
| `className` | `string` | `undefined` | Additional CSS classes for the container |

## Toolbar Actions

The editor includes a comprehensive toolbar with the following actions:

### Headers
- **H1**: Insert level 1 heading (`# `)
- **H2**: Insert level 2 heading (`## `)
- **H3**: Insert level 3 heading (`### `)

### Text Formatting
- **Bold**: Wrap text in `**bold**`
- **Italic**: Wrap text in `*italic*`
- **Strikethrough**: Wrap text in `~~strikethrough~~`
- **Inline Code**: Wrap text in `` `code` ``

### Content Elements
- **Link**: Insert link format `[text](url)`
- **Bullet List**: Insert bullet point (`- `)
- **Numbered List**: Insert numbered item (`1. `)
- **Quote**: Insert blockquote (`> `)

## Keyboard Shortcuts

The editor supports standard text editing shortcuts:

- **Ctrl/Cmd + B**: Bold (via toolbar)
- **Ctrl/Cmd + I**: Italic (via toolbar)
- **Tab**: Indent (in textarea)
- **Shift + Tab**: Outdent (in textarea)

## Styling

The component uses Tailwind CSS classes and integrates with the existing HackerDen design system:

### CSS Classes Used
- `prose`: Typography styles for rendered markdown
- `border`, `rounded-lg`: Container styling
- `bg-muted/50`: Toolbar background
- `font-mono`: Monospace font for editor
- `text-muted-foreground`: Muted text colors

### Customization

You can customize the appearance by:

1. **Passing custom className**: Add additional styles to the container
2. **Modifying prose styles**: Override the prose classes for preview styling
3. **Theming**: The component respects dark/light theme settings

## Integration with HackerDen

The MarkdownEditor integrates seamlessly with HackerDen's existing systems:

### UI Components
- Uses existing `Button`, `Separator`, `Tooltip` components
- Follows established design patterns and spacing
- Integrates with the theme system

### Resizable Panels
- Uses the existing `ResizablePanelGroup` component
- Maintains consistent resize handle styling
- Supports both horizontal and vertical layouts

## Performance Considerations

### Optimization Features
- **Debounced Updates**: Auto-save uses debouncing to prevent excessive API calls
- **Efficient Rendering**: React.memo and useCallback for performance
- **Lazy Loading**: Markdown parsing only when content changes
- **Memory Management**: Proper cleanup of timeouts and event listeners

### Best Practices
- Use `autoSaveDelay` appropriate for your use case (1-5 seconds recommended)
- Implement proper error handling in `onSave` callback
- Consider implementing offline storage for draft content

## Testing

The component includes comprehensive tests covering:

- **Rendering**: Basic component rendering and props
- **User Interactions**: Toolbar actions, content editing, view toggling
- **Auto-save**: Debounced save functionality
- **Accessibility**: Screen reader support and keyboard navigation

### Running Tests

```bash
npm test -- --run src/components/__tests__/MarkdownEditor.test.jsx
```

## Accessibility

The component follows accessibility best practices:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for all features
- **Focus Management**: Proper focus handling for toolbar and editor
- **Semantic HTML**: Uses appropriate HTML elements for structure

## Browser Support

The component supports all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Planned improvements for the component:

1. **Collaborative Features**: Real-time cursor tracking and user presence
2. **Advanced Formatting**: Tables, task lists, and custom components
3. **Plugin System**: Extensible toolbar and rendering plugins
4. **Performance**: Virtual scrolling for large documents
5. **Mobile**: Enhanced touch gestures and mobile-specific features

## Troubleshooting

### Common Issues

**Issue**: Markdown not rendering in preview
- **Solution**: Ensure `react-markdown` and plugins are properly installed

**Issue**: Toolbar buttons not working
- **Solution**: Check that the textarea ref is properly set and focused

**Issue**: Auto-save not triggering
- **Solution**: Verify `onSave` callback is provided and `autoSave` is enabled

**Issue**: Styling issues
- **Solution**: Ensure Tailwind CSS is properly configured and highlight.js CSS is imported

### Debug Mode

Enable debug logging by adding:

```jsx
const handleSave = (content) => {
  console.log('Auto-saving:', content.length, 'characters');
  // Your save logic here
};
```

## Contributing

When contributing to the MarkdownEditor component:

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation for API changes
4. Test accessibility with screen readers
5. Verify mobile responsiveness

## License

This component is part of the HackerDen project and follows the same licensing terms.