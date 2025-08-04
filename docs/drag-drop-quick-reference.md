# Drag and Drop Quick Reference

## Quick Start

The drag and drop functionality is automatically enabled on all Kanban task cards. No additional setup is required.

## Usage

### Desktop (Mouse)
1. **Click and hold** any task card
2. **Drag** to the desired column
3. **Release** to drop the task
4. Task status updates automatically

### Mobile (Touch)
1. **Touch and hold** any task card
2. **Drag** to the desired column
3. **Release** to drop the task
4. Task status updates automatically

## Visual Feedback

### During Drag
- **Task Card**: Becomes semi-transparent and slightly rotated
- **Drop Zones**: Highlight with blue dashed border when dragged over
- **Column Text**: Changes to "Drop task in [Column Name]"

### Mobile Specific
- **Drag Preview**: Floating copy of the task card follows your finger
- **Touch Zones**: Columns highlight when task is dragged over them

## Status Updates

- **Real-time**: Changes sync across all connected team members within 2 seconds
- **Database**: Task status is immediately updated in Appwrite
- **Error Handling**: Failed updates are logged but don't break the interface

## Troubleshooting

### Common Issues

**Drag not working on desktop:**
- Ensure you're clicking and holding the task card
- Check browser console for JavaScript errors

**Touch drag not working on mobile:**
- Make sure you're using touch and hold gesture
- Verify the device supports touch events

**Status not updating:**
- Check network connection
- Verify Appwrite database permissions
- Look for error messages in browser console

**Visual feedback not appearing:**
- Ensure CSS is loading properly
- Check for conflicting styles
- Verify browser supports CSS transforms

### Debug Information

Enable debug logging by opening browser console. Drag and drop operations will log:
- Drag start events with task information
- Drop events with target column information
- Status update success/failure messages
- Error details for troubleshooting

## Technical Details

### Files Involved
- `src/components/TaskCard.jsx` - Draggable task cards
- `src/components/TaskColumn.jsx` - Drop zones
- `src/components/KanbanBoard.jsx` - Drag and drop coordination
- `src/hooks/useTouchDragDrop.jsx` - Mobile touch support
- `src/services/taskService.js` - Status update API calls

### CSS Classes
- `.dragging` - Applied to task being dragged
- `.drag-over` - Applied to drop zones during drag over
- `.touch-drag-over` - Applied to touch drop zones
- `.touch-manipulation` - Prevents scrolling during touch drag

## Browser Support

### Desktop
- Chrome 4+
- Firefox 3.5+
- Safari 3.1+
- Edge 12+

### Mobile
- iOS Safari 2+
- Android Browser 2.1+
- Chrome Mobile 18+
- Firefox Mobile 4+

## Performance Notes

- Drag operations are optimized to prevent excessive API calls
- Visual feedback uses CSS transforms for smooth animations
- Touch events properly prevent scrolling during drag operations
- Memory cleanup is handled automatically

## Related Documentation

- [Full Implementation Guide](./drag-drop-implementation.md)
- [Development Guide](./development-guide.md)
- [Dashboard Components](./dashboard-components.md)