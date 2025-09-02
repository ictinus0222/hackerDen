import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Keyboard, HelpCircle } from 'lucide-react';

const ChatKeyboardShortcuts = ({ shortcuts, className }) => {
  const [open, setOpen] = useState(false);

  const shortcutGroups = [
    {
      title: 'Navigation',
      shortcuts: [
        { key: '/', description: 'Focus message input' },
        { key: 'j or ↓', description: 'Scroll down' },
        { key: 'k or ↑', description: 'Scroll up' },
        { key: 'g', description: 'Go to bottom' },
        { key: 'Escape', description: 'Clear focus' }
      ]
    },
    {
      title: 'Actions',
      shortcuts: [
        { key: 'r', description: 'Mark messages as read' },
        { key: 'Enter', description: 'Send message (in input)' },
        { key: 'Shift + Enter', description: 'New line (in input)' }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`touch-target ${className}`}
          aria-label="Show keyboard shortcuts"
          title="Keyboard shortcuts (? to toggle)"
        >
          <Keyboard className="w-4 h-4" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate the chat more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-foreground mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div 
                    key={shortcut.key}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HelpCircle className="w-3 h-3" />
              <span>Press ? anywhere to toggle this help</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatKeyboardShortcuts;