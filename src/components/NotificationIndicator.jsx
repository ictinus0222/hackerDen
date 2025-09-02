import { Badge } from './ui/badge';
import { Bell, BellRing } from 'lucide-react';
import { cn } from '../lib/utils';

const NotificationIndicator = ({ 
  unreadCount = 0, 
  className,
  showIcon = true,
  variant = 'default',
  onClick
}) => {
  const hasUnread = unreadCount > 0;

  if (!hasUnread && !showIcon) {
    return null;
  }

  return (
    <div 
      className={cn(
        "relative inline-flex items-center cursor-pointer",
        onClick && "hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={hasUnread ? `${unreadCount} unread notifications` : 'No unread notifications'}
    >
      {showIcon && (
        <div className="relative">
          {hasUnread ? (
            <BellRing className="w-5 h-5 text-primary animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 text-muted-foreground" />
          )}
          
          {hasUnread && (
            <div className="absolute -top-2 -right-2">
              <Badge 
                variant={variant}
                className={cn(
                  "min-w-[1.25rem] h-5 px-1 text-xs font-bold rounded-full",
                  "flex items-center justify-center",
                  "animate-bounce"
                )}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </div>
          )}
        </div>
      )}
      
      {!showIcon && hasUnread && (
        <Badge 
          variant={variant}
          className={cn(
            "min-w-[1.25rem] h-5 px-2 text-xs font-bold",
            "flex items-center justify-center"
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
};

export default NotificationIndicator;